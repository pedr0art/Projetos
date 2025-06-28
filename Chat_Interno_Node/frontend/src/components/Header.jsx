import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../assets/logo_iterma.svg';
import empresaLogo from '../assets/logo_orinn.svg'; // <- substitua com seu logo
import { FaUserCircle } from 'react-icons/fa';
import { LuUserPen } from "react-icons/lu";
import { MdLogout } from "react-icons/md";

export default function Header() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const modalRef = useRef();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="left-side">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="center-title">
        HermesHub
      </div>
      {user && (
        <div className="right-side">
          <FaUserCircle className="profile-icon" size={32} onClick={toggleProfile} />
          {isProfileOpen && (
            <div
              className="profile-modal fade-in"
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
            >
              <p><strong>{user.full_name}</strong></p>
              <p>{user.sector_name}</p>

              {(user.sector_id === 29 || user.sector?.sector_id === 29) && (
                <button
                  className="register-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileOpen(false);
                    navigate('/register');
                  }}
                >
                  Cadastrar novo usuário <LuUserPen size={25} style={{ marginLeft: '6px' }} />
                </button>
              )}

              <button
                className="logout-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
              >
                Sair <MdLogout size={25} style={{ marginLeft: '6px' }} />
              </button>

              <div className="profile-footer">
                <p className="footer-title">Desenvolvido por:</p>
                <img
                  src={empresaLogo}
                  alt="Logo da Empresa"
                  className="empresa-logo"
                />
                <p className="footer-contact">
                  Para contato: orinnestudio@gmail.com
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
