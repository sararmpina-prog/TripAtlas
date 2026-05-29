/* Orquestra o loop principal do TaskBot.

Responsabilidades:
- montar contexto conversacional
- pedir decisão à Gemini com tools
- validar e executar ações locais
- persistir a resposta final

Não contém regras de negócio de tarefas nem acesso SQL direto.
*/

import { callGeminiWithTaskToolsResponse } from '../../infra/ai/callGemini.js';
import { logGeminiDebug } from '../../infra/ai/aiDebugLogger.js';
import { TASKBOT_TOOLS_TEMPERATURE } from '../../infra/ai/legacy/taskBotGeminiConfig.js';
import { saveChat } from '../../infra/db/chatRepository.js';
import {
  clearPendingTaskActionByUser,
  getHistoryByUser,
  getPendingTaskActionByUser,
  getSummaryByUser,
  hydrateHistoryByUser,
  limitHistoryWithSummaryByUser,
  setPendingTaskActionByUser,
} from '../chatService.js';
import { executeTaskAction } from './taskService.js';
import { buildConversationContents } from '../chatContextUtils.js';
import {
  buildReplyWithExecutedActions,
  buildToolExecutionFallback,
  extractModelTurn,
} from './taskBotReplyService.js';
import {
  buildIntentFallbackReply,
  buildLocalChatReply,
  buildMixedScopeBoundaryReply,
  buildNoToolMutationReply,
  sanitizeTaskModelReply,
  buildStatelessLocalChatReply,
  buildTaskValidationClarification,
  createPendingTaskAction,
  buildTaskToolClarification,
  resumePendingTaskAction,
  shouldExecuteTaskTool,
} from '../taskBotIntentService.js';

const MAX_TOOL_STEPS = 5;

async function emitTaskBotEvent(onEvent, event) {
  if (typeof onEvent !== 'function') {
    return;
  }

  await onEvent(event);
}

function prependScopeBoundaryReply(message, reply) {
  const sanitizedReply = sanitizeTaskModelReply(message, reply);
  const scopeBoundaryReply = buildMixedScopeBoundaryReply(message);

  if (!scopeBoundaryReply) {
    return sanitizedReply;
  }

  return `${scopeBoundaryReply} ${sanitizedReply}`.trim();
}

function shouldPreferDeterministicToolReply(message, toolExecutions = []) {
  return Array.isArray(toolExecutions)
    && toolExecutions.length > 0
    && Boolean(buildMixedScopeBoundaryReply(message));
}

function buildToolActions(toolExecutions = []) {
  return toolExecutions.map(({ toolName, toolArgs, data }) => ({
    tool: toolName,
    args: toolArgs,
    data,
  }));
}

function sortObjectKeysDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeysDeep);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((accumulator, key) => {
        accumulator[key] = sortObjectKeysDeep(value[key]);
        return accumulator;
      }, {});
  }

  return value;
}

function buildToolExecutionSignature(toolName, toolArgs = {}) {
  return JSON.stringify({
    toolName,
    toolArgs: sortObjectKeysDeep(toolArgs),
  });
}

function hasRepeatedToolExecution(functionCall, toolExecutions = []) {
  const nextSignature = buildToolExecutionSignature(functionCall?.name, functionCall?.args || {});

  return toolExecutions.some(({ toolName, toolArgs }) => (
    buildToolExecutionSignature(toolName, toolArgs || {}) === nextSignature
  ));
}

function buildTaskBotResult({ reply, toolExecutions = [], stepCount = 0 }) {
  const actions = buildToolActions(toolExecutions);

  if (actions.length === 0) {
    return {
      type: 'chat',
      reply,
      tool: null,
      args: null,
      data: null,
      actions: [],
      toolCount: 0,
      stepCount,
    };
  }

  return {
    type: 'tool',
    reply,
    tool: actions.length === 1 ? actions[0].tool : null,
    args: actions.length === 1 ? actions[0].args : null,
    data: actions.length === 1 ? actions[0].data : actions,
    actions,
    toolCount: actions.length,
    stepCount,
  };
}

async function persistAssistantReply({ updatedHistory, userMessage, reply, userId, shouldSummarizeHistory = true }) {
  updatedHistory.push({
    role: 'model',
    parts: [{ text: reply }],
  });

  if (shouldSummarizeHistory) {
    await limitHistoryWithSummaryByUser(userId);
  }

  await saveChat({
    userMessage,
    aiResponse: reply,
    userId,
  });
}

