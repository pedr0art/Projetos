const roomService = require('../services/roomService');
const pool = require('../config/db');
const { getIO } = require('../sockets/socketHandler');
exports.createRoom = async (req, res) => {
  const { name, is_group, users } = req.body;
  const userId = req.user.id;

  try {
    const room = await roomService.createRoom(name, is_group, userId, users);

    const io = getIO();
    const allUserIds = [...new Set([userId, ...users])];

    // Adicione o creator_id à resposta enviada no socket
    allUserIds.forEach((id) => {
      io.to(`user_${id}`).emit('roomAdded', {
        id: room.id,
        name: room.name,
        is_group: room.is_group,
        creator_id: userId, // <- importante!
      });
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

exports.finishRoom = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Verifica se o usuário participa da sala
    const usersInRoomRes = await pool.query(
      'SELECT user_id FROM user_rooms WHERE room_id = $1',
      [id]
    );
    const userIds = usersInRoomRes.rows.map((row) => row.user_id);

    // Atualiza o campo is_finished na sala
    await pool.query(
      `UPDATE rooms
       SET is_finished = true
       WHERE id = $1
         AND id IN (SELECT room_id FROM user_rooms WHERE user_id = $2)`,
      [id, userId]
    );

    const io = getIO();
    userIds.forEach((uid) => {
      io.to(`user_${uid}`).emit('roomDeleted', { room_id: parseInt(id) });
    });

    res.status(200).json({ message: 'Sala finalizada com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao finalizar sala' });
  }
};



exports.addUserToRoom = async (req, res) => {
    const roomId = req.params.id;
    const { full_name } = req.body;
    const creatorId = req.user.id;

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

        getIO().to(`user_${userId}`).emit('roomAdded', {
        id: parseInt(roomId),
        creator_id: creatorId,
        });

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
