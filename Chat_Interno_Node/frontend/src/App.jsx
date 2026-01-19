import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RoomsPage from './pages/RoomsPage'; 
import ChatRoomPage from './pages/ChatRoomPage';
import RegisterPage from './pages/RegisterPage';
import MainLayout from './layout/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import { SocketProvider } from './context/SocketContext';
import DashboardTI from './pages/DashboardTI';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Rotas protegidas ou com layout comum */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/chat/:id" element={<ChatRoomPage />} />
                <Route path="/dashboard-ti" element={<DashboardTI />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;