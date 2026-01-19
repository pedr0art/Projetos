const roomService = require('../services/roomService');
const pool = require('../config/db');
const { getIO } = require('../sockets/socketHandler');
// backend/src/controllers/roomController.js
exports.createRoom = async (req, res) => {
  const { name, is_group, users = [], target_sector_id } = req.body;
  const userId = req.user.id;

  try {
    // Pegar setor do criador
    const userRes = await pool.query('SELECT sector_id FROM users WHERE id = $1', [userId]);
    const creatorSectorId = userRes.rows[0]?.sector_id || null;

    // Chamar o service com objeto (contain todos campos que queremos gravar)
    const room = await roomService.createRoom({
      name,
      isGroup: !!is_group,
      creatorId: userId,
      creatorSectorId,
      targetSectorId: target_sector_id ?? null,
      userIds: users || []
    });

    const io = getIO();

    // Emitir para todos usuários (inclui criador + adicionados)
    const allUserIds = [...new Set([userId, ...(users || [])])];
    allUserIds.forEach((id) => {
      io.to(`user_${id}`).emit('roomAdded', room);
    });

    res.status(201).json(room);
  } catch (err) {
    console.error('Erro ao criar sala:', err);
    res.status(400).json({ error: err.message });
  }
};



exports.getUserRooms = async (req, res) => {
  const userId = req.user.id;
  const includeFinished = req.query.includeFinished === 'true';

  try {
    const rooms = await roomService.getUserRooms(userId, includeFinished);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.finishRoom = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Verifica se o usuário participa da sala e busca usuários da sala
    const usersInRoomRes = await pool.query(
      'SELECT user_id FROM user_rooms WHERE room_id = $1',
      [id]
    );
    const userIds = usersInRoomRes.rows.map((row) => row.user_id);

    // Atualiza o campo is_finished na sala
    const updateRes = await pool.query(
      `UPDATE rooms
       SET is_finished = true
       WHERE id = $1
         AND id IN (SELECT room_id FROM user_rooms WHERE user_id = $2)
       RETURNING *`,
      [id, userId]
    );

    if (updateRes.rowCount === 0) {
      return res.status(403).json({ error: 'Você não pode finalizar esta sala' });
    }

    const io = getIO();

    // Emite evento para todos usuários da sala (usando a sala do socket)
// Emite para usuários na sala (ChatRoomPage)
    io.to(String(id)).emit('roomFinished', { roomId: parseInt(id) });

    // Emite para usuários que atualizam a lista (RoomsPage)
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
    const roomRes = await pool.query(
      'SELECT * FROM rooms WHERE id = $1',
      [id]
    );

    if (roomRes.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const room = roomRes.rows[0];

    // Buscar os usuários da sala com nome e setor
    const usersRes = await pool.query(
      `SELECT u.id, u.full_name, s.sector_name, u.sector_id
       FROM user_rooms ur
       JOIN users u ON u.id = ur.user_id
       JOIN sector s ON s.sector_id = u.sector_id
       WHERE ur.room_id = $1`,
      [id]
    );

    room.users = usersRes.rows;

    res.json(room);
  } catch (err) {
    console.error('Erro ao buscar sala por id:', err);
    res.status(500).json({ error: 'Erro ao buscar sala' });
  }
};
