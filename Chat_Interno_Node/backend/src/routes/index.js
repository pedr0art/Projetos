const express = require('express');
const router = express.Router();

// Aqui você vai importar outras rotas, ex:
router.use('/auth', require('./authRoutes'));
router.use('/rooms', require('./messageRoutes'));
router.use('/rooms', require('./roomRoutes'));
router.use('/sectors', require('./sectorRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
module.exports = router;
