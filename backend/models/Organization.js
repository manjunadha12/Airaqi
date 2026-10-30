const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    website: String,
    industry: String,
    country: String,
    city: String,
    timezone: {
      type: String,
      default: 'UTC',
    },
    logo: String,
    maxUsers: {
      type: Number,
      default: 100,
    },
    maxSensors: {
      type: Number,
      default: 1000,
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free',
    },
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    apiQuota: {
      daily: {
        type: Number,
        default: 10000,
      },
      remaining: Number,
      resetDate: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    settings: {
      alertThreshold: {
        aqi: { type: Number, default: 150 },
        temperature: { type: Number, default: 40 },
        humidity: { type: Number, default: 80 },
      },
      dataRetention: {
        type: Number,
        default: 365, // days
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Organization', organizationSchema);
