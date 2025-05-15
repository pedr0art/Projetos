const express = require('express');
const router = express.Router();
const sectorController = require('../controllers/sectorController');

router.get('/', sectorController.getAllSectors);

module.exports = router;
