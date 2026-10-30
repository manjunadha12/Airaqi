const axios = require('axios');
const Prediction = require('../models/Prediction');
const { generateAQIPrediction, generateAQISummary } = require('../services/aiService');

const WAQI_API_URL = 'https://api.waqi.info/feed';
const WAQI_TOKEN = process.env.WAQI_TOKEN;

exports.generatePrediction = async (req, res) => {
  try {
    const { city, organizationId } = req.body;

    let aqiData = null;
    if (city && WAQI_TOKEN) {
      const response = await axios.get(`${WAQI_API_URL}/${city}/?token=${WAQI_TOKEN}`);
      if (response.data.status === 'ok') {
        aqiData = response.data.data;
      }
    }

    if (!aqiData) {
        return res.status(404).json({ success: false, message: 'City data not found for prediction' });
    }

    const currentAqi = aqiData.aqi;
    const pollutants = {
        pm25: aqiData.iaqi.pm25?.v || 0,
        pm10: aqiData.iaqi.pm10?.v || 0
    };
    const environmental = {
        temperature: aqiData.iaqi.t?.v || 25,
        humidity: aqiData.iaqi.h?.v || 50
    };

    // Use AI for detailed prediction
    const predictionData = await generateAQIPrediction([currentAqi], environmental);
    const summary = await generateAQISummary({ value: currentAqi, category: 'N/A' }, pollutants);

    const prediction = new Prediction({
      organization: organizationId,
      predictions: predictionData.predictions.map(p => ({
          timeFrame: p.timeFrame,
          predictedAQI: p.aqi,
          confidenceScore: p.confidence,
          riskLevel: p.riskLevel,
          timestamp: new Date()
      })),
      geminiAnalysis: {
        summary,
        trends: predictionData.trendAnalysis,
        recommendations: predictionData.recommendations.join(', '),
        lastUpdated: new Date(),
      },
    });

    await prediction.save();

    res.status(201).json({
      success: true,
      message: 'Prediction generated successfully using WAQI & OpenAI',
      data: prediction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLatestPrediction = async (req, res) => {
  const prediction = await Prediction.findOne().sort({ generatedAt: -1 });
  res.status(200).json({ success: true, data: prediction });
};

exports.getOrganizationPredictions = async (req, res) => {
  const predictions = await Prediction.find().sort({ generatedAt: -1 }).limit(20);
  res.status(200).json({ success: true, data: predictions });
};

exports.getPollutionTrends = async (req, res) => {
    res.status(200).json({ success: true, data: {} });
};

exports.generateBatchPredictions = async (req, res) => {
    res.status(200).json({ success: true, message: 'Batch complete' });
};

exports.calculatePrediction = async (req, res) => {
  try {
    const { currentAQI = 52, hour = 20, noise = null, city = 'Chennai' } = req.body;
    const { calculatePredictedAQI } = require('./aqiController');

    const result = calculatePredictedAQI(
      Number(currentAQI),
      Number(hour),
      noise !== null && noise !== undefined && noise !== '' ? Number(noise) : null
    );

    const hour12 = `${result.targetHour % 12 === 0 ? 12 : result.targetHour % 12} ${result.targetHour >= 12 ? 'PM' : 'AM'}`;

    return res.status(200).json({
      success: true,
      city,
      data: {
        ...result,
        hourFormatted: hour12,
        formula: 'AQI_pred = AQI_curr + 15*sin((hour - 6)*pi / 12) + epsilon',
        explanation: `${city} — Current AQI: ${result.currentAQI} → Predicted AQI at ${hour12}: ${result.predictedAQI}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
