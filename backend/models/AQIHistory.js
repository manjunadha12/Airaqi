const mongoose = require('mongoose');

const aqiHistorySchema = new mongoose.Schema(
  {
    sensor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sensor',
      required: true,
      index: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: false,
      default: null,
      index: true,
    },
    aqi: {
      value: {
        type: Number,
        required: true,
        min: 0,
        max: 500,
      },
      category: {
        type: String,
        enum: [
          'good',
          'satisfactory',
          'moderately_polluted',
          'poor',
          'very_poor',
          'severe',
        ],
      },
      level: {
        type: String,
        enum: ['low', 'moderate', 'high', 'very_high', 'hazardous'],
      },
    },
    pollutants: {
      pm2_5: { type: Number, default: 0 },
      pm10: { type: Number, default: 0 },
      no2: { type: Number, default: 0 },
      so2: { type: Number, default: 0 },
      co: { type: Number, default: 0 },
      o3: { type: Number, default: 0 },
      co2: { type: Number, default: 0 },
    },
    environmental: {
      temperature: Number,
      humidity: Number,
      pressure: Number,
      windSpeed: Number,
      windDirection: String,
      visibility: Number,
    },
    smokeLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    gasLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    sensorStatus: {
      isOnline: { type: Boolean, default: true },
      battery: { type: Number, default: 100 },
      signalStrength: { type: Number, default: 100 },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    recordedAt: Date,
  },
  {
    timestamps: true,
  }
);

// TTL Index for data retention (365 days by default)
aqiHistorySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 }
);

// Compound index for efficient queries
aqiHistorySchema.index({ sensor: 1, timestamp: -1 });
aqiHistorySchema.index({ organization: 1, timestamp: -1 });

module.exports = mongoose.model('AQIHistory', aqiHistorySchema);
