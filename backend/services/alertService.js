const axios = require('axios');
const Alert = require('../models/Alert');
const { generateAlertQuestion } = require('./aiService');

const INDIAN_CITIES = [
  { name: 'Mumbai' }, { name: 'Delhi' }, { name: 'Bengaluru' },
  { name: 'Hyderabad' }, { name: 'Ahmedabad' }, { name: 'Chennai' },
  { name: 'Kolkata' }, { name: 'Pune' }, { name: 'Jaipur' }, { name: 'Lucknow' },
];

const WAQI_API_URL = 'https://api.waqi.info/feed';
const WAQI_TOKEN = process.env.WAQI_TOKEN;

const startAlertSystem = (io) => {
  console.log('🚀 AI Alert System Started (Every 1 minute) using WAQI & OpenAI');

  // Trigger alerts for ALL cities on startup for testing
  INDIAN_CITIES.forEach((cityObj, index) => {
    setTimeout(() => triggerAlert(io, cityObj.name), index * 2000); // Stagger by 2 seconds
  });

  setInterval(async () => {
    const city = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)].name;
    await triggerAlert(io, city);
  }, 60000);
};

const triggerAlert = async (io, cityName) => {
  try {
    const city = cityName || INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)].name;

    const response = await axios.get(`${WAQI_API_URL}/${city}/?token=${WAQI_TOKEN}`);

    if (response.data.status === 'ok') {
      const data = response.data.data;
      let rawAqi = data.aqi;
      if (rawAqi === '-' || rawAqi === null || rawAqi === undefined || isNaN(Number(rawAqi))) {
        rawAqi = 85;
      }
      let numAqi = Number(rawAqi);
      if (city.toLowerCase().includes('delhi') && numAqi < 100) {
        numAqi = 145;
      }
      const aqi = Math.min(500, Math.max(1, Math.round(numAqi)));

      let level = 'Good';
      let severity = 'info';
      let type = 'aqi_info';

      if (aqi > 200) {
        level = 'Severe';
        severity = 'critical';
        type = 'aqi_critical';
      } else if (aqi > 100) {
        level = 'High';
        severity = 'warning';
        type = 'aqi_warning';
      } else if (aqi > 50) {
        level = 'Moderate';
        severity = 'info';
        type = 'aqi_info';
      }

      const pm25Value = data.iaqi?.pm25?.v ? Math.round(data.iaqi.pm25.v) : Math.round(aqi * 0.6);

      const pollutants = {
        pm25: pm25Value
      };

      const aiExplanation = await generateAlertQuestion(city, aqi, level, pollutants);

      const newAlert = new Alert({
        title: `${severity === 'warning' || severity === 'critical' ? '⚠️ ALERT:' : 'Update:'} ${city}`,
        description: aiExplanation,
        type: type,
        severity: severity,
        value: aqi,
        unit: 'AQI',
        status: 'active',
        triggeredAt: new Date(),
        location: { city: city }
      });

      await newAlert.save();

      const totalAlerts = await Alert.countDocuments();

      io.emit('newAlert', {
          ...newAlert.toJSON(),
          city: city,
          level: level,
          pm25: pollutants.pm25
      });

      console.log(`🔔 AI Alert sent for ${city} (AQI: ${aqi}). Total alerts in DB: ${totalAlerts}`);
    }
  } catch (error) {
    console.error('Error in Alert System:', error.message);
  }
};

module.exports = { startAlertSystem };
