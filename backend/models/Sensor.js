const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema(
  {
    sensorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: false,
      default: null,
    },
    location: {
      name: String,
      city: String,
      latitude: Number,
      longitude: Number,
      address: String,
    },
    type: {
      type: String,
      enum: ['air_quality', 'temperature', 'humidity', 'combined'],
      default: 'combined',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'faulty'],
      default: 'active',
    },
    lastActivity: Date,
    isOnline: {
      type: Boolean,
      default: false,
    },
    model: String,
    manufacturer: String,
    installationDate: Date,
    maintenanceSchedule: {
      nextMaintenance: Date,
      interval: String, // monthly, quarterly, annually
    },
    calibrationData: {
      lastCalibration: Date,
      nextCalibration: Date,
      factor: { type: Number, default: 1 },
    },
    specifications: {
      aqi_range: { min: Number, max: Number },
      temperature_range: { min: Number, max: Number },
      humidity_range: { min: Number, max: Number },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Sensor', sensorSchema);
