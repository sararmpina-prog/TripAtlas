import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from "react-markdown";

import { IoSend } from 'react-icons/io5';
import { FiPlus } from 'react-icons/fi';
import { LuPanelLeftOpen, LuPanelLeftClose } from "react-icons/lu";

import { mapApiServerError } from '../validators/apiValidator';
import {
    getChatHistory,
    getChatSessions,
    sendChatMessage
} from '../api';

import {
    getStoredToken,
    getStoredUser
} from '../utils/authStorage';

import '../styles/AIChatWidget.css';

export default function AIChatWidget() {
    const token = getStoredToken();
    const user = getStoredUser();

    const queryClient = useQueryClient();
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const [inputValue, setInputValue] = useState('');
    const [localMessages, setLocalMessages] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [activeChatId, setActiveChatId] = useState(null);
    const [chatError, setChatError] = useState(''); // Banner de erro global do chat

    const MAX_PROMPT_CHARS = 2000; // Define o limite máximo de caracteres

    /* CHAT SESSIONS */

    const { data: chatSessions = [] } = useQuery({
        queryKey: ['chatSessions'],
        queryFn: () => getChatSessions(token),
        enabled: Boolean(token)
    });


    /* 
    CHAT HISTORY */

    const { data: serverHistory} = useQuery({
        queryKey: ['chat', activeChatId],
        queryFn: () => getChatHistory(activeChatId, token),
        enabled: Boolean(token && activeChatId),

    });

    // console.log("serverHistory =", serverHistory);

    /* LOAD HISTORY INTO UI */

       useEffect(() => {
            if (!serverHistory) return;

            setLocalMessages(serverHistory.data ?? serverHistory);
            setChatError(''); // Limpa erros antigos ao carregar um histórico
        }, [serverHistory]);


    /* AUTO SCROLL */
    // Scroll automático para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    }, [localMessages]);

    /* AUTO RESIZE TEXTAREA */
    // Auto-ajuste de altura do textarea conforme o user vai escrevendo
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [inputValue]);

    // MUTATION REAL PARA ENVIAR MENSAGENS COM TRATAMENTO DE ERROS GLOBAL
    const sendMessageMutation = useMutation({
        mutationFn: (payload) => sendChatMessage(payload, token),

        onSuccess: (response) => {
            console.log('POST response:', response);

            setChatError(''); // Sucesso limpa erros residuais
            const backendChatId = response?.data?.chat_id;

            if (!activeChatId && backendChatId) {
                setActiveChatId(backendChatId);
            }

            setLocalMessages((prev) => [
                ...prev,
                {
                    sender: 'ai',
                    text: response?.data?.reply || ''
                }
            ]);

            queryClient.invalidateQueries({
                queryKey: ['chatSessions']
            });

            queryClient.invalidateQueries({
                queryKey: ['chat', backendChatId || activeChatId]
            });

            queryClient.invalidateQueries({
                queryKey: ['dashboard', 'journal']
            });
        },

        onError: (error) => {
            console.error(error);
            // Passar o array 'prompt'
            const result = mapApiServerError(error, ['prompt', 'user_message'], 'Unable to deliver message to AI.');
            
            // Grava a frase no ecrã para avisar o utilizador
            setChatError(result.fieldErrors.prompt || result.fieldErrors.user_message || result.formError);
            
            // Remove a última bolha do utilizador se o envio falhou para não enganar na UI
            setLocalMessages((prev) => prev.slice(0, -1));
        }
    
    });

    /* HANDLE SEND */

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!inputValue.trim()) return;

        if (sendMessageMutation.isPending) return;

        const textToSend = inputValue.trim();

        setInputValue('');
        setChatError(''); // Reset o banner de erro na nova tentativa

        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        setLocalMessages((prev) => [
            ...prev,
            {
                sender: 'user',
                text: textToSend
            }
        ]);

        // O payload lê dinamicamente a prop ativa e envia em silêncio
        sendMessageMutation.mutate({
            user_message: textToSend,
            chat_id: activeChatId,
            trip_id: null
        });
    };

    /* NEW CHAT */

    const handleNewChat = () => {
        setActiveChatId(null);
        setLocalMessages([]);
        setChatError('');
    };

    /* OPEN EXISTING CHAT */

    const handleOpenChat = (chatId) => {
        console.log('Opening chat:', chatId);

        setActiveChatId(chatId);
    };

    /* UI */

    return (
        <div className="ai-chat-container">

            <div className="ai-chat-header">

                <div className="ai-chat-header-left">
                    <button 
                        type="button" 
                        className="btn-toggle-sidebar" 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        title={isSidebarOpen ? "Hide history" : "Show history"}
                    >
                        {isSidebarOpen ? <LuPanelLeftClose size={20} /> : <LuPanelLeftOpen size={20} />}
                    </button>
                    
                    <div>
                        <h2>TripAtlas Chat</h2>
                        <p>AI Travel Assistant</p>
                    </div>
                </div>

                <button 
                    type="button" 
                    onClick={handleNewChat}
                    title="Start clean conversation"
                >
                     <FiPlus size={16} /> New Chat
                </button>
            </div>

            <div className="ai-chat-body">

                <div
                    className={`ai-chat-sidebar ${
                        isSidebarOpen ? 'open' : 'closed'
                    }`}
                >
                    <div className="chat-history-list">
            
                        {chatSessions.map((chat) => (
                            <button
                                key={chat.chat_id}
                                type="button"
                                /*  Lógica idêntica à do TripSidePanel para destacar o botão ativo */
                                className={
                                    String(chat.chat_id) === String(activeChatId)
                                        ? 'ai-chat-history-item active'
                                        : 'ai-chat-history-item'
                                }
                                onClick={() => handleOpenChat(chat.chat_id)}
                            >
                                {chat.title || `New Chat`}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="ai-chat-main">

                    <div className="ai-chat-messages">

                        {localMessages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chat-bubble-wrapper ${msg.sender}`}
                            >
                                <div
                                    className={`chat-bubble ${msg.sender}-bubble`}
                                >
                                    {msg.sender === "ai" ? (
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}

                        {sendMessageMutation.isPending && (
                            <div className="chat-bubble-wrapper ai">
                                <div className="chat-bubble ai-bubble typing">
                                    Assistant is typing...
                                </div>
                            </div>
                        )}

                        {/* EXIBIÇÃO VISUAL DO BANNER DE ERRO DA API */}
                        {chatError && (
                            <div className="chat-bubble-wrapper system-error">
                                <div className="auth-form-error api-error-banner">
                                    {chatError}
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* FORMULÁRIO DE ENTRADA DE TEXTO */}
                    {/* Textarea permite:
                        - várias linhas
                        - Shift + Enter cria nova linha
                        - Enter envia a mensagem
                    É mais parecido com a interação dos chats do que com um formulário tradicional */}
                    <form onSubmit={handleSendMessage} className="ai-chat-input-area">
                        <textarea 
                            ref={textareaRef}
                            rows={1}
                            placeholder="Ask about packing, itineraries..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            maxLength={MAX_PROMPT_CHARS}
                            disabled={sendMessageMutation.isPending}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />
                        {/* Contador visual de caracteres opcional (Fica muito profissional) */}
                        <span className="char-counter">
                            {inputValue.length} / {MAX_PROMPT_CHARS}
                        </span>

                        <button
                            type="submit"
                            disabled={
                                !inputValue.trim() ||
                                sendMessageMutation.isPending
                            }
                        >
                            <IoSend size={18}/>
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}

/*
O fluxo:
Frontend (React) ➔ Envia um pedido para a API local (POST /api/ai/chat);
    Este pedido leva a mensagem em texto.

O Backend (Node.js) ➔ Recebe o pedido.
    Vai à base de dados MySQL buscar o texto do contexto (ex: Destino: Évora, Título: Weekend Getaway).

A API da AI (chatOrchestrator) ➔ Envia o pedido para os servidores da Google Gemini.
    O que é enviado para a Google: Apenas o texto limpo ("You are in Évora...")  .O que NUNCA é enviado para a Google: O ID do utilizador ou da viagem.
    O robô nunca vê esses números estruturais.

Google Gemini ➔ Processa o texto, gera a sugestão em inglês britânico e decide acionar a ferramenta (Tool Calling).
    Ela cospe apenas isto em JSON: {"title": "Évora Itinerary", "content": "..."}.
    
O Backend (Node.js) ➔ Recebe o JSON da Google e faz o INSERT INTO ai_suggestions de forma segura e autónoma.

Em Resumo: O backend funciona como um escudo de privacidade. Ele filtra os dados, envia apenas texto de turismo para a API da AI (Google) e guarda os IDs em segredo dentro do próprio ecossistema.
*/