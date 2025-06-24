import './Header.css';
import logo from '../assets/logo_iterma.svg';

export default function Header({ fullName, sector }) {
  return (
    <header className="app-header">
      <div className="left-side">
        <img src={logo} alt="Logo" className="logo" />
        <div className="user-info">
          {fullName} {sector ? `(${sector})` : ''}
        </div>
      </div>
      {/* Se quiser algum conteúdo na direita, pode adicionar aqui */}
    </header>
  );
}
