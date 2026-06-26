import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from "react-markdown";
<<<<<<< HEAD
import { IoSend } from 'react-icons/io5';
import { BiMessageSquareAdd } from 'react-icons/bi';

=======

import { IoSend } from 'react-icons/io5';
import { FiPlus } from 'react-icons/fi';
import { LuPanelLeftOpen, LuPanelLeftClose } from "react-icons/lu";

import { mapApiServerError } from '../validators/apiValidator';
>>>>>>> frontend-limpo
import {
    getChatHistory,
    getChatSessions,
    sendChatMessage
} from '../api';

import {
    getStoredToken,
    getStoredUser
<<<<<<< HEAD
} from '../auth/authStorage';
=======
} from '../utils/authStorage';
>>>>>>> frontend-limpo

import '../styles/AIChatWidget.css';

export default function AIChatWidget() {
    const token = getStoredToken();
    const user = getStoredUser();

    const queryClient = useQueryClient();
    const messagesEndRef = useRef(null);
<<<<<<< HEAD
=======
    const textareaRef = useRef(null);
>>>>>>> frontend-limpo

    const [inputValue, setInputValue] = useState('');
    const [localMessages, setLocalMessages] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [activeChatId, setActiveChatId] = useState(null);
<<<<<<< HEAD

    /*
    =====================================================
    CHAT SESSIONS
    =====================================================
    */
=======
    const [chatError, setChatError] = useState(''); // Banner de erro global do chat

    const MAX_PROMPT_CHARS = 2000; // Define o limite máximo de caracteres

    /* CHAT SESSIONS */
>>>>>>> frontend-limpo

    const { data: chatSessions = [] } = useQuery({
        queryKey: ['chatSessions'],
        queryFn: () => getChatSessions(token),
        enabled: Boolean(token)
    });

<<<<<<< HEAD
    /*
    =====================================================
    CHAT HISTORY
    =====================================================
    */
=======
    /* 
    CHAT HISTORY */
>>>>>>> frontend-limpo

    const { data: serverHistory} = useQuery({
        queryKey: ['chat', activeChatId],
        queryFn: () => getChatHistory(activeChatId, token),
        enabled: Boolean(token && activeChatId),

    });

    console.log("serverHistory =", serverHistory);

<<<<<<< HEAD
    /*
    =====================================================
    LOAD HISTORY INTO UI
    =====================================================
    */
=======
    /* LOAD HISTORY INTO UI */
>>>>>>> frontend-limpo

       useEffect(() => {
            if (!serverHistory) return;

            setLocalMessages(serverHistory.data ?? serverHistory);
<<<<<<< HEAD
        }, [serverHistory]);

    /*
    =====================================================
    AUTO SCROLL
    =====================================================
    */

=======
            setChatError(''); // Limpa erros antigos ao carregar um histórico
        }, [serverHistory]);


    /* AUTO SCROLL */
    // Scroll automático para a última mensagem
>>>>>>> frontend-limpo
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    }, [localMessages]);

<<<<<<< HEAD
    /*
    =====================================================
    SEND MESSAGE
    =====================================================
    */

=======
    /* AUTO RESIZE TEXTAREA */
    // Auto-ajuste de altura do textarea conforme o user vai escrevendo
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [inputValue]);

    // MUTATION REAL PARA ENVIAR MENSAGENS COM TRATAMENTO DE ERROS GLOBAL
>>>>>>> frontend-limpo
    const sendMessageMutation = useMutation({
        mutationFn: (payload) => sendChatMessage(payload, token),

        onSuccess: (response) => {
            console.log('POST response:', response);

<<<<<<< HEAD
=======
            setChatError(''); // Sucesso limpa erros residuais
>>>>>>> frontend-limpo
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
        },

        onError: (error) => {
            console.error(error);
<<<<<<< HEAD
        }
    });

    /*
    =====================================================
    HANDLE SEND
    =====================================================
    */
