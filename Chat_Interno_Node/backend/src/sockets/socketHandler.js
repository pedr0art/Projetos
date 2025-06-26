const jwt = require('jsonwebtoken');
const pool = require('../config/db');
let ioInstance;

module.exports = (io) => {
  ioInstance = io;

  const emitOnlineUsers = async () => {
    try {
      const result = await pool.query(`
        SELECT u.id, u.full_name, u.sector_id, s.sector_name, u.is_online
        FROM users u
        LEFT JOIN sector s ON s.sector_id = u.sector_id
        WHERE u.is_online = true
      `);
      console.log('🛰️ Emitindo lista de usuários online para todos os sockets conectados');
      io.emit('updateOnlineUsers', result.rows);
    } catch (err) {
      console.error('❌ Erro ao emitir lista de usuários online:', err);
    }
  };

  io.use((socket, next) => {
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
    console.log(`🟢 Usuário conectado: ${socket.user.username} (ID ${socket.user.id})`);

    try {
      await pool.query('UPDATE users SET is_online = true WHERE id = $1', [socket.user.id]);
      await emitOnlineUsers();
    } catch (err) {
      console.error('❌ Erro ao marcar usuário como online:', err);
    }

    socket.join(`user_${socket.user.id}`);

    try {
      const userRooms = await pool.query(
        `SELECT r.id, r.is_finished 
         FROM rooms r 
         JOIN user_rooms ur ON ur.room_id = r.id
         WHERE ur.user_id = $1`,
        [socket.user.id]
      );

      userRooms.rows.forEach((room) => {
        if (!room.is_finished) {
          socket.join(String(room.id));
          console.log(`🔗 ${socket.user.username} entrou na sala ${room.id}`);
        }
      });
    } catch (err) {
      console.error('❌ Erro ao buscar salas do usuário:', err);
    }

    socket.on('joinRoom', async (roomId) => {
      try {
        const result = await pool.query(
          'SELECT is_finished FROM rooms WHERE id = $1',
          [roomId]
        );

        if (result.rows.length === 0 || result.rows[0].is_finished) return;

        socket.join(String(roomId));
        console.log(`📥 ${socket.user.username} entrou manualmente na sala ${roomId}`);
      } catch (err) {
        console.error(`❌ Erro ao tentar entrar manualmente na sala ${roomId}:`, err);
      }
    });

    socket.on('sendMessage', async ({ roomId, message }) => {
      try {
        const roomCheck = await pool.query(
          'SELECT is_finished FROM rooms WHERE id = $1',
          [roomId]
        );

        if (roomCheck.rows.length === 0 || roomCheck.rows[0].is_finished) return;

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

        io.to(String(roomId)).emit('receiveMessage', {
          message: savedMessage.content,
          sender: senderFullName,
          sector_name: senderSector,
          sender_id: savedMessage.sender_id,
          roomId: savedMessage.room_id,
          created_at: savedMessage.created_at,
        });
      } catch (err) {
        console.error('❌ Erro ao enviar mensagem:', err);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`🔴 ${socket.user.username} desconectado`);
      try {
        await pool.query('UPDATE users SET is_online = false WHERE id = $1', [socket.user.id]);
        await emitOnlineUsers();
      } catch (err) {
        console.error('❌ Erro ao marcar usuário como offline:', err);
      }
    });
  });
};

module.exports.getIO = () => ioInstance;
const getOnlineUsers = async () => {
  const result = await pool.query(`
    SELECT u.id, u.full_name, u.sector_id, s.sector_name, u.is_online
    FROM users u
    LEFT JOIN sector s ON s.sector_id = u.sector_id
    WHERE u.is_online = true
  `);
  return result.rows;
};

module.exports.getOnlineUsers = getOnlineUsers;