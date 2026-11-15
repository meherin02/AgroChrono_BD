const { randomUUID } = require("crypto"),
  { validate } = require("./validation"),
  { fail } = require("./auth");
const references = require("../data/referenceCalendars.json");
const { getCultivationWeather } = require("./weatherService"),
  { predictAnomaly } = require("./mlService");
const {
  analyzeConflicts,
  getDayOfYear,
  getDaysBetween,
} = require("./conflictEngine");
const { calculateReliabilityScore } = require("./reliabilityCalculator");
const findReference = (c, s, d) =>
  references.find((r) => r.crop === c && r.season === s && r.district === d);
async function analyze(input) {
  const validation = validate(input);
  if (!validation.valid)
    throw Object.assign(fail(400, "VALIDATION_FAILED"), {
      details: validation.errors,
    });
  const submission = validation.value;
  const reference = findReference(
    submission.crop,
    submission.season,
    submission.district,
  );
  if (!reference) throw fail(422, "REFERENCE_UNAVAILABLE");
  const weather = await getCultivationWeather(
    submission.district,
    submission.season,
    submission.plantingStart,
    submission.harvestEnd,
    reference,
  );
  const mlFeatures = {
    planting_doy: getDayOfYear(submission.plantingStart),
    growth_days: getDaysBetween(submission.growthStart, submission.growthEnd),
    harvest_doy: getDayOfYear(submission.harvestStart),
    mean_temperature: weather.available ? weather.meanTemperature : null,
    total_rainfall: weather.available ? weather.totalRainfall : null,
  };
  const mlResult = await predictAnomaly(mlFeatures),
    conflict = analyzeConflicts(
      submission,
      reference,
      weather.available ? weather : null,
    ),
    reliability = calculateReliabilityScore(
      conflict.rawScores,
      weather.available,
      mlResult,
    );
  if (!weather.available)
    conflict.conflicts.push({
      field: "Weather Compatibility",
      status: "Unavailable",
      severity: "unknown",
      deviationDays: 0,
    });
  return {
    id: randomUUID(),
    submissionId: randomUUID(),
    submission,
    reference: structuredClone(reference),
    referenceSnapshotAt: new Date().toISOString(),
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
    conflicts: conflict.conflicts,
    explanations: conflict.explanations,
    suggestedCalendar: {
      ...conflict.suggestedCalendar,
      plotId: submission.plotId || "",
    },
    weatherAssessment: weather,
    createdAt: new Date().toISOString(),
    activities: ["planting", "growth", "harvest"].map((stage) => ({
      id: stage,
      stage,
      start: submission[stage + "Start"],
      end: submission[stage + "End"],
      complete: false,
    })),
  };
}
module.exports = { analyze, findReference, references };
