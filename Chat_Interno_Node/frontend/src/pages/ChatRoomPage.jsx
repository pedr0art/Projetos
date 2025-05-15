import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import './ChatRoomPage.css';

export default function ChatRoomPage() {
    const { id } = useParams();
    const { token, user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [newUser, setNewUser] = useState('');
    const [feedback, setFeedback] = useState('');
    const socketRef = useRef(null);
    const msgRef = useRef(null);

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
        msgRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        <div className="chat-container">
            <div className="chat-header">
                Chat da Sala {id}
            </div>

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`message ${msg.sender === user?.username ? 'message-sent' : 'message-received'}`}
                    >
                        <div className="message-sender">{msg.sender || user?.username}</div>
                        <div className="message-content">{msg.message || msg.content}</div>
                        <div className="message-time">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                ))}
                <div ref={msgRef} />
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

            <div className="user-management">
                <h4>Adicionar usuário à sala</h4>
                <div className="user-input-area">
                    <input
                        className="user-input"
                        value={newUser}
                        onChange={(e) => setNewUser(e.target.value)}
                        placeholder="Nome de usuário"
                    />
                    <button className="add-button" onClick={adicionarUsuario}>Adicionar</button>
                </div>
                {feedback && <div className="feedback-message">{feedback}</div>}
            </div>
        </div>
    );
}