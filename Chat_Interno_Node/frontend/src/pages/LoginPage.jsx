import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import Header from '../components/Header';
import { MdPerson, MdLock } from 'react-icons/md';
import logo from '../assets/icon.svg'; // use sua logo aqui

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/rooms');
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, form);
      login(res.data);
      navigate('/rooms');
    } catch (err) {
      setError('Usuário ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="login-container" style={{ paddingTop: '80px' }}>
        <img src={logo} alt="Logo HermesHub" className="login-logo" />


        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <MdPerson className="input-icon" />
            <input
              name="username"
              placeholder="Usuário"
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <MdLock className="input-icon" />
            <input
              name="password"
              type="password"
              placeholder="Senha"
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Fazendo login...' : 'Entrar'}
          </button>
        </form>
      </div>
    </>
  );
}
