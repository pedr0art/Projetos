const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const jwtSecret = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token ausente' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente' });

  try {
    const decoded = jwt.verify(token, jwtSecret);

    // Buscar dados completos do usuário no banco
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.sector_id, s.sector_name
       FROM users u
       LEFT JOIN sector s ON u.sector_id = s.sector_id
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Adiciona os dados completos no req.user
    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};
