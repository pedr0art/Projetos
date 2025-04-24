const messageService = require('../services/messageService');

exports.getMessagesByRoom = async (req, res) => {
    const roomId = req.params.id;

    try {
        const messages = await messageService.getMessagesByRoom(roomId);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
};
