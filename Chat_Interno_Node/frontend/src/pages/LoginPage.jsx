import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'; // <- Importando o CSS local
import Header from '../components/Header';

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
    <>
      <Header />
      <div className="login-container" style={{ paddingTop: '80px' }}>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="username" placeholder="Usuário" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Senha" onChange={handleChange} required />
          <p>Não tem conta? <Link to="/register">Registre-se</Link></p>
          <button type="submit">Entrar</button>
        </form>
      </div>
    </>
  );
}
