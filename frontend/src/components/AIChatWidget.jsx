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

    // UI state
    const [inputValue, setInputValue] = useState('');
    const [localMessages, setLocalMessages] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // chat state (single source of truth)
    const [activeChatId, setActiveChatId] = useState(null);

    /*
    =====================================================
    GET CHAT HISTORY (por chat_id)
    =====================================================
    */
    const { data: serverHistory } = useQuery({
        queryKey: ['chat', activeChatId],
        queryFn: () => getChatHistory(activeChatId, token),
        enabled: Boolean(token && activeChatId),
    });

    /*
    =====================================================
    sync server → UI
    =====================================================
    */
    useEffect(() => {
        if (!serverHistory) return;
        setLocalMessages(serverHistory);
    }, [serverHistory]);

    /*
    =====================================================
    scroll bottom
    =====================================================
    */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [localMessages]);

    /*
    =====================================================
    SEND MESSAGE
    =====================================================
    */
    const sendMessageMutation = useMutation({
        mutationFn: (payload) => sendChatMessage(payload, token),

        onSuccess: (response) => {
            setLocalMessages((prev) => [
                ...prev,
                {
                    sender: 'ai',
                    text: response.data?.ai_response || response.data?.reply || response.message
                }
            ]);

            queryClient.invalidateQueries({
                queryKey: ['chat', activeChatId]
            });
        }
    });

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || sendMessageMutation.isPending) return;

        const textToSend = inputValue.trim();
        setInputValue('');

        // optimistic UI
        setLocalMessages((prev) => [
            ...prev,
            { sender: 'user', text: textToSend }
        ]);

        sendMessageMutation.mutate({
            user_id: Number(user?.id),
            chat_id: activeChatId,
            user_message: textToSend,
            trip_id: null
        });
    };

    /*
    =====================================================
    NEW CHAT
    =====================================================
    */
    const handleNewChat = () => {
        const newChatId = uuidv4();
        setActiveChatId(newChatId);
        setLocalMessages([]);
    };

    /*
    =====================================================
    UI
    =====================================================
    */
    return (
        <div className="ai-chat-container">

            {/* HEADER */}
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
                >
                    + New Chat
                </button>
            </div>

            {/* BODY */}
            <div className="ai-chat-body">

                {/* SIDEBAR (placeholder — depois liga à DB) */}
                <div className={`ai-chat-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                    <p>Recent Chats</p>

                    {/* AQUI DEPOIS substituis por API real */}
                    <button
                        onClick={() => {
                            const id = uuidv4();
                            setActiveChatId(id);
                            setLocalMessages([]);
                        }}
                    >
                        New session
                    </button>
                </div>

                {/* CHAT */}
                <div className="ai-chat-main">

                    <div className="ai-chat-messages">
                        {localMessages.map((msg, i) => (
                            <div key={i} className={`chat-bubble-wrapper ${msg.sender}`}>
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

                    {/* INPUT */}
                    <form onSubmit={handleSendMessage} className="ai-chat-input-area">
                        <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask something..."
                            disabled={sendMessageMutation.isPending}
                        />

                        <button
                            type="submit"
                            disabled={!inputValue.trim() || sendMessageMutation.isPending}
                        >
                            Send
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}