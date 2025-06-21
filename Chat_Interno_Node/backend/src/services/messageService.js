const pool = require('../config/db');

exports.getMessagesByRoom = async (roomId) => {
    const result = await pool.query(
      `SELECT m.id, m.content, m.created_at, m.sender_id, u.full_name AS sender, s.sector_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       LEFT JOIN sector s ON u.sector_id = s.sector_id
       WHERE m.room_id = $1
       ORDER BY m.created_at ASC`,
      [roomId]
    );

    return result.rows;
};
