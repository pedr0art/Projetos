const pool = require('../config/db');
const messageService = require('../services/messageService');

exports.getMessagesByRoom = async (req, res) => {
  const roomId = req.params.id;
  const userSector = req.user.sector_id;

  try {
    // Verifica se a sala existe e se está finalizada
    const roomResult = await pool.query(
      'SELECT is_finished FROM rooms WHERE id = $1',
      [roomId]
    );

    if (roomResult.rowCount === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const isFinished = roomResult.rows[0].is_finished;

    // Se a sala estiver finalizada e o usuário não for do setor 29, nega acesso
    if (isFinished && userSector !== 29) {
      return res.status(403).json({ error: 'Sala finalizada. Acesso restrito.' });
    }

    const messages = await messageService.getMessagesByRoom(roomId);
    res.json(messages);
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
};
