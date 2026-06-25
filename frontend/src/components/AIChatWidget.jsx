import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from "react-markdown";

import { IoSend } from 'react-icons/io5';
import { FiPlus } from 'react-icons/fi';
import { LuPanelLeftOpen, LuPanelLeftClose } from "react-icons/lu";

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

// ******* MOCKDATA TEMPORÁRIO - SUBSTITUIR PELA API REAL DE HISTÓRICO DE CONVERSAS *********
const MOCK_CHAT_SESSIONS = [
    { id: 'session-1', title: '💡 Packing list Easter', messages: [
        { sender: 'user', text: 'What should I pack for a 5-day Easter break?' },
        { sender: 'ai', text: 'For a 5-day Easter break, I recommend layers, comfortable walking shoes, a light raincoat, and a small first-aid kit.' }
    ]},
    { id: 'session-2', title: '🍕 Rome restaurants', messages: [
        { sender: 'user', text: 'Give me hidden gem restaurants in Rome' },
        { sender: 'ai', text: 'In Rome, avoid tourist traps and try "Trattoria Da Enzo al 29" in Trastevere for amazing carbonara.' }
    ]},
    { id: 'session-3', title: '🗺️ Weekend in Paris', messages: [
        { sender: 'user', text: 'Plan a 2-day itinerary for Paris' },
        { sender: 'ai', text: 'Day 1: Louvre and Eiffel Tower. Day 2: Montmartre, Notre Dame, and a cruise along the Seine.' }
    ]}
];

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

    console.log("serverHistory =", serverHistory);

    /* LOAD HISTORY INTO UI */

       useEffect(() => {
            if (!serverHistory) return;

            setLocalMessages(serverHistory.data ?? serverHistory);
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

    // MUTATION REAL PARA ENVIAR MENSAGENS
    const sendMessageMutation = useMutation({
        mutationFn: (payload) => sendChatMessage(payload, token),

        onSuccess: (response) => {
            console.log('POST response:', response);

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
        }
    });

    /* HANDLE SEND */

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!inputValue.trim()) return;

        if (sendMessageMutation.isPending) return;

        const textToSend = inputValue.trim();

        setInputValue('');
        
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

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

    /* NEW CHAT */

    const handleNewChat = () => {
        setActiveChatId(null);
        setLocalMessages([]);
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
                    >
                        {isSidebarOpen ? 'Hide' : 'Show'}
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
                            disabled={sendMessageMutation.isPending}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />

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