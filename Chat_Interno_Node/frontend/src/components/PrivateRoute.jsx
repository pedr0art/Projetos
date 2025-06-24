import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return user ? <Outlet /> : <Navigate to="/" />;
}
