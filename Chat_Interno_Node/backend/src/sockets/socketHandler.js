const jwt = require('jsonwebtoken');
const pool = require('../config/db');
let ioInstance;

module.exports = (io) => {
  ioInstance = io;

  // Função para emitir a lista atualizada de usuários online para todos
  const emitOnlineUsers = async () => {
    try {
      const result = await pool.query(`
        SELECT u.id, u.full_name, u.sector_id, s.sector_name, u.is_online
        FROM users u
        LEFT JOIN sector s ON s.sector_id = u.sector_id
        WHERE u.is_online = true
      `);
      io.emit('updateOnlineUsers', result.rows);
    } catch (err) {
      console.error('Erro ao emitir lista de usuários online:', err);
    }
  };

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Token ausente'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`🟢 Usuário conectado: ${socket.user.username}`);

    try {
      await pool.query(
        'UPDATE users SET is_online = true WHERE id = $1',
        [socket.user.id]
      );
      await emitOnlineUsers(); // Emite a lista atualizada
    } catch (err) {
      console.error('Erro ao atualizar is_online para true:', err);
    }

    // Sala individual de cada usuário
    const userRoom = `user_${socket.user.id}`;
    socket.join(userRoom);

    // Entrar em todas as salas que o usuário faz parte
    try {
      const userRoomsResult = await pool.query(
        'SELECT room_id FROM user_rooms WHERE user_id = $1',
        [socket.user.id]
      );

      const userRoomIds = userRoomsResult.rows.map((r) => String(r.room_id));

      userRoomIds.forEach((roomId) => {
        socket.join(roomId);
        console.log(`🔗 ${socket.user.username} conectado na sala ${roomId}`);
      });
    } catch (err) {
      console.error('Erro ao buscar salas do usuário:', err);
    }

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`${socket.user.username} entrou manualmente na sala ${roomId}`);
    });

    socket.on('sendMessage', async ({ roomId, message }) => {
      try {
        const result = await pool.query(
          'INSERT INTO messages (sender_id, room_id, content) VALUES ($1, $2, $3) RETURNING *',
          [socket.user.id, roomId, message]
        );

        const savedMessage = result.rows[0];

        const userResult = await pool.query(
          `SELECT u.full_name, s.sector_name
           FROM users u
           LEFT JOIN sector s ON u.sector_id = s.sector_id
           WHERE u.id = $1`,
          [savedMessage.sender_id]
        );

        const senderFullName = userResult.rows[0].full_name;
        const senderSector = userResult.rows[0].sector_name;

        console.log(
          '🔔 Emitindo para sala:',
          roomId,
          'usuários conectados:',
          io.sockets.adapter.rooms.get(String(roomId))
        );

        io.to(roomId).emit('receiveMessage', {
          message: savedMessage.content,
          sender: senderFullName,
          sector_name: senderSector,
          sender_id: savedMessage.sender_id,
          roomId: savedMessage.room_id,
          created_at: savedMessage.created_at
        });
      } catch (err) {
        console.error('Erro ao enviar mensagem via socket:', err);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`🔴 ${socket.user.username} desconectado`);

      try {
        await pool.query(
          'UPDATE users SET is_online = false WHERE id = $1',
          [socket.user.id]
        );
        await emitOnlineUsers(); // Emite a lista atualizada
      } catch (err) {
        console.error('Erro ao atualizar is_online para false:', err);
      }
    });
  });
};

module.exports.getIO = () => ioInstance;
