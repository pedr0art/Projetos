const express = require('express');
const router = express.Router();

// Aqui você vai importar outras rotas, ex:
router.use('/auth', require('./authRoutes'));
router.use('/rooms', require('./messageRoutes'));
router.use('/rooms', require('./roomRoutes'));

module.exports = router;
