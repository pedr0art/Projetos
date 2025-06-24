const roomService = require('../services/roomService');
const pool = require('../config/db');
const { getIO } = require('../sockets/socketHandler');
exports.createRoom = async (req, res) => {
    const { name, is_group, users } = req.body;
    const userId = req.user.id;

    try {
        const room = await roomService.createRoom(name, is_group, userId, users);

        // Emitir o evento para todos os usuários da sala (incluindo o criador)
        const io = getIO();
        const allUserIds = [...new Set([userId, ...users])]; // Sem duplicados

        allUserIds.forEach((id) => {
            io.to(`user_${id}`).emit('roomAdded');
        });

        res.status(201).json(room);
    } catch (err) {
        console.error('Erro ao criar sala:', err);
        res.status(400).json({ error: err.message });
    }
};


exports.getUserRooms = async (req, res) => {
    const userId = req.user.id;

    try {
        const rooms = await roomService.getUserRooms(userId);
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteRoom = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        await pool.query(
            'DELETE FROM rooms WHERE id = $1 AND id IN (SELECT room_id FROM user_rooms WHERE user_id = $2)',
            [id, userId]
        );
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar sala' });
    }
};

exports.addUserToRoom = async (req, res) => {
    const roomId = req.params.id;
    const { full_name } = req.body;

    try {
        const userRes = await pool.query('SELECT id FROM users WHERE full_name = $1', [full_name]);

        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const userId = userRes.rows[0].id;

        await pool.query(
            'INSERT INTO user_rooms (user_id, room_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, roomId]
        );

        getIO().to(`user_${userId}`).emit('roomAdded');

        res.status(200).json({ message: 'Usuário adicionado à sala com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao adicionar usuário à sala' });
    }
};
exports.getRoomById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM rooms WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sala não encontrada' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao buscar sala por id:', err);
        res.status(500).json({ error: 'Erro ao buscar sala' });
    }
};
