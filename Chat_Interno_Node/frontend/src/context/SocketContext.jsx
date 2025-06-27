import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [allOnlineUsers, setAllOnlineUsers] = useState([]);
  const currentRoomIdRef = useRef(null);
  const messageListenersRef = useRef([]);

  useEffect(() => {
    if (!token || !user) return;

    console.log('🔁 Criando novo socket com token e user:', { token, user });

    const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
    });

    // Registra o listener assim que o socket é criado, evita perder eventos emitidos logo após a conexão
    newSocket.on('updateOnlineUsers', (users) => {
      console.log('🟢 Lista de usuários online atualizada:', users);
      setAllOnlineUsers(users);
    });

    newSocket.on('receiveMessage', (msg) => {
      console.log('📨 Mensagem recebida:', msg);

      const isInSameRoom = Number(currentRoomIdRef.current) === Number(msg.roomId);
      if (msg.sender_id !== user.id && !isInSameRoom && window.electronAPI) {
        window.electronAPI.notify({
          title: `Nova mensagem de ${msg.sender} (${msg.sector_name || ''})`,
          body: `${msg.message || msg.content} `,
          route: `/chat/${msg.roomId}`
        });
      }

      messageListenersRef.current.forEach((listener) => listener(msg));
    });

    newSocket.on('connect', async () => {
      console.log('✅ Socket conectado');

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Falha ao buscar salas');

        const rooms = await res.json();
        rooms.forEach((room) => {
          newSocket.emit('joinRoom', room.id);
          console.log(`🔗 Entrando na sala ${room.id} via socket`);
        });
      } catch (err) {
        console.error('Erro ao buscar salas para joinRoom:', err);
      }

      // Opcional: mantém fallback como segurança extra
      fetchOnlineUsersFallback();
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket desconectado');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      console.log('🔁 Socket desmontado');
    };
  }, [token, user]);

  // Fallback: REST para garantir que a lista de usuários online venha mesmo que o socket demore
  const fetchOnlineUsersFallback = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/online-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao buscar usuários online via fallback');
      const data = await res.json();
      console.log('📡 Fallback: usuários online recebidos', data);
      setAllOnlineUsers(data);
    } catch (err) {
      console.error('❌ Fallback: erro ao buscar usuários online:', err);
    }
  };

  const joinRoom = (roomId) => {
    if (socket && roomId) {
      socket.emit('joinRoom', roomId);
      console.log(`🧩 Entrando na sala ${roomId} via joinRoom`);
    }
  };

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
    joinRoom,
    setCurrentRoomId,
    addMessageListener,
    removeMessageListener,
    allOnlineUsers,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
