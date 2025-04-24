const pool = require('../config/db');

exports.createRoom = async (name, isGroup, userId) => {
    const roomRes = await pool.query(
        'INSERT INTO rooms (name, is_group) VALUES ($1, $2) RETURNING *',
        [name, isGroup]
    );

    const room = roomRes.rows[0];

    await pool.query(
        'INSERT INTO user_rooms (user_id, room_id) VALUES ($1, $2)',
        [userId, room.id]
    );

    return room;
};

exports.getUserRooms = async (userId) => {
    const result = await pool.query(
        `
    SELECT 
      r.*, 
      (SELECT COUNT(*) FROM user_rooms ur2 WHERE ur2.room_id = r.id) AS member_count
    FROM rooms r
    JOIN user_rooms ur ON ur.room_id = r.id
    WHERE ur.user_id = $1
    `,
        [userId]
    );

    return result.rows;
};
