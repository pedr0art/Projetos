// ChatRoomPage.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import './ChatRoomPage.css';

export default function ChatRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const {
    socket,
    allOnlineUsers,
    setCurrentRoomId,
    addMessageListener,
    removeMessageListener,
  } = useSocket();

  const [roomName, setRoomName] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [feedback, setFeedback] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [allSectors, setAllSectors] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/rooms/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error('Erro ao buscar histórico:', err));
  }, [id, token]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const room = res.data;
        setRoomName(room.name);
        setRoomInfo(room);

      if (room.is_finished) {
        alert('Esta sala foi finalizada. Você será redirecionado.');
        navigate('/rooms');
      }

      })
    .catch((err) => {
      console.error('Erro ao buscar nome da sala:', err);
      alert('Erro ao carregar sala. Redirecionando...');
      navigate('/rooms');
    });
}, [id, token, navigate]);

  useEffect(() => {
    if (!socket || !user?.id) return;

    socket.emit('joinRoom', parseInt(id));
    setCurrentRoomId(id);

    const handleMessage = (msg) => {
      if (msg.roomId === parseInt(id)) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    addMessageListener(handleMessage);

    return () => {
      removeMessageListener(handleMessage);
      setCurrentRoomId(null);
    };
  }, [id, socket, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAllUsers(res.data))
      .catch((err) => console.error('Erro ao buscar usuários:', err));

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/sectors`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAllSectors(res.data))
      .catch((err) => console.error('Erro ao buscar setores:', err));
  }, [token]);

  const sendMessage = () => {
    if (!newMsg.trim() || !socket) return;
    socket.emit('sendMessage', {
      roomId: parseInt(id),
      message: newMsg,
    });
    setNewMsg('');
  };

  const adicionarUsuario = async () => {
    if (!selectedUser) {
      setFeedback('Selecione um usuário antes de adicionar.');
      return;
    }

    const confirmacao = window.confirm(
      `Deseja realmente adicionar "${selectedUser.full_name}" à conversa?`
    );
    if (!confirmacao) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/rooms/${id}/add`,
        {
          full_name: selectedUser.full_name,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFeedback(`Usuário "${selectedUser.full_name}" adicionado com sucesso!`);
      setSelectedUser(null);
      setFilterText('');
      setFilterSector('');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setFeedback('Erro ao adicionar usuário.');
    }
  };

  const userIdsNaSala = roomInfo?.users?.map((u) => u.id) || [];

  const filteredUsers = allUsers.filter((u) => {
    const matchName = u.full_name.toLowerCase().includes(filterText.toLowerCase());
    const matchSector = filterSector ? u.sector_id === parseInt(filterSector) : true;
    const notSelf = u.id !== user.id;
    const notInRoom = !userIdsNaSala.includes(u.id);
    return matchName && matchSector && notSelf && notInRoom;
  });

  return (
    <div className="chat-page-container">
      <div className="chat-container">
        <div className="chat-room-header">
          <button className="back-button" onClick={() => navigate('/rooms')}>
            ← Voltar
          </button>
          <h2>{roomName || 'Carregando...'}</h2>

          {roomInfo?.is_group && (user.sector_id === 29 || user.sector_id === 6) && (
            <button className="add-user-button" onClick={() => setIsModalOpen(true)}>
              Adicionar usuário
            </button>
          )}
        </div>

        <div className="chat-messages-container">
          <div className="chat-messages">
            {messages.map((msg, index) => {
              const isMyMessage = msg.sender_id === user.id;

              return (
                <div
                  key={index}
                  className={`message ${isMyMessage ? 'message-sent' : 'message-received'}`}
                >
                  <div className="message-sender">
                    {msg.sender} {msg.sector_name ? `(${msg.sector_name})` : ''}
                  </div>
                  <div className="message-content">{msg.message || msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              );
            })}
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
          <button className="send-button" onClick={sendMessage}>
            Enviar
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Adicionar Usuário à Sala</h3>

            <input
              className="user-input"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filtrar por nome"
            />

            <select
              className="sector-select"
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
            >
              <option value="">Todos os setores</option>
              {allSectors.map((sector) => (
                <option key={sector.sector_id} value={sector.sector_id}>
                  {sector.sector_name}
                </option>
              ))}
            </select>

            <div className="user-list">
              {filteredUsers.length > 0 ? (
                [...filteredUsers]
                  .sort((a, b) => {
                    const aOnline = allOnlineUsers.some((u) => u.id === a.id);
                    const bOnline = allOnlineUsers.some((u) => u.id === b.id);
                    return (aOnline === bOnline) ? 0 : aOnline ? -1 : 1;
                  })
                  .map((u) => {
                    const isOnline = allOnlineUsers.some((ou) => ou.id === u.id);
                    return (
                      <div
                        key={u.id}
                        className={`user-list-item ${selectedUser?.id === u.id ? 'selected' : ''} ${isOnline ? 'online' : ''}`}
                        onClick={() => setSelectedUser(u)}
                      >
                        {u.full_name} ({u.sector_name}) {isOnline ? '🟢' : ''}
                      </div>
                    );
                  })
              ) : (
                <div className="user-list-item no-user">Nenhum usuário encontrado.</div>
              )}
            </div>

            <div className="modal-buttons">
              <button onClick={adicionarUsuario} disabled={!selectedUser}>
                Adicionar
              </button>
              <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {feedback && <div className="feedback-message">{feedback}</div>}
    </div>
  );
}
