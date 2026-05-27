/* Configuração do TaskBot para integração com a Gemini. */

import { createSystemPrompt } from '../../../utils/legacy/createSystemPrompt.js';
import {
  createTaskTool,
  updateTaskTool,
  deleteTaskTool,
  filterTasksTool,
} from './tools.js';

export const TASKBOT_TOOLS_TEMPERATURE = 0.2;
export const TASKBOT_REPLY_TEMPERATURE = 0.1;

export function buildTaskBotConfig(config = {}) {
  return {
    systemInstruction: createSystemPrompt(),
    ...config,
  };
}

export function getTaskToolsConfig() {
  return {
    tools: [
      {
        functionDeclarations: [
          createTaskTool,
          updateTaskTool,
          deleteTaskTool,
          filterTasksTool,
        ],
      },
    ],
  };
}
