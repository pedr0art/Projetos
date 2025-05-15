import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', sector_id: '' });
    const [error, setError] = useState('');
    const [sectors, setSectors] = useState([]);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Carregar setores da API
        async function fetchSectors() {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/sectors`);
                setSectors(res.data);
            } catch (err) {
                console.error('Erro ao carregar setores', err);
            }
        }
        fetchSectors();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            return setError('As senhas não coincidem');
        }
        if (!form.sector_id) {
            return setError('Por favor, selecione um setor');
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                username: form.username,
                password: form.password,
                sector_id: form.sector_id,
            });

            login(res.data); // já faz login após cadastro
            navigate('/rooms');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao registrar usuário');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto' }}>
            <h2>Registrar</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    name="username"
                    placeholder="Usuário"
                    onChange={handleChange}
                    required
                /><br />
                <input
                    name="password"
                    type="password"
                    placeholder="Senha"
                    onChange={handleChange}
                    required
                /><br />
                <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirmar senha"
                    onChange={handleChange}
                    required
                /><br />

                <select
                    name="sector_id"
                    value={form.sector_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Selecione um setor</option>
                    {sectors.map((sector) => (
                        <option key={sector.sector_id} value={sector.sector_id}>
                            {sector.sector_name}
                        </option>
                    ))}
                </select><br /><br />

                <button type="submit">Criar conta</button>
            </form>
        </div>
    );
}
