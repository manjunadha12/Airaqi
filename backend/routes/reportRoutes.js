const express = require('express');
const {
  generateReport,
  getDownloadHistory,
  getDownloadById,
  deleteDownloadRecord,
  getDownloadStatistics,
  exportDownloadLogs,
} = require('../controllers/reportController');
const authenticate = require('../middleware/authenticate');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(apiLimiter);

// Generate report
router.post('/generate', generateReport);

// Get download history
router.get('/history', getDownloadHistory);

// Get download by ID
router.get('/:downloadId', getDownloadById);

// Delete download record
router.delete('/:downloadId', deleteDownloadRecord);

// Get download statistics
router.get('/statistics', getDownloadStatistics);

// Export download logs
router.get('/export/logs', exportDownloadLogs);

module.exports = router;
