import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Suporte a cache real
import { IoSend } from 'react-icons/io5';
import { BiMessageSquareAdd } from 'react-icons/bi';
import { getChatHistory, sendChatMessage } from '../api'; 
import { getStoredToken, getStoredUser } from '../auth/authStorage';
import '../styles/AIChatCard.css';

// Quando o utilizador clica em "New Chat", o AIChatCard chama onTripChange(''), que limpa a viagem ativa no Dashboard.
// O Dashboard, por sua vez, atualiza o estado selectedTripId para '', o que faz com que o AIChatCard recarregue sem um tripId específico, ativando assim o modo de chat genérico sem contexto de viagem.
export default function AIChatCard({ selectedTrip, onTripChange }) {
    const token = getStoredToken();
    const user = getStoredUser();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef(null);

    const [inputValue, setInputValue] = useState('');
    const [localMessages, setLocalMessages] = useState([]);

    // Extrai o ID da viagem se ela existir, caso contrário envia null (Pergunta Genérica)
    const currentTripId = selectedTrip?.id ? Number(selectedTrip.id) : null;

    // CONSULTA: Vai buscar o histórico real à BD com base no utilizador e na viagem ativa
    const { data: serverHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['chat', currentTripId],
        queryFn: () => getChatHistory(currentTripId, token),
        enabled: Boolean(token),
    });

    // Sincroniza as mensagens do servidor com o estado local do ecrã
    useEffect(() => {
        if (serverHistory?.data) {
            // Transforma o formato achatado do SQL (user_message + ai_response) num formato legível de chat
            const formattedMessages = [];
            serverHistory.data.forEach((chat, index) => {
                formattedMessages.push({ id: `u-${index}`, sender: 'user', text: chat.user_message });
                formattedMessages.push({ id: `ai-${index}`, sender: 'ai', text: chat.ai_response });
            });
            setLocalMessages(formattedMessages);
        } else {
            // Mensagem de boas-vindas padrão se não houver histórico na BD
            setLocalMessages([
                {
                    id: 'welcome',
                    sender: 'ai',
                    text: selectedTrip?.destination 
                        ? `Hi! I'm your Trip Assistant. Ask me anything about your trip to ${selectedTrip.destination}!`
                        : "Hi! Need inspiration? Get instant suggestions for your next adventure!"
                }
            ]);
        }
    }, [serverHistory, selectedTrip]);

    // Auto-scroll automático
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [localMessages]);

    // MUTATION: Envia a nova mensagem para o Express e guarda no SQL (chat_history)
    const sendMessageMutation = useMutation({
        mutationFn: (chatPayload) => sendChatMessage(chatPayload, token),
        onSuccess: () => {
            // Invalida a cache para recarregar o histórico updated_at com a resposta da AI
            queryClient.invalidateQueries({ queryKey: ['chat', currentTripId] });
        }
    });

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || sendMessageMutation.isPending) return;

        const textToSend = inputValue.trim();
        setInputValue('');

        // Otimismo Visual: Adiciona a mensagem do utilizador no ecrã imediatamente
        setLocalMessages((prev) => [...prev, { id: 'temp-user', sender: 'user', text: textToSend }]);

        // Dispara o payload exato mapeado com as colunas do MySQL
        sendMessageMutation.mutate({
            user_id: Number(user?.id),
            trip_id: currentTripId, 
            user_message: textToSend
        });
    };

    const handleNewGenericChat = () => {
        if (onTripChange) {
            onTripChange(''); // Limpa a viagem ativa no Dashboard e ativa o modo genérico
        }
    };

    return (
        <div className="ai-chat-container">
            {/* CABEÇALHO COM AÇÕES */}
            <div className="ai-chat__header">
                <div>
                    <h2>Trip Assistant</h2>
                    <p className="ai-badge">
                        {selectedTrip ? `Context: ${selectedTrip.destination}` : 'Generic Conversation'}
                    </p>
                </div>
                
                {/* Botão discreto para desassociar da viagem e abrir chat livre */}
                <button 
                    type="button" 
                    title="Start generic chat (No trip)"
                    onClick={handleNewGenericChat}
                   >
                    <BiMessageSquareAdd size={20} /> New Chat
                </button>
            </div>
            
            {/* ÁREA DE TEXTO */}
            <div className="ai-chat__messages">
                {isLoadingHistory ? (
                    <p>Loading conversation history...</p>
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
                            Trip Assistant is typing...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* BARRA INFERIOR DE INPUT */}
            <form onSubmit={handleSendMessage} className="ai-chat-input-area">
                <input 
                    type="text"
                    placeholder={isLoadingHistory ? "Loading conversation history..." : "Ask about hotels, planning, or packing items..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={sendMessageMutation.isPending} 
                />
                <button
                    type="submit" 
                    disabled={sendMessageMutation.isPending || !inputValue.trim()} 
                >
                    <IoSend size={18} />
                </button>
            </form>
        </div>
    );
} 
