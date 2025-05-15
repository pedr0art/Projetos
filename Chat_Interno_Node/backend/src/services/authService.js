const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const jwtSecret = process.env.JWT_SECRET;

exports.register = async (username, password, sector_id) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (username, password_hash, sector_id) VALUES ($1, $2, $3) RETURNING id, username, sector_id',
        [username, hashedPassword, sector_id]
    );
    return result.rows[0];
};

exports.login = async (username, password) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
    );

    if (result.rows.length === 0) throw new Error('Usuário não encontrado');

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) throw new Error('Senha incorreta');

    const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, {
        expiresIn: '1h'
    });

    return { token, user: { id: user.id, username: user.username } };
};
