import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <>
      <Header 
        fullName={user?.full_name} 
        sector={user?.sector?.sector_name || user?.sector_name} 
      />
      <div style={{ padding: '20px', height: 'calc(100vh - 60px)', overflow: 'auto' }}>
        <Outlet />
      </div>
    </>
  );
}
