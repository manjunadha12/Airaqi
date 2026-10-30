const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'openai/gpt-oss-120b:free';

// Using OpenRouter or similar proxy for OpenAI-compatible API
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const callAI = async (prompt) => {
  try {
    const response = await axios.post(API_URL, {
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // Required by some providers
        'X-Title': 'AirSense Cloud'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI API Error:', error.response?.data || error.message);
    throw error;
  }
};

const generateAQIPrediction = async (historicalData, environmental) => {
  try {
    const prompt = `
You are an air quality expert AI. Based on the following historical data: ${JSON.stringify(historicalData)} and environmental conditions: ${JSON.stringify(environmental)}, predict the AQI for the next 1, 6, 12, and 24 hours.

Format your response as JSON with the following structure:
{
  "predictions": [
    {"timeFrame": "1hour", "aqi": number, "confidence": number, "riskLevel": "low|moderate|high|very_high"},
    ...
  ],
  "trendAnalysis": "string",
  "keyFactors": ["factor1", "factor2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}`;

    const text = await callAI(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    return {
      predictions: [
        { timeFrame: '1hour', aqi: 100, confidence: 70, riskLevel: 'moderate' },
        { timeFrame: '6hours', aqi: 105, confidence: 65, riskLevel: 'moderate' },
        { timeFrame: '12hours', aqi: 110, confidence: 60, riskLevel: 'high' },
        { timeFrame: '24hours', aqi: 115, confidence: 55, riskLevel: 'high' },
      ],
      trendAnalysis: 'Stable trends predicted.',
      recommendations: ['Stay informed', 'Avoid heavy traffic'],
    };
  }
};

const generateAQISummary = async (aqiData, pollutants) => {
  try {
    const prompt = `Provide a professional summary of current air quality. AQI: ${aqiData.value}, Pollutants: ${JSON.stringify(pollutants)}. Keep it concise.`;
    return await callAI(prompt);
  } catch (error) {
    return `Current AQI is ${aqiData.value}. Conditions are ${aqiData.category}.`;
  }
};

const generateAlertQuestion = async (city, aqi, level, pollutants) => {
  try {
    const pm25 = pollutants?.pm25 || 'unknown';
    const prompt = `As an environmental expert, explain clearly:
1. What is AQI (Air Quality Index) in 1 sentence?
2. What is PM2.5 and why is it ${pm25 > 50 ? 'High' : 'Low'}?
3. Current situation in ${city}: AQI is ${aqi} (${level}). Is this High or Low for health?
Keep the total response under 60 words and very easy to understand.`;

    return await callAI(prompt);
  } catch (error) {
    return `AQI measures air health. PM2.5 are tiny particles. In ${city}, AQI is ${aqi} (${level}), which is ${aqi > 100 ? 'High' : 'Low'}.`;
  }
};

module.exports = {
  generateAQIPrediction,
  generateAQISummary,
  generateAlertQuestion,
};
