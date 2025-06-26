  import { useEffect, useState } from 'react';
  import { useAuth } from '../context/AuthContext';
  import axios from 'axios';
  import { useNavigate, Link } from 'react-router-dom';
  import io from 'socket.io-client';
  import Header from '../components/Header';
  import './RoomsPage.css';
  import { useSocket } from '../context/SocketContext';

  export default function RoomsPage() {
    const { token, user, logout } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [roomName, setRoomName] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    //const [onlineUsers, setOnlineUsers] = useState([]);
    const [allSectors, setAllSectors] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [filterSector, setFilterSector] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [modoAtendimento, setModoAtendimento] = useState(false)
    const { socket } = useSocket(); // usa o socket global
    const { allOnlineUsers } = useSocket();
    useEffect(() => {
      fetchRooms();
    }, [token]);
    useEffect(() => {
      if (!token || !socket) return;

      socket.on('roomAdded', (room) => {
        console.log('📥 Recebido evento roomAdded', room);
        fetchRooms(); // Atualiza a lista

        socket.emit('joinRoom', room.id); // entra automaticamente na sala nova
        console.log(`🔗 Entrando automaticamente na sala ${room.id}`);

        if (room.creator_id !== user.id && window.electronAPI) {
          window.electronAPI.notify({
            title: 'Nova conversa',
            body: 'Você foi adicionado a uma nova sala de chat.',
          });
        }
      });


      socket.on('roomDeleted', ({ room_id }) => {
        console.log(`🗑️ Sala ${room_id} foi excluída`);
        fetchRooms();
      });

      return () => {
        socket.off('roomAdded');
        
        socket.off('roomDeleted');
      };
    }, [socket, token, user]);

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
      await carregarUsuariosEsetores();
      setModoAtendimento(false);
      setIsModalOpen(true);
    };

    const abrirModalAtendimento = async () => {
      await carregarUsuariosEsetores();
      setModoAtendimento(true);
      setIsModalOpen(true);
    };

    const carregarUsuariosEsetores = async () => {
      try {
        const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sectorsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/sectors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllUsers(usersRes.data);
        setAllSectors(sectorsRes.data);
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

    const finalizarSala = async (roomId) => {
      if (!window.confirm('Deseja realmente finalizar esta sala?')) return;

      try {
        await axios.patch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/finish`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });

        fetchRooms();
      } catch (err) {
        console.error('Erro ao finalizar sala:', err);
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
      const notSelf = u.id !== user.id;
      const isAtendimento = modoAtendimento ? u.sector_id === 29 : true;
      return matchName && matchSector && notSelf && isAtendimento;
    });
    const fecharModal = () => {
      setIsModalOpen(false);
      setSelectedUsers([]);
      setRoomName('');
      setFilterText('');
      setFilterSector('');
    };
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
            {!(user?.sector_id === 29 || user?.sector_id === 6 || user?.sector?.sector_id === 29 || user?.sector?.sector_id === 6) && (
              <button onClick={abrirModalAtendimento}>Falar com TI</button>
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
                      <button onClick={() => finalizarSala(room.id)}>Finalizar</button>
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
                      <button onClick={() => finalizarSala(room.id)}>Finalizar</button>
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
              {!modoAtendimento && (
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
              )}
              {modoAtendimento && (
                <div style={{ marginBottom: '0.5rem', fontStyle: 'italic' }}>
                  Mostrando apenas usuários do setor de tecnologia
                </div>
              )}
              <div className="user-list">
                {[...filteredUsers]
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
                        className={`user-list-item ${selectedUsers.find((su) => su.id === u.id) ? 'selected' : ''} ${isOnline ? 'online' : ''}`}
                        onClick={() => {
                          setSelectedUsers((prev) => {
                            const alreadySelected = prev.some((su) => su.id === u.id);
                            if (!isGroup) {
                              return alreadySelected ? [] : [u];
                          }
                          return alreadySelected
                            ? prev.filter((su) => su.id !== u.id)
                            : [...prev, u];
                          });

                        }}
                      >
                        {u.full_name} ({u.sector_name}) {isOnline ? '🟢' : ''}
                      </div>
                    );
                  })}

              </div>

              <div className="modal-buttons">
                <button 
                onClick={criarSala}
                disabled={
                  !roomName.trim() ||
                  selectedUsers.length === 0 ||
                  (!isGroup && selectedUsers.length !== 1) ||
                  (isGroup && selectedUsers.length < 1) 
                  }>
                  Criar Sala
                </button>
                <button onClick={fecharModal}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
