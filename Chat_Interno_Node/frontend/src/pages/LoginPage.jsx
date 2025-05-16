import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // importe Link aqui

export default function LoginPage() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, form);
            login(res.data);
            navigate('/rooms');
        } catch (err) {
            setError('Usuário ou senha inválidos');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto' }}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input name="username" placeholder="Usuário" onChange={handleChange} required /><br />
                <input name="password" type="password" placeholder="Senha" onChange={handleChange} required /><br />
                <p>Não tem conta? <Link to="/register">Registre-se</Link></p>  {/* <-- Aqui */}
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
}
