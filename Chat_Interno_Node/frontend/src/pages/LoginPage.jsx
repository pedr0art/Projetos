import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import Header from '../components/Header';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // ✅ Se já estiver logado, redireciona direto para Rooms
  useEffect(() => {
    if (user) navigate('/rooms');
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, form);
      login(res.data); // Salva token e user
      navigate('/rooms');
    } catch (err) {
      setError('Usuário ou senha inválidos');
    }
  };

  return (
    <>
      <Header />
      <div className="login-container" style={{ paddingTop: '80px' }}>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="username" placeholder="Usuário" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Senha" onChange={handleChange} required />
          <button type="submit">Entrar</button>
        </form>
      </div>
    </>
  );
}
