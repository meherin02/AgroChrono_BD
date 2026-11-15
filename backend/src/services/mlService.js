const axios = require("axios");
function base() {
  if (process.env.ML_SERVICE_URL) return process.env.ML_SERVICE_URL;
  if (process.env.NODE_ENV === "production") return null;
  return "http://127.0.0.1:8001";
}
function headers() {
  return { "X-Service-Token": process.env.ML_SERVICE_TOKEN || "" };
}
async function predictAnomaly(features) {
  if (!base() || !Object.values(features).every(Number.isFinite))
    return {
      available: false,
      is_anomaly: null,
      anomaly_score: null,
      reason: "ML_FEATURES_UNAVAILABLE",
    };
  try {
    const r = await axios.post(base() + "/predict/anomaly", features, {
      timeout: 15000,
      headers: headers(),
    });
    if (
      typeof r.data.is_anomaly !== "boolean" ||
      !Number.isFinite(r.data.anomaly_score)
    )
      throw Error();
    return { available: true, ...r.data };
  } catch {
    return {
      available: false,
      is_anomaly: null,
      anomaly_score: null,
      reason: "ML_UNAVAILABLE",
    };
  }
}
async function checkMLHealth() {
  if (!base()) return { status: "unavailable", model_loaded: false };
  try {
    const r = await axios.get(base() + "/health", {
      timeout: 3000,
      headers: headers(),
    });
    return {
      status: r.data.model_loaded ? "ready" : "unavailable",
      model_loaded: r.data.model_loaded === true,
      model_version: r.data.model_version,
    };
  } catch {
    return { status: "unavailable", model_loaded: false };
  }
}
module.exports = { predictAnomaly, checkMLHealth };
