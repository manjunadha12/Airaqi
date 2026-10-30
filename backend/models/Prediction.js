const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    sensor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sensor',
      required: false,
      default: null,
      index: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: false,
      default: null,
      index: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    predictions: [
      {
        timeFrame: {
          type: String,
          enum: ['1hour', '6hours', '12hours', '24hours'],
        },
        predictedAQI: Number,
        confidenceScore: {
          type: Number,
          min: 0,
          max: 100,
        },
        pollutants: {
          pm2_5: Number,
          pm10: Number,
          no2: Number,
          so2: Number,
          co: Number,
          o3: Number,
        },
        riskLevel: {
          type: String,
          enum: ['low', 'moderate', 'high', 'very_high'],
        },
        timestamp: Date,
      },
    ],
    inputData: {
      historicalAQI: [Number],
      temperature: Number,
      humidity: Number,
      gasLevels: [Number],
      weatherConditions: String,
    },
    geminiAnalysis: {
      summary: String,
      trends: String,
      recommendations: String,
      preventiveMeasures: [String],
      lastUpdated: Date,
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 85,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

predictionSchema.index({ sensor: 1, generatedAt: -1 });
predictionSchema.index({ organization: 1, generatedAt: -1 });

module.exports = mongoose.model('Prediction', predictionSchema);
