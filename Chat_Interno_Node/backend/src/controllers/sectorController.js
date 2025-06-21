const sectorService = require('../services/sectorService');

exports.getAllSectors = async (req, res) => {
    try {
        const sectors = await sectorService.getAllSectors();
        res.json(sectors);
    } catch (err) {
        console.error('Erro ao buscar setores:', err);  // 👈 Ajuda a debugar no terminal
        res.status(500).json({ error: 'Erro ao buscar setores' });
    }
};
    