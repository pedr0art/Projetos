const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

router.get(
  '/summary',
  authenticateToken,
  dashboardController.getSummary
);
router.get(
  '/rooms-status',
  authenticateToken,
  dashboardController.getRoomsStatusChart
);
router.get(
  '/rooms-by-sector',
  authenticateToken,
  dashboardController.getRoomsBySector
);
router.get(
  '/messages-over-time',
  authenticateToken,
  dashboardController.getMessagesOverTime
);
router.get(
  '/top-creators',
  authenticateToken,
  dashboardController.getTopCreators
);

module.exports = router;