function extractLatestModelText(history = []) {
  const latestModelEntry = [...history]
    .reverse()
    .find((entry) => entry?.role === 'model');

  if (!latestModelEntry?.parts?.length) {
    return '';
  }

  return latestModelEntry.parts
    .map((part) => part?.text || '')
    .join(' ')
    .trim();
}

function buildFunctionResponsePart(functionCall, data) {
  const functionResponse = {
    name: functionCall.name,
    response: {
      result: data,
    },
  };

  if (functionCall.id) {
    functionResponse.id = functionCall.id;
  }

  return { functionResponse };
}

function isRecoverableTaskValidationError(error) {
  return error?.statusCode === 400;
}

async function executePendingTaskAction({ message, pendingTaskAction, userId, updatedHistory }) {
  const resumedFunctionCall = resumePendingTaskAction(message, pendingTaskAction);

  if (!resumedFunctionCall) {
    return null;
  }

  clearPendingTaskActionByUser(userId);

  try {
    const data = await executeTaskAction(resumedFunctionCall);
    const toolExecutions = [{
      toolName: resumedFunctionCall.name,
      toolArgs: resumedFunctionCall.args || {},
      data,
    }];
    const reply = buildToolExecutionFallback(toolExecutions);

    await persistAssistantReply({ updatedHistory, userMessage: message, reply, userId });

    return buildTaskBotResult({ reply, toolExecutions, stepCount: 0 });
  } catch (error) {
    if (!isRecoverableTaskValidationError(error)) {
      throw error;
    }

    const clarificationReply = error.message || 'Preciso de mais detalhe para concluir essa ação.';
    const nextPendingTaskAction = createPendingTaskAction(resumedFunctionCall, clarificationReply);

    if (nextPendingTaskAction) {
      setPendingTaskActionByUser(userId, nextPendingTaskAction);
    }

    await persistAssistantReply({ updatedHistory, userMessage: message, reply: clarificationReply, userId });

    return buildTaskBotResult({
      reply: clarificationReply,
      toolExecutions: [],
      stepCount: 0,
    });
  }
}

