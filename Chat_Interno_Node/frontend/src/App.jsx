import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RoomsPage from './pages/RoomsPage'; 
import ChatRoomPage from './pages/ChatRoomPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/chat/:id" element={<ChatRoomPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
