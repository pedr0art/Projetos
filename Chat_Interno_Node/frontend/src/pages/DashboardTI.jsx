// frontend/src/pages/DashboardTI.jsx
import React, { useEffect, useState, useCallback } from 'react';
import './DashboardTI.css';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import {
  MdOutlineSupportAgent,
  MdCheckCircle,
  MdForum
} from 'react-icons/md';
import { FaUsers } from 'react-icons/fa';
import { FaBuilding } from 'react-icons/fa';
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Legend
} from 'recharts';


import {
  getDashboardSummary,
  getRoomsStatusChart,
  getRoomsBySector,
  getMessagesOverTime,
  getTopCreators
} from '../services/dashboardService';

export default function DashboardTI() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [statusChart, setStatusChart] = useState([]);
  const [sectorChart, setSectorChart] = useState([]);
  const [messagesChart, setMessagesChart] = useState([]);
  const [topCreators, setTopCreators] = useState([]);
  const [groupBy, setGroupBy] = useState('day');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Proteção extra
  if (!user || user.sector_id !== 29) {
    return <Navigate to="/rooms" />;
  }

  // Paleta moderna
  const palette = [
    '#4F46E5','#10B981','#F59E0B','#EF4444','#3B82F6','#F97316','#8B5CF6','#EC4899','#0EA5E9','#14B8A6'
  ];

const sectorColors = {
  "AEP": "#4F46E5",
  "APE": "#10B981",
  "ASCOM": "#F59E0B",
  "ASPLAN": "#EF4444",
  "CRED": "#3B82F6",
  "CIDADÃO": "#F97316",
  "CADR": "#8B5CF6",
  "CAF": "#EC4899",
  "CAST": "#0EA5E9",
  "CDI": "#14B8A6",
  "CEPROJ": "#F43F5E",
  "CSL": "#6366F1",
  "CTT": "#F59E0B",
  "DADR": "#EF4444",
  "DAF": "#10B981",
  "DATGL": "#4F46E5",
  "DEO": "#3B82F6",
  "DF": "#8B5CF6",
  "RH": "#EF4444",
  "DMP": "#F97316",
  "DRF": "#14B8A6",
  "GAB": "#9467BD",
  "PJ": "#F43F5E",
  "PRES": "#2CA02C",
  "PROTC": "#10B981",
  "REC": "#F59E0B",
  "STO": "#0EA5E9",
  "SICARF": "#4F46E5",
  "TI": "#4F46E5",
  "TECN": "#8B5CF6",
  "UA": "#F97316",
  "UF": "#EF4444",
  "UTE": "#10B981"
};

