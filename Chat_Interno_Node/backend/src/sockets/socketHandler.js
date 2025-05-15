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
            try {
                // Insere a mensagem
                const result = await pool.query(
                    'INSERT INTO messages (sender_id, room_id, content) VALUES ($1, $2, $3) RETURNING *',
                    [socket.user.id, roomId, message]
                );

                const savedMessage = result.rows[0];

                // Busca o username do remetente
                const userResult = await pool.query(
                    'SELECT username FROM users WHERE id = $1',
                    [savedMessage.sender_id]
                );

                const senderUsername = userResult.rows[0].username;

                // Emite a mensagem com o nome do remetente
                io.to(roomId).emit('receiveMessage', {
                    message: savedMessage.content,
                    sender: senderUsername, // ✅ agora o frontend reconhece como sua
                    roomId: savedMessage.room_id,
                    createdAt: savedMessage.created_at
                });
            } catch (err) {
                console.error('Erro ao enviar mensagem via socket:', err);
            }
        });


        socket.on('disconnect', () => {
            console.log(`🔴 ${socket.user.username} desconectado`);
        });
    });
};
