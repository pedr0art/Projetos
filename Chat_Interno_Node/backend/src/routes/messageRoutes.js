const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:id/messages', authMiddleware, messageController.getMessagesByRoom);

module.exports = router;
