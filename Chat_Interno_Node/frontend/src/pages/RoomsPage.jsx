import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './RoomsPage.css';
import { useSocket } from '../context/SocketContext';
import dayjs from 'dayjs';
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoChatbubblesOutline } from "react-icons/io5";
import { RiChatNewLine } from "react-icons/ri";
import { PiChatCircleSlash } from "react-icons/pi";
import { MdHideSource } from "react-icons/md";

export default function RoomsPage() {
  const { token, user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [allSectors, setAllSectors] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [modoAtendimento, setModoAtendimento] = useState(false);
  const [roomStatusFilter, setRoomStatusFilter] = useState('abertas'); // 'abertas' | 'finalizadas' | 'todas'


  const { socket, allOnlineUsers, addMessageListener, removeMessageListener } = useSocket();
  const navigate = useNavigate();

  // Carrega salas
  const fetchRooms = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/rooms?includeFinished=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (err) {
      console.error('Erro ao buscar salas:', err);
    }
  };

  // Carrega todos os usuários
  const fetchUsers = async () => {
    if (!token) return;
    try {
      const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  // Carrega setores
  const fetchSectors = async () => {
    if (!token) return;
    try {
      const sectorsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/sectors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllSectors(sectorsRes.data);
    } catch (err) {
      console.error('Erro ao carregar setores:', err);
    }
  };

  // Carrega salas e usuários ao montar o componente
  useEffect(() => {
    if (!token) return;
    fetchRooms();
    fetchUsers();
    fetchSectors();
  }, [token]);

  // Socket: eventos de salas adicionadas e excluídas
  useEffect(() => {
    if (!socket || !token) return;

    const onRoomAdded = (room) => {
      fetchRooms();
      socket.emit('joinRoom', room.id);
      if (room.creator_id !== user.id && window.electronAPI) {
        window.electronAPI.notify({
          title: 'Nova conversa',
          body: 'Você foi adicionado a uma nova sala de chat.',
          route: '/rooms'
        });
      }
    };

    const onRoomDeleted = ({ room_id }) => {
      fetchRooms();
    };

    socket.on('roomAdded', onRoomAdded);
    socket.on('roomDeleted', onRoomDeleted);

    return () => {
      socket.off('roomAdded', onRoomAdded);
      socket.off('roomDeleted', onRoomDeleted);
    };
  }, [socket, token, user]);

  // Socket: listener de novas mensagens para atualizar a última mensagem da sala
  useEffect(() => {
    if (!socket || !token) return;

    const handleNewMessage = (msg) => {
      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.id === msg.roomId) {
            return {
              ...room,
              last_message: msg.message,
              last_sender_id: msg.sender_id,
              last_message_time: msg.created_at,
            };
          }
          return room;
        })
      );
    };

    addMessageListener(handleNewMessage);

    return () => {
      removeMessageListener(handleNewMessage);
    };
  }, [socket, token, addMessageListener, removeMessageListener]);
  useEffect(() => {
    const savedFilter = localStorage.getItem('roomStatusFilter');
    if (savedFilter) {
      setRoomStatusFilter(savedFilter);
    } else {
      fetchRooms();
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    localStorage.setItem('roomStatusFilter', roomStatusFilter);
    fetchRooms();
  }, [roomStatusFilter, token]);

  // Funções de abrir modal
  const carregarUsuariosEsetores = async () => {
    await fetchUsers();
    await fetchSectors();
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

  // Criar sala
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

  // Entrar na sala
  const entrarNaSala = (id) => {
    navigate(`/chat/${id}`);
  };

  // Finalizar sala
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

  // Logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filtragem de usuários para modal
  const filteredUsers = allUsers.filter((u) => {
    const matchName = u.full_name.toLowerCase().includes(filterText.toLowerCase());
    const matchSector = filterSector ? u.sector_id === parseInt(filterSector) : true;
    const notSelf = u.id !== user.id;
    const isAtendimento = modoAtendimento ? u.sector_id === 29 : true;
    return matchName && matchSector && notSelf && isAtendimento;
  });

  // Filtrar salas por grupo ou privada

  // Fechar modal
  const fecharModal = () => {
    setIsModalOpen(false);
    setSelectedUsers([]);
    setRoomName('');
    setFilterText('');
    setFilterSector('');
  };
  const salasFiltradas = rooms.filter((room) => {
    const isFinished = room.is_finished === true || room.is_finished === 'true';
    if (roomStatusFilter === 'abertas') return !room.is_finished;
    if (roomStatusFilter === 'finalizadas') return room.is_finished;
    return true; // 'todas'
  });
  const salasPrivadas = salasFiltradas.filter((room) => !room.is_group);
  const salasGrupo = salasFiltradas.filter((room) => room.is_group);

  // Renderização
  return (
    <>
      <Header full_name={user?.full_name} />

      <div className="rooms-container">
        <div className="rooms-header">
          <h2>Minhas Salas</h2>
          
        </div>
        {(user?.sector_id === 29 || user?.sector?.sector_id === 29) && (
          <div className="status-filter">
            <button
              className={roomStatusFilter === 'abertas' ? 'active' : ''}
              onClick={() => setRoomStatusFilter('abertas')}
            >
              Em Aberto
            </button>
            <button
              className={`finalizadas-button ${roomStatusFilter === 'finalizadas' ? 'active' : ''}`}
              onClick={() => setRoomStatusFilter('finalizadas')}
            >
              Finalizadas
            </button>
            <button
              className={roomStatusFilter === 'todas' ? 'active' : ''}
              onClick={() => setRoomStatusFilter('todas')}
            >
              Todas
            </button>
          </div>
        )}

        <div className="room-form">
          {(user?.sector_id === 29 ||
            user?.sector_id === 6 ||
            user?.sector?.sector_id === 29 ||
            user?.sector?.sector_id === 6) && (
            <button className="create-new-room" onClick={abrirModal}>Criar nova sala <IoMdAddCircleOutline size={28} style={{ marginLeft: '6px' }} /></button>
          )}
          {!(
            user?.sector_id === 29 ||
            user?.sector_id === 6 ||
            user?.sector?.sector_id === 29 ||
            user?.sector?.sector_id === 6
          ) && <button className="create-new-room" onClick={abrirModalAtendimento}>Chamar TI <RiChatNewLine size={28} style={{ marginLeft: '6px' }} /></button>}
        </div>

        <div className="room-section">

          <h3>Salas Privadas</h3>
          {salasPrivadas.length === 0 && <p>Nenhuma sala privada.</p>}
          <ul>
            {salasPrivadas.map((room) => (
              <li key={room.id}>
                <div>
                  <strong>{room.name} {room.is_finished && <MdHideSource size={16} title="Sala finalizada" style={{ marginLeft: '4px', color: '#B72A30', justifycontent: 'center', alignitems: 'center' }} />}</strong> • {room.member_count} participante(s)
                  <div style={{ color: '#333', marginTop: '15px' }}>
                    {room.last_message ? (
                      <>
                        {room.last_sender_id === user.id
                          ? 'Você'
                          : allUsers.find((u) => u.id === room.last_sender_id)?.full_name || 'Alguém'}
                        : {room.last_message}

                        {room.last_message_time && (
                          <div style={{ fontSize: '0.75rem', color: '#444', marginTop: '4px' }}>
                            {dayjs(room.last_message_time).format('HH:mm')} hs - {dayjs(room.last_message_time).format('DD/MM/YYYY')}
                          </div>
                        )}
                      </>
                    ) : (
                      'Nenhuma mensagem ainda'
                    )}
                  </div>
                </div>
                <div className={`room-buttons ${!(user?.sector_id === 29 || user?.sector_id === 6 || user?.sector?.sector_id === 29 || user?.sector?.sector_id === 6) ? 'single-button' : ''}`}>
                  <button className="entrar-sala"onClick={() => entrarNaSala(room.id)}>Entrar <IoChatbubblesOutline size={28} style={{ marginLeft: '6px' }} /></button>

                  {(user?.sector_id === 29 || user?.sector_id === 6 || user?.sector?.sector_id === 29 || user?.sector?.sector_id === 6) && !room.is_finished && (
                    <button className="finalizar-sala" onClick={() => finalizarSala(room.id)}>
                      Finalizar <PiChatCircleSlash size={28} style={{ marginLeft: '6px' }} />
                    </button>
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
                  <strong>{room.name} {room.is_finished && <MdHideSource  size={16} title="Sala finalizada" style={{ marginLeft: '4px', color: '#B72A30' }} />}</strong> • {room.member_count} participante(s)
                  <div style={{ color: '#333', marginTop: '15px' }}>
                    {room.last_message ? (
                      <>
                        {room.last_sender_id === user.id
                          ? 'Você'
                          : allUsers.find((u) => u.id === room.last_sender_id)?.full_name || 'Alguém'}
                        : {room.last_message}

                        {room.last_message_time && (
                          <div style={{ fontSize: '0.75rem', color: '#444', marginTop: '4px' }}>
                            {dayjs(room.last_message_time).format('HH:mm')} hs - {dayjs(room.last_message_time).format('DD/MM/YYYY')}
                          </div>
                        )}  
                      </>
                    ) : (
                      'Nenhuma mensagem ainda'
                    )}
                  </div>
                </div>
                <div className={`room-buttons ${!(user?.sector_id === 29 || user?.sector_id === 6 || user?.sector?.sector_id === 29 || user?.sector?.sector_id === 6) ? 'single-button' : ''}`}>
                  <button className="entrar-sala" onClick={() => entrarNaSala(room.id)}>Entrar <IoChatbubblesOutline size={28} style={{ marginLeft: '6px' }} /></button>

                  {(user?.sector_id === 29 || user?.sector_id === 6 || user?.sector?.sector_id === 29 || user?.sector?.sector_id === 6) && !room.is_finished && (
                    <button className="finalizar-sala" onClick={() => finalizarSala(room.id)}>
                      Finalizar <PiChatCircleSlash size={28} style={{ marginLeft: '6px' }} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>


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
                  return aOnline === bOnline ? 0 : aOnline ? -1 : 1;
                })
                .map((u) => {
                  const isOnline = allOnlineUsers.some((ou) => ou.id === u.id);
                  return (
                    <div
                      key={u.id}
                      className={`user-list-item ${
                        selectedUsers.find((su) => su.id === u.id) ? 'selected' : ''
                      } ${isOnline ? 'online' : ''}`}
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
                }
              >
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
