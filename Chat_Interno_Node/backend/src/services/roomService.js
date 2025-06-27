    const pool = require('../config/db');

    exports.createRoom = async (name, isGroup, creatorId, userIds = []) => {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Criar a sala
            const roomRes = await client.query(
                'INSERT INTO rooms (name, is_group) VALUES ($1, $2) RETURNING *',
                [name, isGroup]
            );

            const room = roomRes.rows[0];

            // Adicionar o criador da sala
            await client.query(
                'INSERT INTO user_rooms (user_id, room_id) VALUES ($1, $2)',
                [creatorId, room.id]
            );

            // Adicionar os demais usuários (se tiver)
            for (const userId of userIds) {
                // Evitar duplicar o criador
                if (userId !== creatorId) {
                    await client.query(
                        'INSERT INTO user_rooms (user_id, room_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [userId, room.id]
                    );
                }
            }

            await client.query('COMMIT');
            return room;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    };
    exports.getUserRooms = async (userId) => {
        const result = await pool.query(
            `
            SELECT 
                r.*, 
                (SELECT COUNT(*) FROM user_rooms ur2 WHERE ur2.room_id = r.id) AS member_count,
                m.content AS last_message,
                m.created_at AS last_message_time,
                m.sender_id AS last_sender_id
            FROM rooms r
            JOIN user_rooms ur ON ur.room_id = r.id
            LEFT JOIN LATERAL (
                SELECT content, created_at, sender_id
                FROM messages 
                WHERE room_id = r.id 
                ORDER BY created_at DESC 
                LIMIT 1
            ) m ON true
            WHERE ur.user_id = $1
            AND r.is_finished = false
            `,
            [userId]
        );

        return result.rows;
    };

