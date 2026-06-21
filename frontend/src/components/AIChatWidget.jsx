import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { IoSend } from 'react-icons/io5';
import { FiPlus } from 'react-icons/fi';
import { LuPanelLeftOpen, LuPanelLeftClose } from "react-icons/lu";

import { getChatHistory, sendChatMessage } from '../api'; 
import { getStoredToken, getStoredUser } from '../auth/authStorage';

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

    // ESTADOS DE CONTROLO DE INTERFACE
    const [inputValue, setInputValue] = useState('');
    const [localMessages, setLocalMessages] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
    const [activeSessionId, setActiveSessionId] = useState('session-1'); 

    const currentTripId = null;

    // CONSULTA REAL
    const { data: serverHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['chat', 'global'],
        queryFn: () => getChatHistory(currentTripId, token),
        enabled: Boolean(token),
    });

    // SINCRONIZAÇÃO INTELIGENTE: Carrega as mensagens da conversa selecionada na barra lateral
    useEffect(() => {
        const currentSession = MOCK_CHAT_SESSIONS.find(s => s.id === activeSessionId);
        
        if (currentSession) {
            setLocalMessages(currentSession.messages);
        } else {
            setLocalMessages([
                {
                    id: 'welcome-global',
                    sender: 'ai',
                    text: `Hello ${user?.first_name || 'Traveler'}! I'm your AI Travel Assistant. Ask me generic questions, plan itineraries from scratch, or look for inspiration for your next adventure!`
                }
            ]);
        }
    }, [activeSessionId, user?.first_name]);

    // Scroll automático para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [localMessages]);

    // Auto-ajuste de altura do textarea conforme o user vai escrevendo
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [inputValue]);

    // MUTATION REAL PARA ENVIAR MENSAGENS
    const sendMessageMutation = useMutation({
        mutationFn: (chatPayload) => sendChatMessage(chatPayload, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat', 'global'] });
        }
    });

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || sendMessageMutation.isPending) return;
        const textToSend = inputValue.trim();
        setInputValue('');
        
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        setLocalMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
        sendMessageMutation.mutate({
            user_id: Number(user?.id),
            trip_id: null,
            user_message: textToSend
        });
    };

    return (
        <div className="ai-chat-container">
            {/* CABEÇALHO DO CHAT */}
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
                    onClick={() => setActiveSessionId('new')}
                    title="Start clean conversation"
                >
                    <FiPlus size={16} /> New Chat
                </button>
            </div>
            
            {/* CORPO DO CHAT DIVIDIDO EM DOIS */}
            <div className="ai-chat-body">
                
                {/* BARRA LATERAL RETRÁTIL DE HISTÓRICO */}
                <div className={`ai-chat-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                    <p>Recent Chats</p>
                    {MOCK_CHAT_SESSIONS.map((session) => (
                        <button
                            key={session.id}
                            type="button"
                            className={`ai-chat-history-item ${activeSessionId === session.id ? 'active' : ''}`}
                            onClick={() => setActiveSessionId(session.id)}
                        >
                            {session.title}
                        </button>
                    ))}
                </div>

                {/* ÁREA DE CONVERSA PRINCIPAL */}
                <div className="ai-chat-main">
                    <div className="ai-chat-messages">
                        {localMessages.map((msg, index) => (
                            <div key={index} className={`chat-bubble-wrapper ${msg.sender}`}>
                                <div className={`chat-bubble ${msg.sender}-bubble`}>
                                    {msg.text}
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
                        <button type="submit" disabled={sendMessageMutation.isPending || !inputValue.trim()}>
                            <IoSend size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
