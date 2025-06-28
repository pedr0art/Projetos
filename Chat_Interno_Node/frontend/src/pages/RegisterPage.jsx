import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';
import Header from '../components/Header';
import { FaUser, FaLock, FaIdBadge, FaBuilding } from 'react-icons/fa';
import logo from '../assets/icon.svg'; // use sua logo aqui

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    password: '',
    confirmPassword: '',
    sector_id: '',
  });
  const [error, setError] = useState('');
  const [sectors, setSectors] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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

    if (!form.full_name.trim()) {
      return setError('Por favor, informe o nome completo');
    }

    if (form.password !== form.confirmPassword) {
      return setError('As senhas não coincidem');
    }

    if (!form.sector_id) {
      return setError('Por favor, selecione um setor');
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        full_name: form.full_name,
        username: form.username,
        password: form.password,
        sector_id: form.sector_id,
      });

      alert('Usuário cadastrado com sucesso!');
      navigate('/rooms');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registrar usuário');
    }
  };

  return (
    <>
      <Header />
      <div className="register-container" style={{ paddingTop: '80px' }}>
        <img src={logo} alt="Logo HermesHub" className="login-logo" />
        <h2>Registrar Novo Usuário</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
        <div className="input-icon-wrapper">
          <FaIdBadge className="input-icon" />
          <input
            name="full_name"
            placeholder="Nome Completo"
            value={form.full_name}
            onChange={handleChange}
            required
          />
        </div>
          <div className="input-icon-wrapper">
        <FaUser className="input-icon" />
        <input
          name="username"
          placeholder="Usuário"
          value={form.username}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-icon-wrapper">
        <FaLock className="input-icon" />
        <input
          name="password"
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-icon-wrapper">
        <FaLock className="input-icon" />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirmar senha"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-icon-wrapper">
        <FaBuilding className="input-icon" />
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
        </select>
      </div>
          <button type="submit">Criar conta</button>
          <button
            type="button"
            onClick={() => navigate('/rooms')}
            className="cancel-button"
          >
            Cancelar
          </button>
        </form>
      </div>
    </>
  );
}
