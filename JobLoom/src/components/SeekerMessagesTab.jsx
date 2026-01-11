import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

const SeekerMessagesTab = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Fetch Conversations (Employers from Applied Jobs)
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                // Get applied jobs
                const res = await api.get('/jobs/applied');
                if (res.data.success) {
                    // Extract unique employers from applications
                    const applications = res.data.data;
                    const employersMap = new Map();

                    applications.forEach(app => {
                        if (app.job && app.job.employer) {
                            const emp = app.job.employer;
                            // Check if employer object is populated or just an ID
                            if (typeof emp === 'object' && emp._id) {
                                if (!employersMap.has(emp._id)) {
                                    employersMap.set(emp._id, {
                                        _id: emp._id,
                                        name: emp.companyName || emp.name || 'Employer',
                                        profilePhoto: emp.companyLogo || emp.profilePhoto, // Fallback
                                        headline: 'Recruiter' // Default headline
                                    });
                                }
                            }
                        }
                    });

                    setConversations([...employersMap.values()]);
                }
            } catch (err) {
                console.error("Failed to fetch conversations", err);
            }
        };
        fetchConversations();
    }, []);

    // Fetch Messages when active conversation changes
    useEffect(() => {
        if (!activeConversation) return;

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/messages/${activeConversation._id}`);
                if (res.data.success) {
                    setMessages(res.data.data);
                    scrollToBottom();
                }
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };
        fetchMessages();
    }, [activeConversation]);

    // Socket Listener for incoming messages
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (message) => {
            if (activeConversation && (message.sender === activeConversation._id || message.recipient === activeConversation._id)) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
        });

        return () => socket.off('receive_message');
    }, [socket, activeConversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        try {
            const res = await api.post('/messages', {
                recipientId: activeConversation._id,
                content: newMessage
            });

            if (res.data.success) {
                setMessages([...messages, res.data.data]);
                setNewMessage('');
                scrollToBottom();
            }
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    return (
        <div className={`chat-container ${activeConversation ? 'active-chat' : ''}`} style={{ marginTop: '0' }}>
            {/* Sidebar List */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h3 className="h3" style={{ fontSize: '1.25rem', margin: 0 }}>Messages</h3>
                </div>
                <div className="chat-list">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-muted">
                            <p>No conversations yet.</p>
                            <small>Apply to jobs to start chatting with employers.</small>
                        </div>
                    ) : (
                        conversations.map(contact => (
                            <div
                                key={contact._id}
                                onClick={() => setActiveConversation(contact)}
                                className={`chat-item ${activeConversation?._id === contact._id ? 'active' : ''}`}
                            >
                                <img
                                    src={contact.profilePhoto || `https://ui-avatars.com/api/?name=${contact.name}`}
                                    alt={contact.name}
                                    className="chat-item-avatar"
                                />
                                <div className="chat-item-info">
                                    <div className="chat-item-name">{contact.name}</div>
                                    <div className="chat-item-subtitle">{contact.headline}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="chat-main">
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="chat-header">
                            <button
                                className="back-button btn-icon"
                                onClick={() => setActiveConversation(null)}
                                style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <img
                                src={activeConversation.profilePhoto || `https://ui-avatars.com/api/?name=${activeConversation.name}`}
                                alt={activeConversation.name}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>{activeConversation.name}</h3>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ width: '8px', height: '8px', background: 'var(--color-success)', borderRadius: '50%' }}></span>
                                    Online
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages">
                            {messages.map((msg, index) => {
                                const isMe = msg.sender === user._id || msg.sender === user.id;
                                return (
                                    <div key={index} className={`message-bubble ${isMe ? 'me' : 'other'}`}>
                                        <div>{msg.content}</div>
                                        <div className="message-time">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="chat-input-area">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="chat-input"
                            />
                            <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="chat-empty-state">
                        <div className="chat-empty-icon">
                            <i className="fas fa-comments"></i>
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Select a Conversation</h3>
                        <p>Choose an employer to chat with.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeekerMessagesTab;