=======
            // Passar o array 'prompt'
            const result = mapApiServerError(error, ['prompt', 'user_message'], 'Unable to deliver message to AI.');
            
            // Grava a frase no ecrã para avisar o utilizador
            setChatError(result.fieldErrors.prompt || result.fieldErrors.user_message || result.formError);
            
            // Remove a última bolha do utilizador se o envio falhou para não enganar na UI
            setLocalMessages((prev) => prev.slice(0, -1));
        }
    
    });

    /* HANDLE SEND */
>>>>>>> frontend-limpo

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!inputValue.trim()) return;

        if (sendMessageMutation.isPending) return;

        const textToSend = inputValue.trim();

        setInputValue('');
<<<<<<< HEAD
=======
        setChatError(''); // Reset o banner de erro na nova tentativa

        if (textareaRef.current) textareaRef.current.style.height = 'auto';
>>>>>>> frontend-limpo

        setLocalMessages((prev) => [
            ...prev,
            {
                sender: 'user',
                text: textToSend
            }
        ]);

        sendMessageMutation.mutate({
            user_message: textToSend,
            chat_id: activeChatId,
            trip_id: null
        });
    };

<<<<<<< HEAD
    /*
    =====================================================
    NEW CHAT
    =====================================================
    */
=======
    /* NEW CHAT */
>>>>>>> frontend-limpo

    const handleNewChat = () => {
        setActiveChatId(null);
        setLocalMessages([]);
<<<<<<< HEAD
    };

    /*
    =====================================================
    OPEN EXISTING CHAT
    =====================================================
    */
=======
        setChatError('');
    };

    /* OPEN EXISTING CHAT */
>>>>>>> frontend-limpo

    const handleOpenChat = (chatId) => {
        console.log('Opening chat:', chatId);

        setActiveChatId(chatId);
    };

<<<<<<< HEAD
    /*
    =====================================================
    UI
    =====================================================
    */
=======
    /* UI */
>>>>>>> frontend-limpo

    return (
        <div className="ai-chat-container">

            <div className="ai-chat-header">

                <div className="ai-chat-header-left">
<<<<<<< HEAD

                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? 'Hide' : 'Show'}
                    </button>

=======
                    <button 
                        type="button" 
                        className="btn-toggle-sidebar" 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        title={isSidebarOpen ? "Hide history" : "Show history"}
                    >
                        {isSidebarOpen ? <LuPanelLeftClose size={20} /> : <LuPanelLeftOpen size={20} />}
                    </button>
                    
>>>>>>> frontend-limpo
                    <div>
                        <h2>TripAtlas Chat</h2>
                        <p>AI Travel Assistant</p>
                    </div>
                </div>

<<<<<<< HEAD
                <button onClick={handleNewChat}>
                     <BiMessageSquareAdd size={18}/>
                    New Chat
=======
                <button 
                    type="button" 
                    onClick={handleNewChat}
                    title="Start clean conversation"
                >
                     <FiPlus size={16} /> New Chat
>>>>>>> frontend-limpo
                </button>
            </div>

            <div className="ai-chat-body">

                <div
                    className={`ai-chat-sidebar ${
                        isSidebarOpen ? 'open' : 'closed'
                    }`}
                >
<<<<<<< HEAD
                    <p>Recent Chats</p>

                    {chatSessions.map((chat) => (
                        <button
                            key={chat.chat_id}
                            onClick={() => handleOpenChat(chat.chat_id)}
                            className={
                                activeChatId === chat.chat_id
                                    ? 'active-chat'
                                    : ''
                            }
                        >
                            {chat.title ||
                                `New Chat`}
                        </button>
                    ))}
                </div>

=======
                    <div className="chat-history-list">
                        {/* O .slice(0, 5) garante que só aparecem as 5 conversas mais recentes */}
                        {chatSessions.slice(0, 5).map((chat) => (
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
>>>>>>> frontend-limpo
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

<<<<<<< HEAD
                        <div ref={messagesEndRef} />
                    </div>

                    <form
                        onSubmit={handleSendMessage}
                        className="ai-chat-input-area"
                    >
                        <input
                            value={inputValue}
                            onChange={(e) =>
                                setInputValue(e.target.value)
                            }
                            placeholder="Ask something..."
                            disabled={sendMessageMutation.isPending}
                        />
=======
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
>>>>>>> frontend-limpo

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