const jwt = require('jsonwebtoken');
const pool = require('../config/db');

module.exports = (io) => {
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

    io.on('connection', (socket) => {
        console.log(`🟢 Usuário conectado: ${socket.user.username}`);

        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`${socket.user.username} entrou na sala ${roomId}`);
        });

        socket.on('sendMessage', async ({ roomId, message }) => {
            const result = await pool.query(
                'INSERT INTO messages (sender_id, room_id, content) VALUES ($1, $2, $3) RETURNING *',
                [socket.user.id, roomId, message]
            );

            io.to(roomId).emit('receiveMessage', {
                message: result.rows[0].content,
                senderId: result.rows[0].sender_id,
                roomId: result.rows[0].room_id,
                createdAt: result.rows[0].created_at
            });
        });

        socket.on('disconnect', () => {
            console.log(`🔴 ${socket.user.username} desconectado`);
        });
    });
};
