const pool = require('../config/db');

async function getDashboardSummary() {
  const totalRooms = await pool.query(
    'SELECT COUNT(*) FROM rooms'
  );

  const openRooms = await pool.query(
    'SELECT COUNT(*) FROM rooms WHERE is_finished = false'
  );

  const closedRooms = await pool.query(
    'SELECT COUNT(*) FROM rooms WHERE is_finished = true'
  );

  const totalMessages = await pool.query(
    'SELECT COUNT(*) FROM messages'
  );

  const topSector = await pool.query(`
    SELECT s.sector_name, COUNT(*) AS total
    FROM rooms r
    JOIN sector s ON s.sector_id = r.sector_id
    GROUP BY s.sector_name
    ORDER BY total DESC
    LIMIT 1
  `);

  return {
    totalRooms: Number(totalRooms.rows[0].count),
    openRooms: Number(openRooms.rows[0].count),
    closedRooms: Number(closedRooms.rows[0].count),
    totalMessages: Number(totalMessages.rows[0].count),
    topSector: topSector.rows[0]?.sector_name || 'N/A'
  };
}


async function getRoomsByStatus() {
  const result = await pool.query(`
    SELECT 
      CASE 
        WHEN is_finished = false THEN 'Abertos'
        ELSE 'Finalizados'
      END AS status,
      COUNT(*) AS total
    FROM rooms
    GROUP BY is_finished
  `);

  return result.rows.map(r => ({
    name: r.status,
    value: Number(r.total)
  }));
}
async function getRoomsBySector() {
  const result = await pool.query(`
    SELECT
      COALESCE(s.sector_abbreviation, s.sector_name) AS abbreviation,
      s.sector_name AS name,
      COUNT(r.id) AS value
    FROM rooms r
    LEFT JOIN sector s ON s.sector_id = r.sector_id
    GROUP BY s.sector_abbreviation, s.sector_name
    ORDER BY value DESC
  `);

  return result.rows.map(row => ({
    abbreviation: row.abbreviation,
    name: row.name,
    value: Number(row.value)
  }));
}
async function getMessagesOverTime(group = 'day') {
  let query;

  if (group === 'month') {
    query = `
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') AS label,
        COUNT(*) AS total
      FROM messages
      GROUP BY label
      ORDER BY label
    `;
  } else {
    query = `
      SELECT
        DATE(created_at) AS label,
        COUNT(*) AS total
      FROM messages
      GROUP BY DATE(created_at)
      ORDER BY label
    `;
  }

  const result = await pool.query(query);

  return result.rows.map(r => ({
    name: r.label,
    value: Number(r.total)
  }));
}
async function getTopCreators() {
  const result = await pool.query(`
    SELECT
      u.full_name AS name,
      COUNT(r.id) AS total
    FROM rooms r
    JOIN users u ON u.id = r.created_by
    GROUP BY u.full_name
    ORDER BY total DESC
    LIMIT 10
  `);

  return result.rows.map(r => ({
    name: r.name,
    value: Number(r.total)
  }));
}

module.exports = {
  getDashboardSummary,
  getRoomsByStatus,
  getRoomsBySector,
  getMessagesOverTime,
  getTopCreators
};
