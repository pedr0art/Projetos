const jwt = require('jsonwebtoken');
const pool = require('../config/db');

let ioInstance;

module.exports = (io) => {
    ioInstance = io;

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

        // Cada usuário entra automaticamente numa sala só dele
        const userRoom = `user_${socket.user.id}`;
        socket.join(userRoom);

        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`${socket.user.username} entrou na sala ${roomId}`);
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
                console.log('🔔 Emitindo para sala:', roomId, 'usuários conectados:', io.sockets.adapter.rooms.get(String(roomId)));


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

        socket.on('disconnect', () => {
            console.log(`🔴 ${socket.user.username} desconectado`);
        });
    });
};

// Exporta a instância do io para outros módulos (ex: roomController)
module.exports.getIO = () => ioInstance;
