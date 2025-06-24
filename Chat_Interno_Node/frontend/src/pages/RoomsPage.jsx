import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';
import Header from '../components/Header';
import './RoomsPage.css';


export default function RoomsPage() {
  const { token, user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [allSectors, setAllSectors] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, [token]);
  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('✅ Conectado ao socket na RoomsPage');
    });

    socket.on('roomAdded', () => {
      console.log('📥 Recebido evento roomAdded');
      fetchRooms();  // Atualiza as salas automaticamente
    if (window.electronAPI) {
      window.electronAPI.notify({
        title: 'Nova conversa',
        body: 'Você foi adicionado a uma nova sala de chat.',
      });
    }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket desconectado da RoomsPage');
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (err) {
      console.error('Erro ao buscar salas:', err);
    }
  };

  const abrirModal = async () => {
    try {
      const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sectorsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/sectors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(usersRes.data);
      setAllSectors(sectorsRes.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Erro ao carregar usuários ou setores:', err);
    }
  };

  const criarSala = async () => {
    if (!roomName.trim()) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/rooms`,
        {
          name: roomName,
          is_group: isGroup,
          users: selectedUsers.map((u) => u.id),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRoomName('');
      setIsGroup(false);
      setSelectedUsers([]);
      setFilterText('');
      setFilterSector('');
      setIsModalOpen(false);
      fetchRooms();
    } catch (err) {
      console.error('Erro ao criar sala:', err);
    }
  };

  const entrarNaSala = (id) => {
    navigate(`/chat/${id}`);
  };

  const excluirSala = async (roomId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta sala?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRooms();
    } catch (err) {
      console.error('Erro ao excluir sala:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const salasPrivadas = rooms.filter((room) => !room.is_group);
  const salasGrupo = rooms.filter((room) => room.is_group);

  const filteredUsers = allUsers.filter((u) => {
    const matchName = u.full_name.toLowerCase().includes(filterText.toLowerCase());
    const matchSector = filterSector ? u.sector_id === parseInt(filterSector) : true;
    return matchName && matchSector;
  });

  return (
    <>
      <Header full_name={user?.full_name} />
      
      <div className="rooms-container">

        <div className="rooms-header">
          <h2>Minhas Salas</h2>
          <button onClick={handleLogout}>Sair</button>
        </div>

        <div className="room-form">
          {(user?.sector_id === 29 || user?.sector_id === 6 || user?.sector?.sector_id === 29 || user?.sector?.sector_id === 6) && (
            <button onClick={abrirModal}>Criar nova sala</button>
          )}
        </div>

        <div className="room-section">
          <h3>Salas Privadas</h3>
          {salasPrivadas.length === 0 && <p>Nenhuma sala privada.</p>}
          <ul>
            {salasPrivadas.map((room) => (
              <li key={room.id}>
                <div>
                  <strong>{room.name}</strong> • {room.member_count} participante(s)
                </div>
                <div>
                  <button onClick={() => entrarNaSala(room.id)}>Entrar</button>
                  
                  {(user?.sector_id === 29 || user?.sector_id === 6 || user?.sector?.sector_id === 29 || user?.sector?.sector_id === 6) && (
                    <button onClick={() => excluirSala(room.id)}>Excluir</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="room-section">
          <h3>Salas de Grupo</h3>
          {salasGrupo.length === 0 && <p>Nenhuma sala de grupo.</p>}
          <ul>
            {salasGrupo.map((room) => (
              <li key={room.id}>
                <div>
                  <strong>{room.name}</strong> • {room.member_count} participante(s)
                </div>
                <div>
                  <button onClick={() => entrarNaSala(room.id)}>Entrar</button>

                  {(user?.sector_id === 29 || user?.sector_id === 6 || user?.sector?.sector_id === 29 || user?.sector?.sector_id === 6) && (
                    <button onClick={() => excluirSala(room.id)}>Excluir</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {(user?.sector_id === 29 || user?.sector?.sector_id === 29) && (
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/register">Cadastrar novo usuário</Link>
        </p>
      )}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Criar Nova Sala</h3>

            <input
              className="user-input"
              placeholder="Nome da sala"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />

            <select
              className="sector-select"
              value={isGroup ? 'grupo' : 'privada'}
              onChange={(e) => setIsGroup(e.target.value === 'grupo')}
            >
              <option value="privada">Privada</option>
              <option value="grupo">Grupo</option>
            </select>

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
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className={`user-list-item ${
                    selectedUsers.find((su) => su.id === u.id) ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedUsers((prev) =>
                      prev.some((su) => su.id === u.id)
                        ? prev.filter((su) => su.id !== u.id)
                        : [...prev, u]
                    );
                  }}
                >
                  {u.full_name} ({u.sector_name})
                </div>
              ))}
            </div>

            <div className="modal-buttons">
              <button onClick={criarSala} disabled={!roomName.trim()}>
                Criar Sala
              </button>
              <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
