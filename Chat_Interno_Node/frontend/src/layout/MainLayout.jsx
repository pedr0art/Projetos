import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user } = useAuth();

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
