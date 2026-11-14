/**
 * Conflict Engine for AgroChrono-BD
 * Performs field-specific agricultural consistency checks against regional reference records
 */

// Helper to convert date string (YYYY-MM-DD) to Day of Year (1 - 366)
function getDayOfYear(dateStr) {
  const date = new Date(dateStr);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) + 1;
}

// Helper to format date string to human-friendly "DD Mon YYYY"
function formatHumanDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Calculate days between two dates
function getDaysBetween(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

/**
 * Main Conflict Identification Function
 */
function analyzeConflicts(submission, reference, weatherAssessment) {
  const conflicts = [];
  const explanations = [];
  const suggestions = {};

  const plantingStartDOY = getDayOfYear(submission.plantingStart);
  const plantingEndDOY = getDayOfYear(submission.plantingEnd);
  
  // Growth duration calculation
  const growthDurationDays = submission.growthStart && submission.growthEnd 
    ? getDaysBetween(submission.growthStart, submission.growthEnd)
    : getDaysBetween(submission.plantingEnd, submission.harvestStart);

  const harvestStartDOY = getDayOfYear(submission.harvestStart);
  const harvestEndDOY = getDayOfYear(submission.harvestEnd);

  // 1. PLANTING PERIOD EVALUATION
  let plantingScore = 100;
  const refPStart = reference.plantingWindow.startDOY;
  const refPEnd = reference.plantingWindow.endDOY;

  // Handle year-wrap around if any (e.g. Boro planting Dec-Jan: 349 -> 25)
  let isPlantingInside = false;
  let plantingDeviation = 0;

  if (refPStart <= refPEnd) {
    if (plantingStartDOY >= refPStart && plantingStartDOY <= refPEnd) {
      isPlantingInside = true;
    } else if (plantingStartDOY < refPStart) {
      plantingDeviation = refPStart - plantingStartDOY;
    } else {
      plantingDeviation = plantingStartDOY - refPEnd;
    }
  } else {
    // Crosses year boundary (e.g. Dec to Jan)
    if (plantingStartDOY >= refPStart || plantingStartDOY <= refPEnd) {
      isPlantingInside = true;
    } else {
      plantingDeviation = Math.min(Math.abs(plantingStartDOY - refPStart), Math.abs(plantingStartDOY - refPEnd));
    }
  }

  if (isPlantingInside) {
    conflicts.push({
      field: 'Planting Window',
      submitted: `${formatHumanDate(submission.plantingStart)} – ${formatHumanDate(submission.plantingEnd)}`,
      reference: reference.plantingWindow.label,
      status: 'Compatible',
      deviationDays: 0,
      severity: 'none',
      details: 'Planting schedule falls squarely inside recommended agro-climatic window.'
    });
  } else {
    const isLate = plantingStartDOY > refPEnd && refPStart <= refPEnd;
    plantingScore = Math.max(20, 100 - plantingDeviation * 2.5);
    const severity = plantingDeviation > 25 ? 'High Conflict' : 'Moderate Conflict';
    
    const exp = isLate
      ? `Planting is delayed by approximately ${plantingDeviation} days past the regional ${reference.plantingWindow.label} window. Late planting risks terminal drought or low winter temperatures during flowering.`
      : `Planting is ${plantingDeviation} days earlier than the regional recommendation (${reference.plantingWindow.label}). Early seedlings may encounter erratic rains or suboptimal seedling vigor.`;

    conflicts.push({
      field: 'Planting Window',
      submitted: `${formatHumanDate(submission.plantingStart)} – ${formatHumanDate(submission.plantingEnd)}`,
      reference: reference.plantingWindow.label,
      status: severity,
      deviationDays: plantingDeviation,
      severity: plantingDeviation > 25 ? 'danger' : 'warning',
      details: exp
    });
    explanations.push(exp);
  }

  // 2. GROWTH DURATION EVALUATION
  let growthScore = 100;
  const { min: gMin, max: gMax, typical: gTypical } = reference.growthDurationDays;
  let growthDeviation = 0;

  if (growthDurationDays >= gMin && growthDurationDays <= gMax) {
    conflicts.push({
      field: 'Growth Duration',
      submitted: `${growthDurationDays} days`,
      reference: `${gMin} – ${gMax} days (Typical: ${gTypical}d)`,
      status: 'Compatible',
      deviationDays: 0,
      severity: 'none',
      details: `Growth duration (${growthDurationDays}d) aligns well with ${reference.crop} variety maturity norms.`
    });
  } else {
    const isOver = growthDurationDays > gMax;
    growthDeviation = isOver ? (growthDurationDays - gMax) : (gMin - growthDurationDays);
    growthScore = Math.max(15, 100 - growthDeviation * 3);
    const severity = growthDeviation > 20 ? 'High Conflict' : 'Moderate Conflict';

    const exp = isOver
      ? `Your proposed growth duration of ${growthDurationDays} days is ${growthDeviation} days longer than the documented ${gMin}–${gMax} days limit. This prolonged field occupancy may invite pest accumulation, lodging, or crop cycle delays.`
      : `Your proposed growth duration of ${growthDurationDays} days is ${growthDeviation} days shorter than the standard ${gMin}–${gMax} days for this crop. Early maturity estimates risk harvesting before complete grain physiological maturity.`;

    conflicts.push({
      field: 'Growth Duration',
      submitted: `${growthDurationDays} days`,
      reference: `${gMin} – ${gMax} days (Typical: ${gTypical}d)`,
      status: severity,
      deviationDays: growthDeviation,
      severity: growthDeviation > 20 ? 'danger' : 'warning',
      details: exp
    });
    explanations.push(exp);
  }

  // 3. HARVEST PERIOD EVALUATION
  let harvestScore = 100;
  const refHStart = reference.harvestWindow.startDOY;
  const refHEnd = reference.harvestWindow.endDOY;
  let isHarvestInside = false;
  let harvestDeviation = 0;

  if (refHStart <= refHEnd) {
    if (harvestStartDOY >= refHStart && harvestStartDOY <= refHEnd) {
      isHarvestInside = true;
    } else if (harvestStartDOY < refHStart) {
      harvestDeviation = refHStart - harvestStartDOY;
    } else {
      harvestDeviation = harvestStartDOY - refHEnd;
    }
  } else {
    if (harvestStartDOY >= refHStart || harvestStartDOY <= refHEnd) {
      isHarvestInside = true;
    } else {
      harvestDeviation = Math.min(Math.abs(harvestStartDOY - refHStart), Math.abs(harvestStartDOY - refHEnd));
    }
  }

  if (isHarvestInside) {
    conflicts.push({
      field: 'Harvest Window',
      submitted: `${formatHumanDate(submission.harvestStart)} – ${formatHumanDate(submission.harvestEnd)}`,
      reference: reference.harvestWindow.label,
      status: 'Compatible',
      deviationDays: 0,
      severity: 'none',
      details: 'Harvest window coincides with favorable regional ripening and drying conditions.'
    });
  } else {
    const isLate = harvestStartDOY > refHEnd && refHStart <= refHEnd;
    harvestScore = Math.max(15, 100 - harvestDeviation * 2.5);
    const severity = harvestDeviation > 25 ? 'High Conflict' : 'Moderate Conflict';

    const exp = isLate
      ? `Harvest expected starting ${formatHumanDate(submission.harvestStart)} is delayed by ~${harvestDeviation} days past the regional ${reference.harvestWindow.label} cutoff. High risk of grain shattering, unseasonal weather events, or delaying subsequent rabi sowing.`
      : `Harvest date is ~${harvestDeviation} days ahead of the regional reference window (${reference.harvestWindow.label}). Harvesting prematurely risks high moisture content and reduced milling recovery.`;

    conflicts.push({
      field: 'Harvest Window',
      submitted: `${formatHumanDate(submission.harvestStart)} – ${formatHumanDate(submission.harvestEnd)}`,
      reference: reference.harvestWindow.label,
      status: severity,
      deviationDays: harvestDeviation,
      severity: harvestDeviation > 25 ? 'danger' : 'warning',
      details: exp
    });
    explanations.push(exp);
  }

  // 4. WEATHER COMPATIBILITY EVALUATION
  let weatherScore = 100;
  if (weatherAssessment) {
    weatherScore = weatherAssessment.weatherCompatibilityScore || 85;
    conflicts.push({
      field: 'Weather Compatibility',
      submitted: `Mean Temp: ${weatherAssessment.meanTemperature}°C, Rain: ${weatherAssessment.totalRainfall}mm`,
      reference: `Optimal: ${reference.temperatureRange.optimalMin}–${reference.temperatureRange.optimalMax}°C`,
      status: weatherAssessment.weatherStatus || 'Compatible',
      deviationDays: 0,
      severity: weatherScore >= 80 ? 'none' : weatherScore >= 60 ? 'warning' : 'danger',
      details: weatherAssessment.suitabilitySummary
    });
    if (weatherAssessment.weatherIssues && weatherAssessment.weatherIssues.length > 0) {
      explanations.push(...weatherAssessment.weatherIssues);
    }
  }

  // 5. GENERATE REFERENCE-ALIGNED SUGGESTED CORRECTIONS
  const year = new Date(submission.plantingStart).getFullYear();
  // Build recommended dates based on reference start/end
  const pStartMonth = reference.plantingWindow.startMonth - 1;
  const pStartDay = reference.plantingWindow.startDay;
  const pEndMonth = reference.plantingWindow.endMonth - 1;
  const pEndDay = reference.plantingWindow.endDay;

  const suggestedPlantingStart = new Date(year, pStartMonth, pStartDay);
  const suggestedPlantingEnd = new Date(year, pEndMonth, Math.min(pEndDay, pStartDay + 10));

  // Suggested growth
  const suggestedGrowthDays = reference.growthDurationDays.typical || 125;
  const suggestedGrowthStart = new Date(suggestedPlantingEnd.getTime() + 1000 * 60 * 60 * 24);
  const suggestedGrowthEnd = new Date(suggestedGrowthStart.getTime() + (suggestedGrowthDays - 15) * 1000 * 60 * 60 * 24);

  // Suggested harvest
  const suggestedHarvestStart = new Date(suggestedGrowthEnd.getTime() + 1000 * 60 * 60 * 24 * 7);
  const suggestedHarvestEnd = new Date(suggestedHarvestStart.getTime() + 1000 * 60 * 60 * 24 * 15);

  const formatISO = d => d.toISOString().split('T')[0];

  const suggestedCalendar = {
    crop: submission.crop,
    district: submission.district,
    season: submission.season,
    variety: submission.variety || reference.varieties?.[0] || '',
    plantingStart: formatISO(suggestedPlantingStart),
    plantingEnd: formatISO(suggestedPlantingEnd),
    growthStart: formatISO(suggestedGrowthStart),
    growthEnd: formatISO(suggestedGrowthEnd),
    harvestStart: formatISO(suggestedHarvestStart),
    harvestEnd: formatISO(suggestedHarvestEnd),
    growthDurationDays: suggestedGrowthDays,
    correctionReason: explanations.length > 0
      ? `Calibrated timeline to eliminate ${explanations.length} detected discrepancies and match ${reference.sourceName} standard windows.`
      : 'Submitted calendar is already well-aligned with regional standards.'
  };

  return {
    conflicts,
    explanations: explanations.length > 0 ? explanations : ['Your submitted calendar is consistent with documented regional crop agronomy standards.'],
    suggestedCalendar,
    rawScores: {
      planting: Math.round(plantingScore),
      growth: Math.round(growthScore),
      harvest: Math.round(harvestScore),
      weather: Math.round(weatherScore)
    }
  };
}

module.exports = {
  analyzeConflicts,
  getDayOfYear,
  getDaysBetween,
  formatHumanDate
};
