const mongoose = require('mongoose');
const User = require('../models/User');
const Sensor = require('../models/Sensor');
const AQIHistory = require('../models/AQIHistory');

const INDIAN_CITIES = [
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567 },
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lon: 80.9462 },
];

const seedData = async () => {
  try {
    console.log('Starting Indian Cities Seeding...');

    // Create sensors for each city
    for (const city of INDIAN_CITIES) {
      console.log(`Seeding data for ${city.name}...`);

      const sensor = await Sensor.create({
        sensorId: `SENSOR_${city.name.toUpperCase().substring(0, 3)}_${Math.floor(100 + Math.random() * 899)}`,
        name: `${city.name} Air Monitor`,
        type: 'combined',
        location: {
          name: `${city.name} Central`,
          city: city.name,
          latitude: city.lat,
          longitude: city.lon,
          address: `${city.name}, India`,
        },
        status: 'active',
        isOnline: true,
      });

      // Create some historical data for this sensor
      const readings = [];
      for (let i = 0; i < 24; i++) {
        const aqiValue = Math.floor(50 + Math.random() * 250);
        readings.push({
          sensor: sensor._id,
          aqi: {
            value: aqiValue,
            category: getCategory(aqiValue),
            level: getLevel(aqiValue),
          },
          pollutants: {
            pm2_5: Math.floor(aqiValue * 0.6),
            pm10: Math.floor(aqiValue * 1.2),
            no2: Math.floor(20 + Math.random() * 40),
            so2: Math.floor(5 + Math.random() * 15),
            co: (1 + Math.random() * 2).toFixed(1),
          },
          environmental: {
            temperature: Math.floor(25 + Math.random() * 15),
            humidity: Math.floor(30 + Math.random() * 60),
            pressure: 1010 + Math.floor(Math.random() * 10),
          },
          timestamp: new Date(Date.now() - i * 3600000),
        });
      }
      await AQIHistory.insertMany(readings);
    }

    console.log('Indian Cities Seeding Completed!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

const getCategory = (aqi) => {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'satisfactory';
  if (aqi <= 200) return 'moderately_polluted';
  if (aqi <= 300) return 'poor';
  if (aqi <= 400) return 'very_poor';
  return 'severe';
};

const getLevel = (aqi) => {
  if (aqi <= 50) return 'low';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 200) return 'high';
  if (aqi <= 300) return 'very_high';
  return 'hazardous';
};

module.exports = seedData;

// Run if called directly
if (require.main === module) {
  // Connect to DB
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  const connectDB = require('../config/database');
  connectDB().then(() => {
    seedData().then(() => {
      console.log('Seeding finished. Closing connection...');
      mongoose.connection.close();
    });
  });
}
