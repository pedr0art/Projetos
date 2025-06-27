import Header from '../components/Header';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function MainLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.electronAPI?.onNotificationClick) {
      window.electronAPI.onNotificationClick((route) => {
        // Verifica se usuário está logado antes de redirecionar
        if (user) {
          navigate(route || '/rooms'); // padrão: rooms
        }
      });   
    }
  }, [navigate, user]);

  if (!user) {
    return <div>Carregando usuário...</div>;
  }

  return (
    <>
      <Header user={user} />
      <div style={{ padding: '20px', height: 'calc(100vh - 60px)', overflow: 'auto' }}>
        <Outlet />
      </div>
    </>
  );
}
