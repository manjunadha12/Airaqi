const mongoose = require('mongoose');

const downloadHistorySchema = new mongoose.Schema(
  {
    downloadId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    fileName: {
      type: String,
      required: true,
    },
    reportType: {
      type: String,
      enum: [
        'daily_aqi',
        'weekly_aqi',
        'monthly_aqi',
        'annual_aqi',
        'alert_report',
        'prediction_report',
        'sensor_report',
        'custom',
      ],
      required: true,
    },
    fileFormat: {
      type: String,
      enum: ['pdf', 'csv', 'excel', 'json'],
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileUrl: String,
    downloadDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    downloadStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    errorMessage: String,
    ipAddress: String,
    userAgent: String,
    retryCount: {
      type: Number,
      default: 0,
    },
    dataRange: {
      startDate: Date,
      endDate: Date,
    },
    filters: {
      sensor: mongoose.Schema.Types.ObjectId,
      department: String,
      status: String,
    },
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding expired downloads
downloadHistorySchema.index(
  { expiryDate: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model('DownloadHistory', downloadHistorySchema);
