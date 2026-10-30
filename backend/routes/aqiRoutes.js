const express = require('express');
const {
  getCurrentAQI,
  getAQIByCoordinates,
  getAQIByBounds,
  getAQIStationDetails,
  reverseGeocode,
  searchLocation,
  getAQIHistory,
  getAQIForecast,
  getAQIStatistics,
  getAllSensorsAQI,
  submitAQIReading,
  getSensorWiseHistory,
  getIndianCitiesComparison,
} = require('../controllers/aqiController');
const authenticate = require('../middleware/authenticate');
const { optionalAuthenticate } = authenticate;
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(apiLimiter);

// Location & Geocoding Routes (Public with optional user context)
router.get('/geo', optionalAuthenticate, getAQIByCoordinates);
router.get('/bounds', optionalAuthenticate, getAQIByBounds);
router.get('/station/:uid', optionalAuthenticate, getAQIStationDetails);
router.get('/reverse-geocode', optionalAuthenticate, reverseGeocode);
router.get('/search-location', optionalAuthenticate, searchLocation);

// Get current AQI (supports ?city=... or ?lat=...&lon=...)
router.get('/current', optionalAuthenticate, getCurrentAQI);

// Get AQI history for a sensor / city / coordinates
router.get('/history', optionalAuthenticate, getAQIHistory);

// Get AQI forecast for a city / coordinates
router.get('/forecast', optionalAuthenticate, getAQIForecast);

// Get AQI statistics
router.get('/statistics', optionalAuthenticate, getAQIStatistics);

// Get all sensors with current AQI
router.get('/sensors', optionalAuthenticate, getAllSensorsAQI);

// Submit new AQI reading (strictly authenticated)
router.post('/submit', authenticate, submitAQIReading);

// Get sensor-wise history
router.get('/sensor-history', optionalAuthenticate, getSensorWiseHistory);

// Get comparison of Indian cities
router.get('/comparison', optionalAuthenticate, getIndianCitiesComparison);

module.exports = router;
