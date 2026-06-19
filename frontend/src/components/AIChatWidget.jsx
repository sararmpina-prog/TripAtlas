import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoSend } from 'react-icons/io5';
import { getChatHistory, sendChatMessage } from '../api'; 
import { getStoredToken, getStoredUser } from '../auth/authStorage';
import '../styles/AIChatWidget.css';

export default function AIChatWidget() {
    const token = getStoredToken();
    const user = getStoredUser();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef(null);

    const [inputValue, setInputValue] = useState('');
    const [localMessages, setLocalMessages] = useState([]);

    // O tripId passa a ser sempre null para conversas globais do utilizador
    const currentTripId = null;

    // CONSULTA: Puxa o histórico genérico de conversas do user logado
    const { data: serverHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['chat', 'global'], // Chave estática global
        queryFn: () => getChatHistory(currentTripId, token),
        enabled: Boolean(token),
    });

    // Sincroniza o histórico antigo
    useEffect(() => {
        if (serverHistory?.data && serverHistory.data.length > 0) {
            const formattedMessages = [];
            serverHistory.data.forEach((chat, index) => {
                formattedMessages.push({ id: `u-${index}`, sender: 'user', text: chat.user_message });
                formattedMessages.push({ id: `ai-${index}`, sender: 'ai', text: chat.ai_response });
            });
            setLocalMessages(formattedMessages);
        } else {
            setLocalMessages([
                {
                    id: 'welcome-global',
                    sender: 'ai',
                    text: `Hello ${user?.first_name || 'Traveler'}! I'm your AI Travel Assistant. Ask me generic questions about travels, plan itineraries from scratch, or look for inspiration for your next adventure!`
                }
            ]);
        }
    }, [serverHistory]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [localMessages]);

    // MUTATION: Envia a mensagem global
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

        setLocalMessages((prev) => [...prev, { id: 'temp-user', sender: 'user', text: textToSend }]);

        sendMessageMutation.mutate({
            user_id: Number(user?.id),
            trip_id: null,
            user_message: textToSend
        });
    };

    return (
        <div className="ai-chat-container">
            <div className="ai-chat-header">
                <div>
                    <h2>AI Assistant</h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Connected as {user?.first_name}</p>
                </div>
            </div>
            
            <div className="ai-chat-messages">
                {isLoadingHistory ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>Loading your conversation history...</p>
                ) : (
                    localMessages.map((msg, index) => (
                        <div key={index} className={`chat-bubble-wrapper ${msg.sender}`}>
                            <div className={`chat-bubble ${msg.sender}-bubble`}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                {sendMessageMutation.isPending && (
                    <div className="chat-bubble-wrapper ai">
                        <div className="chat-bubble ai-bubble typing">
                            Assistant is typing...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="ai-chat-input-area">
                <input 
                    type="text"
                    placeholder="Ask about hotels, planning, or packing items..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={sendMessageMutation.isPending} 
                />
                <button type="submit" disabled={sendMessageMutation.isPending || !inputValue.trim()}>
                    <IoSend size={18} />
                </button>
            </form>
        </div>
    );
}
