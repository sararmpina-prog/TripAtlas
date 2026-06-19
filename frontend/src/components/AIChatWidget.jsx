import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { IoSend } from 'react-icons/io5';
import { FiPlus } from 'react-icons/fi';
import { LuPanelLeftOpen, LuPanelLeftClose } from "react-icons/lu";

import { getChatHistory, sendChatMessage } from '../api'; 
import { getStoredToken, getStoredUser } from '../auth/authStorage';

import '../styles/AIChatWidget.css';

export default function AIChatWidget() {
    const token = getStoredToken();
    const user = getStoredUser();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef(null);

    // ESTADOS DE CONTROLO DE INTERFACE
    const [inputValue, setInputValue] = useState('');
    const [localMessages, setLocalMessages] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 💡 Controla se o histórico está visível
    const [activeSessionId, setActiveSessionId] = useState('session-1'); // 💡 Simula a conversa ativa

    // ****** DADOS FICTÍCIOS **********
    const mockChatSessions = [
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

    const currentTripId = null;

    // CONSULTA REAL (Continuará ativa para quando o backend estiver pronto)
    const { data: serverHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['chat', 'global'],
        queryFn: () => getChatHistory(currentTripId, token),
        enabled: Boolean(token),
    });

    // SINCRONIZAÇÃO INTELIGENTE: Carrega as mensagens da conversa selecionada na barra lateral
    useEffect(() => {
        // Por enquanto, lê do nosso mock data com base na sessão ativa
        const currentSession = mockChatSessions.find(s => s.id === activeSessionId);
        
        if (currentSession) {
            setLocalMessages(currentSession.messages);
        } else {
            // Se clicar em "New Chat", inicia uma conversa em branco
            setLocalMessages([
                {
                    id: 'welcome-global',
                    sender: 'ai',
                    text: `Hello ${user?.first_name || 'Traveler'}! I'm your AI Travel Assistant. Ask me generic questions, plan itineraries from scratch, or look for inspiration for your next adventure!`
                }
            ]);
        }
    }, [activeSessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [localMessages]);

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

        // Otimismo Visual: Adiciona a mensagem imediatamente no ecrã
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Botão para abrir/fechar a barra de histórico */}
                    <button 
                        type="button" 
                        className="btn-toggle-sidebar" 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        title={isSidebarOpen ? "Hide history" : "Show history"}
                    >
                        {isSidebarOpen ? <LuPanelLeftClose size={20} /> : <LuPanelLeftOpen size={20} />}
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.1rem' }}>TripAtlas Chat</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Travel Assistant</p>
                    </div>
                </div>

                {/* Botão de Nova Conversa */}
                <button 
                    type="button" 
                    onClick={() => setActiveSessionId('new')}
                    title="Start clean conversation"
                    style={{ background: 'none', border: 'none', color: 'var(--color-orange)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', fontWeight: '700' }}
                >
                    <FiPlus size={16} /> New Chat
                </button>
            </div>
            
            {/* CORPO DO CHAT DIVIDIDO EM DOIS */}
            <div className="ai-chat-body">
                
                {/* BARRA LATERAL RETRÁTIL DE HISTÓRICO */}
                <div className={`ai-chat-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Recent Chats</p>
                    {mockChatSessions.map((session) => (
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
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
                        <input 
                            type="text"
                            placeholder="Ask about packing, itineraries..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={sendMessageMutation.isPending} 
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
