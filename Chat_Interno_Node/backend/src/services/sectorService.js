const pool = require('../config/db');

exports.getAllSectors = async () => {
    const result = await pool.query('SELECT * FROM sector ORDER BY sector_id');
    return result.rows;
};
