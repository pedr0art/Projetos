import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [allOnlineUsers, setAllOnlineUsers] = useState([]);  // ✅ Novo: lista de usuários online
  const currentRoomIdRef = useRef(null);
  const messageListenersRef = useRef([]);

  useEffect(() => {
    if (!token || !user) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
    });

    setSocket(newSocket);

    newSocket.on('connect', async () => {
      try {
        // Buscar todas as salas do usuário via API REST
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Falha ao buscar salas do usuário');

        const rooms = await res.json();

        // Entrar em todas as salas
        rooms.forEach((room) => {
          newSocket.emit('joinRoom', room.id);
          console.log(`Entrando na sala ${room.id} via socket`);
        });
      } catch (err) {
        console.error('Erro ao buscar salas para joinRoom:', err);
      }
    });

    newSocket.on('receiveMessage', (msg) => {
      console.log('📨 [SocketContext] Mensagem recebida:', msg);

      const isInSameRoom = Number(currentRoomIdRef.current) === Number(msg.roomId);

      if (msg.sender_id !== user.id && !isInSameRoom && window.electronAPI) {
        window.electronAPI.notify({
          title: `Nova mensagem de ${msg.sender} (${msg.sector_name || ''})`,
          body: `${msg.message || msg.content} `,
        });
      }

      messageListenersRef.current.forEach((listener) => listener(msg));
    });

    // ✅ Novo: Escutar atualizações de usuários online
    newSocket.on('updateOnlineUsers', (users) => {
      console.log('🟢 Atualização de online users recebida:', users);
      setAllOnlineUsers(users);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket desconectado do SocketContext');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  const setCurrentRoomId = (roomId) => {
    currentRoomIdRef.current = roomId;
  };

  const addMessageListener = (listener) => {
    messageListenersRef.current.push(listener);
  };

  const removeMessageListener = (listener) => {
    messageListenersRef.current = messageListenersRef.current.filter((l) => l !== listener);
  };

  const value = {
    socket,
    setCurrentRoomId,
    addMessageListener,
    removeMessageListener,
    allOnlineUsers, // ✅ Novo: Expor pro frontend inteiro
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
