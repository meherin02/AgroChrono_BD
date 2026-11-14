const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001';

/**
 * Sends numerical features to Python FastAPI Isolation Forest microservice
 */
async function predictAnomaly(features) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/anomaly`, {
      planting_doy: parseInt(features.planting_doy, 10),
      growth_days: parseInt(features.growth_days, 10),
      harvest_doy: parseInt(features.harvest_doy, 10),
      mean_temperature: parseFloat(features.mean_temperature),
      total_rainfall: parseFloat(features.total_rainfall)
    }, { timeout: 3500 });

    return {
      available: true,
      ...response.data
    };
  } catch (err) {
    console.warn(`ML Microservice call failed (${err.message}). Proceeding with rule-based fallback.`);
    return {
      available: false,
      is_anomaly: false,
      anomaly_score: 0.0,
      prediction_label: 'ML Service Offline (Evaluation based on agricultural rules)',
      error: err.message,
      note: 'Python FastAPI service at port 8001 was unreachable. Field conflict analysis remains fully operational.'
    };
  }
}

/**
 * Checks health of Python ML microservice
 */
async function checkMLHealth() {
  try {
    const res = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 1500 });
    return res.data;
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

module.exports = {
  predictAnomaly,
  checkMLHealth,
  ML_SERVICE_URL
};
