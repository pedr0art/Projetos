const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const roomController = require('../controllers/roomController');


router.post('/', auth, roomController.createRoom);
router.get('/', auth, roomController.getUserRooms);
router.get('/:id', auth, roomController.getRoomById);
router.patch('/:id/finish', auth, roomController.finishRoom);
router.post('/:id/add', auth, roomController.addUserToRoom);


module.exports = router;
