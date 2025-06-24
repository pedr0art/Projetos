const pool = require('../config/db');
const { onlineUsers } = require('../sockets/socketHandler'); 
exports.getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.full_name, u.sector_id, s.sector_name, u.is_online
      FROM users u
      LEFT JOIN sector s ON s.sector_id = u.sector_id
      WHERE u.id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.full_name, u.sector_id, s.sector_name, u.is_online
      FROM users u
      LEFT JOIN sector s ON s.sector_id = u.sector_id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};
