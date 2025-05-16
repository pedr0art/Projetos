import Header from '../components/Header';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <>
      <Header />
      <div style={{ padding: '20px', height: 'calc(100vh - 60px)', overflow: 'auto' }}>
        <Outlet />
      </div>
    </>
  );
}
