const express = require('express');
const router = express.Router();
const referenceCalendars = require('../data/referenceCalendars.json');
const districts = require('../data/bangladeshDistricts');
const { getCultivationWeather } = require('../services/weatherService');
const { predictAnomaly, checkMLHealth } = require('../services/mlService');
const { analyzeConflicts, getDayOfYear, getDaysBetween } = require('../services/conflictEngine');
const { calculateReliabilityScore } = require('../services/reliabilityCalculator');
const db = require('../config/db');

// Supported crop & season options
const SUPPORTED_CROPS = [
  { id: 'Rice', name: 'Rice (ধান)', seasons: ['Aman', 'Boro', 'Aus'] },
  { id: 'Wheat', name: 'Wheat (গম)', seasons: ['Rabi'] },
  { id: 'Potato', name: 'Potato (আলু)', seasons: ['Rabi'] },
  { id: 'Mustard', name: 'Mustard (সরিষা)', seasons: ['Rabi'] }
];

/**
 * 1. Health check endpoint
 */
router.get('/health', async (req, res) => {
  const mlHealth = await checkMLHealth();
  const dbStatus = db.getDatabaseStatus();
  res.json({
    status: 'ok',
    service: 'AgroChrono-BD Express API',
    uptime: process.uptime(),
    database: dbStatus,
    mlMicroservice: mlHealth,
    timestamp: new Date().toISOString()
  });
});

/**
 * 2. Form Options endpoint
 */
router.get('/options', (req, res) => {
  res.json({
    crops: SUPPORTED_CROPS,
    districts: districts.map(d => ({ id: d.id, name: d.name, division: d.division, aez: d.aez })),
    referenceSummary: referenceCalendars.map(r => ({
      id: r.id,
      crop: r.crop,
      season: r.season,
      district: r.district,
      varieties: r.varieties,
      plantingWindow: r.plantingWindow.label,
      growthDuration: `${r.growthDurationDays.min}-${r.growthDurationDays.max} days`,
      harvestWindow: r.harvestWindow.label
    }))
  });
});

/**
 * 3. Validation helper & endpoint
 */
