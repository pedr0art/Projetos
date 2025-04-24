const pool = require('../config/db');

exports.getMessagesByRoom = async (roomId) => {
    const result = await pool.query(
        `
    SELECT m.id, m.content, m.created_at, u.username AS sender
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.room_id = $1
    ORDER BY m.created_at ASC
    `,
        [roomId]
    );

    return result.rows;
};
