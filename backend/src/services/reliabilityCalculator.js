/**
 * Reliability Score Generator for AgroChrono-BD
 * 
 * Weighted scoring formula:
 * R = (0.30 * P) + (0.20 * G) + (0.25 * H) + (0.25 * W)
 * 
 * Where:
 * P = Planting compatibility score (0-100)
 * G = Growth duration compatibility score (0-100)
 * H = Harvest compatibility score (0-100)
 * W = Weather compatibility score (0-100)
 */

function calculateReliabilityScore(rawScores, weatherAvailable = true, mlResult = null) {
  const { planting, growth, harvest, weather } = rawScores;

  let finalScore = 0;
  let weightsUsed = {};
  let assessmentCompleteness = 100;
  let weatherNote = null;

  if (weatherAvailable && weather !== undefined && weather !== null) {
    weightsUsed = {
      planting: 0.30,
      growth: 0.20,
      harvest: 0.25,
      weather: 0.25
    };
    finalScore = (0.30 * planting) + (0.20 * growth) + (0.25 * harvest) + (0.25 * weather);
    assessmentCompleteness = 100;
  } else {
    // Exclude weather and renormalize available weights across 0.75
    // 0.30 / 0.75 = 0.40, 0.20 / 0.75 = 0.267, 0.25 / 0.75 = 0.333
    const wPlanting = 0.30 / 0.75;
    const wGrowth = 0.20 / 0.75;
    const wHarvest = 0.25 / 0.75;

    weightsUsed = {
      planting: Math.round(wPlanting * 100) / 100,
      growth: Math.round(wGrowth * 100) / 100,
      harvest: Math.round(wHarvest * 100) / 100,
      weather: 0.00
    };

    finalScore = (wPlanting * planting) + (wGrowth * growth) + (wHarvest * harvest);
    assessmentCompleteness = 75;
    weatherNote = "Weather assessment was unavailable; scoring recalculated with renormalized agronomic weights.";
  }

  // Factor in ML Anomaly detection if available
  let anomalyAdjustment = 0;
  if (mlResult && mlResult.available && mlResult.is_anomaly) {
    // If ML detects a systemic multidimensional anomaly, apply proportional moderation
    anomalyAdjustment = Math.min(12, Math.round((mlResult.anomaly_score || 0.1) * 35));
    finalScore = Math.max(10, finalScore - anomalyAdjustment);
  }

  const score = Math.min(100, Math.max(0, Math.round(finalScore)));

  // Reliability category
  let category = 'Very Low';
  let badgeClass = 'text-red-600 bg-red-50 border-red-200';
  if (score >= 85) {
    category = 'High Reliability';
    badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (score >= 70) {
    category = 'Moderate Reliability';
    badgeClass = 'text-lime-700 bg-lime-50 border-lime-200';
  } else if (score >= 50) {
    category = 'Marginal Reliability';
    badgeClass = 'text-amber-700 bg-amber-50 border-amber-200';
  } else {
    category = 'Unreliable Timeline';
    badgeClass = 'text-rose-700 bg-rose-50 border-rose-200';
  }

  return {
    score,
    category,
    badgeClass,
    assessmentCompleteness,
    weightsUsed,
    weatherNote,
    anomalyAdjustment,
    parameterScores: {
      planting: { score: planting, weight: weightsUsed.planting, contribution: Math.round(planting * weightsUsed.planting) },
      growth: { score: growth, weight: weightsUsed.growth, contribution: Math.round(growth * weightsUsed.growth) },
      harvest: { score: harvest, weight: weightsUsed.harvest, contribution: Math.round(harvest * weightsUsed.harvest) },
      weather: { score: weather || 0, weight: weightsUsed.weather, contribution: Math.round((weather || 0) * weightsUsed.weather) }
    }
  };
}

module.exports = {
  calculateReliabilityScore
};
