const express = require('express');
const {
  createAlert,
  getAlerts,
  getAlertById,
  acknowledgeAlert,
  resolveAlert,
  getAlertStatistics,
  getAlertHistory,
} = require('../controllers/alertController');
const authenticate = require('../middleware/authenticate');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(apiLimiter);

// Create alert
router.post('/', createAlert);

// Get alerts
router.get('/', getAlerts);

// Get alert by ID
router.get('/:alertId', getAlertById);

// Acknowledge alert
router.put('/:alertId/acknowledge', acknowledgeAlert);

// Resolve alert
router.put('/:alertId/resolve', resolveAlert);

// Get alert statistics
router.get('/statistics', getAlertStatistics);

// Get alert history
router.get('/history', getAlertHistory);

module.exports = router;