function validateFarmerInput(data) {
  const errors = [];

  const requiredFields = [
    'crop', 'district', 'season',
    'plantingStart', 'plantingEnd',
    'growthStart', 'growthEnd',
    'harvestStart', 'harvestEnd'
  ];

  for (const field of requiredFields) {
    if (!data[field] || String(data[field]).trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Crop support check
  const cropObj = SUPPORTED_CROPS.find(c => c.id.toLowerCase() === data.crop.toLowerCase());
  if (!cropObj) {
    errors.push(`Crop "${data.crop}" is currently unsupported. Supported crops: ${SUPPORTED_CROPS.map(c => c.id).join(', ')}`);
  } else if (!cropObj.seasons.map(s => s.toLowerCase()).includes(data.season.toLowerCase())) {
    errors.push(`Season "${data.season}" is invalid for ${data.crop}. Supported seasons: ${cropObj.seasons.join(', ')}`);
  }

  // Parse dates
  const pStart = new Date(data.plantingStart);
  const pEnd = new Date(data.plantingEnd);
  const gStart = new Date(data.growthStart);
  const gEnd = new Date(data.growthEnd);
  const hStart = new Date(data.harvestStart);
  const hEnd = new Date(data.harvestEnd);

  const dates = [
    { label: 'Planting Start', val: pStart },
    { label: 'Planting End', val: pEnd },
    { label: 'Growth Start', val: gStart },
    { label: 'Growth End', val: gEnd },
    { label: 'Harvest Start', val: hStart },
    { label: 'Harvest End', val: hEnd }
  ];

  for (const d of dates) {
    if (isNaN(d.val.getTime())) {
      errors.push(`Invalid date format for ${d.label}`);
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  // Chronological Sequence Checks
  if (pStart > pEnd) {
    errors.push('Planting start date cannot be later than planting end date.');
  }

  if (gStart > gEnd) {
    errors.push('Growth period start date cannot be later than growth end date.');
  }

  if (hStart > hEnd) {
    errors.push('Harvest start date cannot be later than harvest end date.');
  }

  if (pStart > hStart) {
    errors.push('Invalid timeline sequence: Planting cannot begin after harvest starts.');
  }

  if (gStart < pStart) {
    errors.push('Invalid sequence: Vegetative growth phase cannot begin before planting starts.');
  }

  if (hStart < pEnd) {
    errors.push('Harvest cannot begin before planting period concludes.');
  }

  const totalDays = Math.round((hEnd - pStart) / (1000 * 60 * 60 * 24));
  if (totalDays < 45) {
    errors.push(`Total cultivation duration (${totalDays} days) is unrealistically brief for field crops.`);
  } else if (totalDays > 320) {
    errors.push(`Total cultivation duration (${totalDays} days) exceeds annual agricultural cycle.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    totalDurationDays: totalDays
  };
}

router.post('/validate', (req, res) => {
  const result = validateFarmerInput(req.body);
  if (!result.valid) {
    return res.status(400).json({ success: false, errors: result.errors });
  }
  res.json({ success: true, message: 'Calendar input dates and logical sequence are valid.', totalDurationDays: result.totalDurationDays });
});

/**
 * 4. Weather info endpoint
 */
router.get('/weather', async (req, res) => {
  const { district, season, startDate, endDate, crop } = req.query;
  const ref = findReference(crop || 'Rice', season || 'Aman', district || 'Rangpur');
  const weather = await getCultivationWeather(district, season, startDate, endDate, ref);
  res.json(weather);
});

/**
 * 5. Reference crop calendar lookup
 */
function findReference(crop, season, district) {
  // Direct match
  let match = referenceCalendars.find(
    r => r.crop.toLowerCase() === (crop || '').toLowerCase() &&
         r.season.toLowerCase() === (season || '').toLowerCase() &&
         r.district.toLowerCase() === (district || '').toLowerCase()
  );

  // Fallback to same crop & season if district is adjacent
  if (!match) {
    match = referenceCalendars.find(
      r => r.crop.toLowerCase() === (crop || '').toLowerCase() &&
           r.season.toLowerCase() === (season || '').toLowerCase()
    );
  }

  return match;
}

router.get('/reference', (req, res) => {
  const { crop, season, district } = req.query;
  const match = findReference(crop, season, district);
  if (!match) {
    return res.status(404).json({
      error: `No verified reference calendar found for ${crop} in ${season} season (${district || 'All Districts'}).`,
      availableOptions: referenceCalendars.map(r => `${r.crop} - ${r.season} (${r.district})`)
    });
  }
  res.json(match);
});

/**
 * 6. Complete Analysis Controller (The core orchestrator)
 */
async function runCompleteAnalysis(submission) {
  // Step A: Input validation
  const validation = validateFarmerInput(submission);
  if (!validation.valid) {
    const err = new Error(validation.errors.join('; '));
    err.status = 400;
    err.details = validation.errors;
    throw err;
  }

  // Step B: Reference Lookup
  const reference = findReference(submission.crop, submission.season, submission.district);
  if (!reference) {
    const err = new Error(`Unsupported combination: No agricultural reference record exists for ${submission.crop} (${submission.season}) in ${submission.district}.`);
    err.status = 404;
    throw err;
  }

  // Step C: Weather Integration
  const weather = await getCultivationWeather(
    submission.district,
    submission.season,
    submission.plantingStart,
    submission.harvestEnd,
    reference
  );

  // Step D: Feature Engineering for Python ML
  const plantingDOY = getDayOfYear(submission.plantingStart);
  const harvestDOY = getDayOfYear(submission.harvestStart);
  const growthDays = submission.growthStart && submission.growthEnd
    ? getDaysBetween(submission.growthStart, submission.growthEnd)
    : getDaysBetween(submission.plantingEnd, submission.harvestStart);

  const mlFeatures = {
    planting_doy: plantingDOY,
    growth_days: growthDays,
    harvest_doy: harvestDOY,
    mean_temperature: weather.meanTemperature,
    total_rainfall: weather.totalRainfall
  };

  // Step E: Python ML Microservice Anomaly Screening
  const mlResult = await predictAnomaly(mlFeatures);

  // Step F: Field-Specific Conflict Detection Engine
  const conflictAnalysis = analyzeConflicts(submission, reference, weather);

  // Step G: Reliability Calculator
  const reliability = calculateReliabilityScore(
    conflictAnalysis.rawScores,
    weather.available,
    mlResult
  );

  // Step H: Save submission and results in Database
  const savedSubmission = await db.saveSubmission(submission);
  
  const finalResult = {
    submissionId: savedSubmission.id,
    submission,
    reference: {
      id: reference.id,
      crop: reference.crop,
      season: reference.season,
      district: reference.district,
      varieties: reference.varieties,
      plantingWindow: reference.plantingWindow.label,
      growthDurationDays: reference.growthDurationDays,
      harvestWindow: reference.harvestWindow.label,
      sourceName: reference.sourceName,
      sourceUrl: reference.sourceUrl,
      lastUpdated: reference.lastUpdated
    },
    reliabilityScore: reliability.score,
    reliabilityCategory: reliability.category,
    badgeClass: reliability.badgeClass,
    assessmentCompleteness: reliability.assessmentCompleteness,
    parameterScores: reliability.parameterScores,
    weightsUsed: reliability.weightsUsed,
    weatherNote: reliability.weatherNote,
    anomalyDetected: mlResult.is_anomaly,
    mlResult,
    mlFeatures,
    conflicts: conflictAnalysis.conflicts,
    explanations: conflictAnalysis.explanations,
    suggestedCalendar: conflictAnalysis.suggestedCalendar,
    weatherAssessment: {
      meanTemperature: weather.meanTemperature,
      minTemperature: weather.minTemperature,
      maxTemperature: weather.maxTemperature,
      totalRainfall: weather.totalRainfall,
      status: weather.weatherStatus,
      score: weather.weatherCompatibilityScore,
      dataSource: weather.dataSource,
      summary: weather.suitabilitySummary,
      note: weather.note
    }
  };

  const savedRecord = await db.saveResult(finalResult);
  return savedRecord;
}

router.post('/analyze', async (req, res) => {
  try {
    const result = await runCompleteAnalysis(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Analysis error:', err.message);
    res.status(err.status || 500).json({
      success: false,
      error: err.message,
      details: err.details || null
    });
  }
});

/**
 * 7. Re-analyze with suggested corrections
 */
router.post('/reanalyze', async (req, res) => {
  try {
    const { correctedCalendar, originalResultId } = req.body;
    if (!correctedCalendar) {
      return res.status(400).json({ error: 'Corrected calendar payload required.' });
    }

    const updatedResult = await runCompleteAnalysis(correctedCalendar);
    
    // Attach reference to original result if available
    let comparison = null;
    if (originalResultId) {
      const original = await db.getResultById(originalResultId);
      if (original) {
        comparison = {
          originalScore: original.reliabilityScore,
          newScore: updatedResult.reliabilityScore,
          scoreImprovement: updatedResult.reliabilityScore - original.reliabilityScore,
          resolvedConflicts: (original.conflicts || []).filter(c => c.status !== 'Compatible').length - 
                             (updatedResult.conflicts || []).filter(c => c.status !== 'Compatible').length
        };
      }
    }

    res.json({
      success: true,
      data: updatedResult,
      comparison
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
});

/**
 * 8. Retrieve saved result by ID
 */
router.get('/results/:id', async (req, res) => {
  const result = await db.getResultById(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Analysis result not found.' });
  }
  res.json({ success: true, data: result });
});

/**
 * 9. Analysis History endpoint
 */
router.get('/history', async (req, res) => {
  const history = await db.getRecentHistory(15);
  res.json({ success: true, data: history });
});

module.exports = router;
