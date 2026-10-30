const express = require('express');
const {
  generatePrediction,
  getLatestPrediction,
  getOrganizationPredictions,
  getPollutionTrends,
  generateBatchPredictions,
  calculatePrediction,
} = require('../controllers/predictionController');
const authenticate = require('../middleware/authenticate');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(apiLimiter);

// Calculate custom prediction using Mathematical Daily-Cycle model
router.post('/calculate', calculatePrediction);

// Generate prediction for a sensor
router.post('/generate', generatePrediction);

// Get latest prediction for a sensor
router.get('/latest/:sensorId', getLatestPrediction);

// Get all predictions for organization
router.get('/organization', getOrganizationPredictions);

// Get pollution trends
router.get('/trends', getPollutionTrends);

// Generate batch predictions for all sensors
router.post('/batch-generate', generateBatchPredictions);

module.exports = router;