export async function handleTaskBotMessage(message, userId, options = {}) {
  const { onEvent } = options;

  await emitTaskBotEvent(onEvent, {
    type: 'status',
    stage: 'received',
    message: 'Pedido recebido.',
  });

  logGeminiDebug('taskbot-loop', 'message-received', {
    userId,
    message,
  });

  const fastLocalReply = buildStatelessLocalChatReply(message);

  if (fastLocalReply) {
    const fastPathHistory = getHistoryByUser(userId);

    fastPathHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    logGeminiDebug('taskbot-loop', 'local-fast-path-short-circuit', {
      userId,
      reply: fastLocalReply,
    });

    await persistAssistantReply({
      updatedHistory: fastPathHistory,
      userMessage: message,
      reply: fastLocalReply,
      userId,
      shouldSummarizeHistory: false,
    });

    const result = buildTaskBotResult({
      reply: fastLocalReply,
      toolExecutions: [],
      stepCount: 0,
    });

    await emitTaskBotEvent(onEvent, {
      type: 'result',
      data: result,
    });

    return result;
  }

  await hydrateHistoryByUser(userId);

  const history = getHistoryByUser(userId);

  history.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const recentAssistantText = extractLatestModelText(history.slice(0, -1));
  const pendingTaskAction = getPendingTaskActionByUser(userId);

  if (pendingTaskAction) {
    const pendingActionResult = await executePendingTaskAction({
      message,
      pendingTaskAction,
      userId,
      updatedHistory: history,
    });

    if (pendingActionResult) {
      await emitTaskBotEvent(onEvent, {
        type: 'result',
        data: pendingActionResult,
      });

      return pendingActionResult;
    }
  }

  const localReply = buildLocalChatReply(message, recentAssistantText);

  if (localReply) {
    logGeminiDebug('taskbot-loop', 'local-reply-short-circuit', {
      userId,
      reply: localReply,
    });

    await persistAssistantReply({
      updatedHistory: history,
      userMessage: message,
      reply: localReply,
      userId,
      shouldSummarizeHistory: false,
    });

    const result = buildTaskBotResult({
      reply: localReply,
      toolExecutions: [],
    });

    await emitTaskBotEvent(onEvent, {
      type: 'result',
      data: result,
    });

    return result;
  }

  await limitHistoryWithSummaryByUser(userId);

  const updatedHistory = getHistoryByUser(userId);
  const summary = getSummaryByUser(userId);
  const contents = buildConversationContents(updatedHistory, summary);

  await emitTaskBotEvent(onEvent, {
    type: 'status',
    stage: 'thinking',
    message: 'A analisar a mensagem e a preparar o contexto.',
  });

  let response = await callGeminiWithTaskToolsResponse(contents, undefined, {
    temperature: TASKBOT_TOOLS_TEMPERATURE,
  });
  let toolExecutions = [];
  let lastReplyText = '';
  let step = 0;

  while (step < MAX_TOOL_STEPS) {
    const { modelContent, functionCalls, replyText } = extractModelTurn(response);
    lastReplyText = replyText || lastReplyText;

    logGeminiDebug('taskbot-loop', 'model-turn', {
      userId,
      step,
      functionCallCount: functionCalls.length,
      functionCalls: functionCalls.map((functionCall) => ({
        name: functionCall.name,
        args: functionCall.args || {},
      })),
      hasReplyText: Boolean(replyText),
    });

    if (!functionCalls.length) {
      const reply = toolExecutions.length > 0
        ? ((shouldPreferDeterministicToolReply(message, toolExecutions) ? '' : lastReplyText) || buildToolExecutionFallback(toolExecutions) || 'Preciso de mais contexto para ajudar com essa tarefa.')
        : (buildNoToolMutationReply(message) || lastReplyText || buildIntentFallbackReply(message));
      const finalReply = prependScopeBoundaryReply(message, reply);

      logGeminiDebug('taskbot-loop', 'loop-finished-with-reply', {
        userId,
        step,
        toolExecutionCount: toolExecutions.length,
        reply: finalReply,
      });

      await persistAssistantReply({ updatedHistory: updatedHistory, userMessage: message, reply: finalReply, userId });

      const result = buildTaskBotResult({ reply: finalReply, toolExecutions, stepCount: step + 1 });

      await emitTaskBotEvent(onEvent, {
        type: 'result',
        data: result,
      });

      return result;
    }

    for (const functionCall of functionCalls) {
      if (!shouldExecuteTaskTool(message, functionCall, recentAssistantText, toolExecutions)) {
        const reply = lastReplyText || buildIntentFallbackReply(message);
        const finalReply = prependScopeBoundaryReply(message, reply);

        logGeminiDebug('taskbot-loop', 'tool-blocked-by-intent-guard', {
          userId,
          step,
          tool: functionCall.name,
          args: functionCall.args || {},
          reply: finalReply,
        });

        await persistAssistantReply({ updatedHistory: updatedHistory, userMessage: message, reply: finalReply, userId });

        const result = buildTaskBotResult({
          reply: finalReply,
          toolExecutions: [],
          stepCount: step + 1,
        });

        await emitTaskBotEvent(onEvent, {
          type: 'result',
          data: result,
        });

        return result;
      }
    }

    const functionResponses = [];

    for (const functionCall of functionCalls) {
      if (hasRepeatedToolExecution(functionCall, toolExecutions)) {
        const reply = (shouldPreferDeterministicToolReply(message, toolExecutions) ? '' : lastReplyText) || buildToolExecutionFallback(toolExecutions) || 'Preciso de mais contexto para ajudar com essa tarefa.';
        const finalReply = prependScopeBoundaryReply(message, reply);

        logGeminiDebug('taskbot-loop', 'duplicate-tool-call-blocked', {
          userId,
          step,
          tool: functionCall.name,
          args: functionCall.args || {},
          reply: finalReply,
        });

        await persistAssistantReply({ updatedHistory: updatedHistory, userMessage: message, reply: finalReply, userId });

        const result = buildTaskBotResult({
          reply: finalReply,
          toolExecutions,
          stepCount: step + 1,
        });

        await emitTaskBotEvent(onEvent, {
          type: 'result',
          data: result,
        });

        return result;
      }

      await emitTaskBotEvent(onEvent, {
        type: 'tool',
        stage: 'pending',
        tool: functionCall.name,
        args: functionCall.args || {},
        message: `A preparar a ação ${functionCall.name}.`,
      });

      const clarificationReply = buildTaskToolClarification(message, functionCall);

      if (clarificationReply) {
        const reply = prependScopeBoundaryReply(message, buildReplyWithExecutedActions(clarificationReply, toolExecutions));
        const pendingTaskAction = createPendingTaskAction(functionCall, clarificationReply);

        if (pendingTaskAction) {
          setPendingTaskActionByUser(userId, pendingTaskAction);
        }

        logGeminiDebug('taskbot-loop', 'tool-needs-clarification', {
          userId,
          step,
          tool: functionCall.name,
          args: functionCall.args || {},
          reply,
        });

        await persistAssistantReply({ updatedHistory: updatedHistory, userMessage: message, reply, userId });

        const result = buildTaskBotResult({
          reply,
          toolExecutions,
          stepCount: step + 1,
        });

        await emitTaskBotEvent(onEvent, {
          type: 'result',
          data: result,
        });

        return result;
      }

      let data;

      try {
        await emitTaskBotEvent(onEvent, {
          type: 'status',
          stage: 'executing-tool',
          message: `A executar ${functionCall.name}.`,
        });

        data = await executeTaskAction(functionCall);
        clearPendingTaskActionByUser(userId);
      } catch (error) {
        if (!isRecoverableTaskValidationError(error)) {
          throw error;
        }

        const validationClarificationReply = buildTaskValidationClarification(
          message,
          functionCall,
          error.message,
        );

        const reply = buildReplyWithExecutedActions(
          validationClarificationReply || error.message || 'Preciso de mais detalhe para concluir essa ação.',
          toolExecutions,
        );
        const finalReply = prependScopeBoundaryReply(message, reply);
        const pendingTaskAction = createPendingTaskAction(functionCall, validationClarificationReply || error.message);

        if (pendingTaskAction) {
          setPendingTaskActionByUser(userId, pendingTaskAction);
        }

        logGeminiDebug('taskbot-loop', 'tool-validation-error', {
          userId,
          step,
          tool: functionCall.name,
          args: functionCall.args || {},
          reply: finalReply,
        });

        await persistAssistantReply({ updatedHistory: updatedHistory, userMessage: message, reply: finalReply, userId });

        const result = buildTaskBotResult({
          reply: finalReply,
          toolExecutions,
          stepCount: step + 1,
        });

        await emitTaskBotEvent(onEvent, {
          type: 'result',
          data: result,
        });

        return result;
      }

      const toolName = functionCall.name;
      const toolArgs = functionCall.args || {};

      logGeminiDebug('taskbot-loop', 'tool-executed', {
        userId,
        step,
        tool: toolName,
        args: toolArgs,
        data,
      });

      toolExecutions.push({
        toolName,
        toolArgs,
        data,
      });

      await emitTaskBotEvent(onEvent, {
        type: 'tool',
        stage: 'completed',
        tool: toolName,
        args: toolArgs,
        data,
        message: `Ação ${toolName} concluída.`,
      });

      functionResponses.push(buildFunctionResponsePart(functionCall, data));
    }

    if (modelContent?.parts?.length) {
      contents.push(modelContent);
    }

    contents.push({
      role: 'user',
      parts: functionResponses,
    });

    await emitTaskBotEvent(onEvent, {
      type: 'status',
      stage: 'thinking',
      message: 'A consolidar o resultado final.',
    });

    response = await callGeminiWithTaskToolsResponse(contents, undefined, {
      temperature: TASKBOT_TOOLS_TEMPERATURE,
    });
    step += 1;
  }

  const reply = (shouldPreferDeterministicToolReply(message, toolExecutions) ? '' : lastReplyText) || buildToolExecutionFallback(toolExecutions) || 'Preciso de mais contexto para ajudar com essa tarefa.';
  const finalReply = prependScopeBoundaryReply(message, reply);

  logGeminiDebug('taskbot-loop', 'loop-hit-max-steps', {
    userId,
    maxToolSteps: MAX_TOOL_STEPS,
    toolExecutionCount: toolExecutions.length,
    reply: finalReply,
  });

  await persistAssistantReply({ updatedHistory: updatedHistory, userMessage: message, reply: finalReply, userId });

  const result = buildTaskBotResult({ reply: finalReply, toolExecutions, stepCount: step });

  await emitTaskBotEvent(onEvent, {
    type: 'result',
    data: result,
  });

  return result;
}
