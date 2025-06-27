const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const jwtSecret = process.env.JWT_SECRET;

exports.register = async (username, password, sector_id, full_name) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (username, password_hash, sector_id, full_name) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, sector_id',
        [username, hashedPassword, sector_id, full_name]
    );
    return result.rows[0];
};

exports.login = async (username, password) => {
  const result = await pool.query(`
    SELECT u.id, u.username, u.full_name, u.sector_id, s.sector_name, u.password_hash
    FROM users u
    LEFT JOIN sector s ON u.sector_id = s.sector_id
    WHERE u.username = $1
  `, [username]);

  if (result.rows.length === 0) throw new Error('Usuário não encontrado');

  const user = result.rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) throw new Error('Senha incorreta');

  const token = jwt.sign(
    { id: user.id, username: user.username, sector_id: user.sector_id },
    jwtSecret,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      sector_id: user.sector_id,
      sector_name: user.sector_name,
    }
  };
};
