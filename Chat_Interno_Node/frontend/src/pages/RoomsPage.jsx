  import { useEffect, useState } from 'react';
  import { useAuth } from '../context/AuthContext';
  import axios from 'axios';
  import { useNavigate } from 'react-router-dom';
  import Header from '../components/Header';
  import './RoomsPage.css';

  export default function RoomsPage() {
    const { token, user, logout } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [roomName, setRoomName] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      fetchRooms();
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

    const criarSala = async () => {
      if (!roomName.trim()) return;
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/rooms`, {
          name: roomName,
          is_group: isGroup,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoomName('');
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

    const salasPrivadas = rooms.filter(room => !room.is_group);
    const salasGrupo = rooms.filter(room => room.is_group);

    return (
      <>
        <Header full_name={user?.full_name} />
        <div className="rooms-container">
          <div className="rooms-header">
            <h2>Minhas Salas</h2>
            <button onClick={handleLogout}>Sair</button>
          </div>

          <div className="room-form">
            <input
              placeholder="Nome da nova sala"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <select
              value={isGroup ? 'grupo' : 'privada'}
              onChange={(e) => setIsGroup(e.target.value === 'grupo')}
            >
              <option value="privada">Privada</option>
              <option value="grupo">Grupo</option>
            </select>
            <button onClick={criarSala}>Criar sala</button>
          </div>

          <div className="room-section">
            <h3>Salas Privadas</h3>
            {salasPrivadas.length === 0 && <p>Nenhuma sala privada.</p>}
            <ul>
              {salasPrivadas.map(room => (
                <li key={room.id}>
                  <div>
                    <strong>{room.name}</strong> • {room.member_count} participante(s)
                  </div>
                  <div>
                    <button onClick={() => entrarNaSala(room.id)}>Entrar</button>
                    <button onClick={() => excluirSala(room.id)}>Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="room-section">
            <h3>Salas de Grupo</h3>
            {salasGrupo.length === 0 && <p>Nenhuma sala de grupo.</p>}
            <ul>
              {salasGrupo.map(room => (
                <li key={room.id}>
                  <div>
                    <strong>{room.name}</strong> • {room.member_count} participante(s)
                  </div>
                  <div>
                    <button onClick={() => entrarNaSala(room.id)}>Entrar</button>
                    <button onClick={() => excluirSala(room.id)}>Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>
    );
  }
