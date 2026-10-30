const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateUniqueId = (prefix = '') => {
  return `${prefix}${uuidv4()}`;
};

const getAQICategory = (aqi) => {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'satisfactory';
  if (aqi <= 200) return 'moderately_polluted';
  if (aqi <= 300) return 'poor';
  if (aqi <= 400) return 'very_poor';
  return 'severe';
};

const getAQILevel = (aqi) => {
  if (aqi <= 100) return 'low';
  if (aqi <= 200) return 'moderate';
  if (aqi <= 300) return 'high';
  if (aqi <= 400) return 'very_high';
  return 'hazardous';
};

const formatDate = (date) => {
  return new Date(date).toISOString();
};

const calculateDateRange = (type) => {
  const now = new Date();
  let startDate;

  switch (type) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 7));
  }

  return { startDate, endDate: new Date() };
};

module.exports = {
  generateOTP,
  generateToken,
  generateUniqueId,
  getAQICategory,
  getAQILevel,
  formatDate,
  calculateDateRange,
};
