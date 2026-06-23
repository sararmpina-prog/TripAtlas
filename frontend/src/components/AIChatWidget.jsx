import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
    getChatHistory,
    getChatSessions,
    sendChatMessage
} from '../api';

import {
    getStoredToken,
    getStoredUser
} from '../auth/authStorage';

import '../styles/AIChatWidget.css';

export default function AIChatWidget() {
    const token = getStoredToken();
    const user = getStoredUser();

    const queryClient = useQueryClient();
    const messagesEndRef = useRef(null);

    const [inputValue, setInputValue] = useState('');
    const [localMessages, setLocalMessages] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [activeChatId, setActiveChatId] = useState(null);

    /*
    =====================================================
    CHAT SESSIONS
    =====================================================
    */

    const { data: chatSessions = [] } = useQuery({
        queryKey: ['chatSessions'],
        queryFn: () => getChatSessions(token),
        enabled: Boolean(token)
    });

    /*
    =====================================================
    CHAT HISTORY
    =====================================================
    */

    const { data: serverHistory} = useQuery({
        queryKey: ['chat', activeChatId],
        queryFn: () => getChatHistory(activeChatId, token),
        enabled: Boolean(token && activeChatId),

    });

    console.log("serverHistory =", serverHistory);

    /*
    =====================================================
    LOAD HISTORY INTO UI
    =====================================================
    */

       useEffect(() => {
            if (!serverHistory) return;

            setLocalMessages(serverHistory.data ?? serverHistory);
        }, [serverHistory]);

    /*
    =====================================================
    AUTO SCROLL
    =====================================================
    */

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    }, [localMessages]);

    /*
    =====================================================
    SEND MESSAGE
    =====================================================
    */

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

    /*
    =====================================================
    HANDLE SEND
    =====================================================
    */

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!inputValue.trim()) return;

        if (sendMessageMutation.isPending) return;

        const textToSend = inputValue.trim();

        setInputValue('');

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

    /*
    =====================================================
    NEW CHAT
    =====================================================
    */

    const handleNewChat = () => {
        setActiveChatId(null);
        setLocalMessages([]);
    };

    /*
    =====================================================
    OPEN EXISTING CHAT
    =====================================================
    */

    const handleOpenChat = (chatId) => {
        console.log('Opening chat:', chatId);

        setActiveChatId(chatId);
    };

    /*
    =====================================================
    UI
    =====================================================
    */

    return (
        <div className="ai-chat-container">

            <div className="ai-chat-header">

                <div className="ai-chat-header-left">

                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? 'Hide' : 'Show'}
                    </button>

                    <div>
                        <h2>TripAtlas Chat</h2>
                        <p>AI Travel Assistant</p>
                    </div>
                </div>

                <button onClick={handleNewChat}>
                    + New Chat
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

                        <button
                            type="submit"
                            disabled={
                                !inputValue.trim() ||
                                sendMessageMutation.isPending
                            }
                        >
                            Send
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}