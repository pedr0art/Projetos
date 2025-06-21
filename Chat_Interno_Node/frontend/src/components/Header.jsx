// Header.jsx
import './Header.css';
import logo from '../assets/logo_iterma.svg';

export default function Header({ full_name }) {
  return (
    <header className="app-header">
      <img src={logo} alt="Logo" className="logo" />
      <div className="user-info">{full_name}</div>
    </header>
  );
}
