const express = require('express');
const router = express.Router();
const pool = require('../config/db');

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

module.exports = router;
