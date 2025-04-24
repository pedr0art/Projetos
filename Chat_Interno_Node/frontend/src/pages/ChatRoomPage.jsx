import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';

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
        <div style={{ maxWidth: 600, margin: '40px auto' }}>
            <h2>Chat da Sala {id}</h2>

            <div style={{
                border: '1px solid #ccc',
                padding: 10,
                height: 300,
                overflowY: 'auto',
                marginBottom: 10
            }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ marginBottom: 5 }}>
                        <strong>{msg.sender || user?.username}:</strong> {msg.message || msg.content}
                    </div>
                ))}
                <div ref={msgRef} />
            </div>

            <input
                style={{ width: '80%' }}
                placeholder="Digite sua mensagem..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Enviar</button>

            <div style={{ marginTop: 20 }}>
                <h4>Adicionar usuário à sala</h4>
                <input
                    value={newUser}
                    onChange={(e) => setNewUser(e.target.value)}
                    placeholder="Nome de usuário"
                    style={{ marginRight: 10 }}
                />
                <button onClick={adicionarUsuario}>Adicionar</button>
                {feedback && <p style={{ color: 'green', marginTop: 5 }}>{feedback}</p>}
            </div>
        </div>
    );
}
