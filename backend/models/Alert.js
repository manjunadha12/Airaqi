const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: false,
      default: null,
      index: true,
    },
    sensor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sensor',
      required: false,
      default: null,
    },
    type: {
      type: String,
      enum: [
        'aqi_info',
        'aqi_warning',
        'aqi_critical',
        'smoke_detected',
        'gas_leakage',
        'temperature_threshold',
        'sensor_failure',
        'high_humidity',
        'low_visibility',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'emergency'],
      default: 'warning',
    },
    title: String,
    description: String,
    value: Number,
    threshold: Number,
    unit: String,
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved'],
      default: 'active',
    },
    triggeredAt: {
      type: Date,
      default: Date.now,
    },
    acknowledgedAt: Date,
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolutionNotes: String,
    notificationChannels: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    escalationLevel: {
      type: Number,
      default: 0,
      max: 3,
    },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    attachments: [String],
    location: {
      city: { type: String, index: true }
    }
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ organization: 1, createdAt: -1 });
alertSchema.index({ sensor: 1, status: 1 });
alertSchema.index({ status: 1, severity: 1 });

module.exports = mongoose.model('Alert', alertSchema);
