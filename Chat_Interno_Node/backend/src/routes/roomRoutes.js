const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const roomController = require('../controllers/roomController');


router.post('/', auth, roomController.createRoom);
router.get('/', auth, roomController.getUserRooms);
router.delete('/:id', auth, roomController.deleteRoom);
router.post('/:id/add', auth, roomController.addUserToRoom);


module.exports = router;
