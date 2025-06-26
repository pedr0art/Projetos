import { useAuth } from '../context/AuthContext';
import './Header.css';
import logo from '../assets/logo_iterma.svg';

export default function Header({ user }) {
  // Pega user do contexto caso não tenha recebido por prop
  const contextUser = useAuth().user;

  const u = user || contextUser || {};

  const displayName = u.full_name || 'Usuário';
  const displaySector = u.sector_name ? `(${u.sector_name})` : '';

  return (
    <header className="app-header">
      <div className="left-side">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="right-side">
        <div className="user-info">
          {displayName} {displaySector}
        </div>
      </div>
    </header>
  );
}
