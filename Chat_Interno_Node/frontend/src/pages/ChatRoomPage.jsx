    import { useEffect, useState, useRef } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { useAuth } from '../context/AuthContext';
    import axios from 'axios';
    import { io } from 'socket.io-client';
    import './ChatRoomPage.css';

    export default function ChatRoomPage() {
        const { id } = useParams();
        const navigate = useNavigate();
        const { token, user } = useAuth();
        const [messages, setMessages] = useState([]);
        const [newMsg, setNewMsg] = useState('');
        const [newUser, setNewUser] = useState('');
        const [feedback, setFeedback] = useState('');
        const socketRef = useRef(null);
        const messagesEndRef = useRef(null);

        // Buscar histórico
        useEffect(() => {
            axios.get(`${import.meta.env.VITE_API_URL}/api/rooms/${id}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setMessages(res.data))
                .catch(err => console.error('Erro ao buscar histórico:', err));
        }, [id, token]);

        // Conectar WebSocket
        useEffect(() => {
            socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
                auth: { token }
            });

            socketRef.current.emit('joinRoom', parseInt(id));

            socketRef.current.on('receiveMessage', (msg) => {
                setMessages(prev => [...prev, msg]);
            });

            return () => {
                socketRef.current.disconnect();
            };
        }, [id, token]);

        const sendMessage = () => {
            if (!newMsg.trim()) return;

            socketRef.current.emit('sendMessage', {
                roomId: parseInt(id),
                message: newMsg
            });

            setNewMsg('');
        };

        useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, [messages]);

        const adicionarUsuario = async () => {
            if (!newUser.trim()) return;

            try {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/rooms/${id}/add`, {
                    username: newUser
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setFeedback(`Usuário "${newUser}" adicionado com sucesso!`);
                setNewUser('');
            } catch (err) {
                console.error(err);
                setFeedback('Erro ao adicionar usuário.');
            }
        };

        return (
            <div className="chat-page-container">
                <div className="chat-container">
                    <div className="chat-room-header">
                        <button className="back-button" onClick={() => navigate('/rooms')}>
                            ← Voltar
                        </button>
                        <h2>Chat da Sala {id}</h2>
                        <div className="add-user-header">
                            <input
                                className="user-input"
                                value={newUser}
                                onChange={(e) => setNewUser(e.target.value)}
                                placeholder="Adicionar usuário"
                                onKeyDown={(e) => e.key === 'Enter' && adicionarUsuario()}
                            />
                            <button className="add-button" onClick={adicionarUsuario}>+</button>
                        </div>
                    </div>

                    <div className="chat-messages-container">
                        <div className="chat-messages">
                            {messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`message ${msg.sender === user?.username ? 'message-sent' : 'message-received'}`}
                                >
                                    <div className="message-sender">{msg.sender || user?.username}</div>
                                    <div className="message-content">{msg.message || msg.content}</div>
                                    <div className="message-time">
                                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="chat-input-area">
                        <input
                            className="chat-input"
                            placeholder="Digite sua mensagem..."
                            value={newMsg}
                            onChange={(e) => setNewMsg(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button className="send-button" onClick={sendMessage}>Enviar</button>
                    </div>
                </div>

                {feedback && <div className="feedback-message">{feedback}</div>}
            </div>
        );
    }