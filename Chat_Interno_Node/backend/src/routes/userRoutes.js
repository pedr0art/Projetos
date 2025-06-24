const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const pool = require('../config/db');

// Rota para pegar todos os usuários
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.full_name, s.sector_id, s.sector_name
      FROM users u
      LEFT JOIN sector s ON u.sector_id = s.sector_id
      ORDER BY u.full_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Rota para pegar o usuário atual
router.get('/me', authMiddleware, userController.getCurrentUser);

// Rota para pegar todas as salas do usuário (para o socket join)
router.get('/:id/rooms', authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const result = await pool.query(
      `SELECT r.id, r.name
       FROM rooms r
       JOIN user_rooms ur ON ur.room_id = r.id
       WHERE ur.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar salas do usuário:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
