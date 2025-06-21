const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');


const pool = require('../config/db');

// Rota para pegar todos os usuários (você já tem)
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

// Rota para pegar o usuário atual (adicionar esta)
router.get('/me', authMiddleware, userController.getCurrentUser);

module.exports = router;
