const authService = require('../services/authService');

exports.register = async (req, res) => {
    const { username, password, sector_id, full_name } = req.body;
    try {
        const result = await authService.register(username, password, sector_id, full_name);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await authService.login(username, password);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};
