// Header.jsx
import './Header.css';
import logo from '../assets/logo_iterma.svg';

export default function Header({ username }) {
  return (
    <header className="app-header">
      <img src={logo} alt="Logo" className="logo" />
      <div className="user-info">{username}</div>
    </header>
  );
}