const colorForSector = (abbrev) => {
  return sectorColors[abbrev] || '#8884d8'; // fallback
};


  const formatNumber = (n) => {
    return typeof n === 'number' ? new Intl.NumberFormat('pt-BR').format(n) : n;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summary, statusData, sectorData, messagesData, creatorsData] = await Promise.all([
        getDashboardSummary(token),
        getRoomsStatusChart(token),
        getRoomsBySector(token),
        getMessagesOverTime(token, groupBy),
        getTopCreators(token)
      ]);

      setData(summary);
      setStatusChart(statusData);
      setSectorChart(sectorData);
      setMessagesChart(messagesData);
      setTopCreators(creatorsData);
    } catch (err) {
      console.error('Erro ao carregar indicadores:', err);
      setError('Erro ao carregar indicadores');
    } finally {
      setLoading(false);
    }
  }, [token, groupBy]);

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token, fetchData]);

  if (loading) return <div className="dashboard-loading">Carregando indicadores...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  const kpis = [
    { title: 'Total de Chamados', value: data?.totalRooms ?? 0, icon: <MdOutlineSupportAgent size={28} /> },
    { title: 'Chamados Abertos', value: data?.openRooms ?? 0, icon: <FaUsers size={28} /> },
    { title: 'Chamados Finalizados', value: data?.closedRooms ?? 0, icon: <MdCheckCircle size={28} /> },
    { title: 'Mensagens Totais', value: data?.totalMessages ?? 0, icon: <MdForum size={28} /> },
    { title: 'Setor com mais chamados', value: data?.topSector ?? 'N/A', icon: <FaBuilding size={28} /> }
  ];

  const statusColorMap = { 'Abertos': '#10b981', 'Finalizados': '#ef4444' };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button className="back-button" onClick={() => navigate('/rooms')}>
          <MdArrowBack size={20} /> Voltar
        </button>
        <div className="dashboard-title">
          <h1>Dashboard TI</h1>
          <p className="dashboard-sub">Indicadores gerais</p>
        </div>
        <div className="dashboard-actions">
          <button className="action-refresh" onClick={fetchData}>Atualizar</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="kpi-card">
            <div className="kpi-left">
              <p className="kpi-title">{kpi.title}</p>
              <h2 className="kpi-value">{formatNumber(kpi.value)}</h2>
            </div>
            <div className="kpi-icon">{kpi.icon}</div>
          </div>
        ))}
      </div>

      {/* Gráficos principais */}
      <div className="charts-grid">
        {/* Chamados por Status */}
        <div className="chart-card">
          <h3>Chamados por Status</h3>
          {statusChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={380} className="responsive-chart">
              <PieChart>
                <Pie
                  data={statusChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {statusChart.map((entry, i) => (
                    <Cell key={i} fill={statusColorMap[entry.name] || palette[i % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p>Nenhum dado</p>}
        </div>

{/* Chamados por Setor */}
<div className="chart-card">
  <h3>Chamados por Setor</h3>
  {sectorChart.length > 0 ? (
    <ResponsiveContainer width="100%" height={380} className="responsive-chart">
      <PieChart>
        <Pie
          data={sectorChart}
          dataKey="value"
          nameKey="abbreviation"    // usamos a sigla aqui
          cx="50%"
          cy="50%"
          outerRadius={90}
          // label mostra a sigla (abbreviation)
          label={({ abbreviation }) => abbreviation}
        >
          {sectorChart.map((entry, i) => (
            <Cell key={`cell-sector-${i}`} fill={colorForSector(entry.abbreviation)} />
          ))}
        </Pie>

        <Tooltip
          // formatter mostra: [valor, rótulo] e usamos payload.name como nome completo
          formatter={(value, name, props) => {
            const fullName = props?.payload?.name || props?.payload?.abbreviation || name;
            return [value, fullName];
          }}
        />
        <Legend
          payload={sectorChart.map(s => ({
            value: `${s.abbreviation} (${s.value})`,
            type: 'square',
            id: s.abbreviation
          }))}
          verticalAlign="bottom"
          height={36}
        />
      </PieChart>
    </ResponsiveContainer>
  ) : <p>Nenhum dado</p>}
</div>

      </div>

      {/* Mensagens ao longo do tempo */}
      <div className="chart-card fullwidth mt-large">
        <div className="chart-card-header">
          <h3>Mensagens ao longo do tempo</h3>
          <div className="chart-controls">
            <label>
              Agrupar por:
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                <option value="day">Por dia</option>
                <option value="month">Por mês</option>
              </select>
            </label>
          </div>
        </div>
        {messagesChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={380} className="responsive-chart">
            <LineChart data={messagesChart}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#36A2EB" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickFormatter={(tick) => {
                  const d = new Date(tick);
                  const local = new Date(d.getTime() + d.getTimezoneOffset()*60000);
                  return groupBy==='day' 
                    ? `${local.getDate().toString().padStart(2,'0')}/${(local.getMonth()+1).toString().padStart(2,'0')}` 
                    : `${(local.getMonth()+1).toString().padStart(2,'0')}/${local.getFullYear()}`;
                }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => {
                  const d = new Date(label);
                  const local = new Date(d.getTime() + d.getTimezoneOffset()*60000);
                  return groupBy==='day'
                    ? `${local.getDate().toString().padStart(2,'0')}/${(local.getMonth()+1).toString().padStart(2,'0')}/${local.getFullYear()}`
                    : `${(local.getMonth()+1).toString().padStart(2,'0')}/${local.getFullYear()}`;
                }}
              />
              <Line type="monotone" dataKey="value" stroke="url(#lineGradient)" strokeWidth={3} dot={{ r: 5, fill: '#4F46E5' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p style={{ padding: 12 }}>Nenhum dado</p>}
      </div>

      {/* Top creators */}
      <div className="chart-card fullwidth mt-large">
        <h3>Usuários que mais criam chamados</h3>
        {topCreators.length > 0 ? (
          <ResponsiveContainer width="100%" height={380} className="responsive-chart">
            <BarChart data={topCreators}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {topCreators.map((entry, i) => (
                  <Cell key={i} fill={palette[i % palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <p style={{ padding: 12 }}>Nenhum dado</p>}
      </div>

    </div>
  );
}
