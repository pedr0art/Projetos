import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
                headers: { Authorization: `Bearer ${token}` }
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
                is_group: isGroup
            }, {
                headers: { Authorization: `Bearer ${token}` }
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
                headers: { Authorization: `Bearer ${token}` }
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
        <div style={{ maxWidth: 600, margin: '40px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Salas de {user?.username}</h2>
                <button onClick={handleLogout}>Sair</button>
            </div>

            <div style={{ marginBottom: 20 }}>
                <input
                    placeholder="Nome da nova sala"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    style={{ marginRight: 10 }}
                />
                <select
                    value={isGroup ? 'grupo' : 'privada'}
                    onChange={(e) => setIsGroup(e.target.value === 'grupo')}
                    style={{ marginRight: 10 }}
                >
                    <option value="privada">Privada</option>
                    <option value="grupo">Grupo</option>
                </select>
                <button onClick={criarSala}>Criar sala</button>
            </div>

            <div style={{ marginBottom: 20 }}>
                <h3>Salas Privadas</h3>
                {salasPrivadas.length === 0 && <p>Nenhuma sala privada.</p>}
                <ul>
                    {salasPrivadas.map(room => (
                        <li key={room.id} style={{ marginBottom: 10 }}>
                            <strong>{room.name}</strong> (privada)
                            <span style={{ marginLeft: 5, fontSize: '0.9em', color: '#555' }}>
                                • {room.member_count} participante(s)
                            </span>
                            <button onClick={() => entrarNaSala(room.id)} style={{ marginLeft: 10 }}>
                                Entrar
                            </button>
                            <button onClick={() => excluirSala(room.id)} style={{ marginLeft: 10, color: 'red' }}>
                                Excluir
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h3>Salas de Grupo</h3>
                {salasGrupo.length === 0 && <p>Nenhuma sala de grupo.</p>}
                <ul>
                    {salasGrupo.map(room => (
                        <li key={room.id} style={{ marginBottom: 10 }}>
                            <strong>{room.name}</strong> (grupo)
                            <span style={{ marginLeft: 5, fontSize: '0.9em', color: '#555' }}>
                                • {room.member_count} participante(s)
                            </span>
                            <button onClick={() => entrarNaSala(room.id)} style={{ marginLeft: 10 }}>
                                Entrar
                            </button>
                            <button onClick={() => excluirSala(room.id)} style={{ marginLeft: 10, color: 'red' }}>
                                Excluir
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
