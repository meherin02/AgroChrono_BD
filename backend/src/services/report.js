const { tools, conflictValues } = require("../../../shared/format.cjs");
function reportRows(r, lang, profile) {
  const { t, n, date, window } = tools(lang),
    rows = [
      [t("report")],
      [t("id"), r.id],
      [t("revisionId"), r.parentId || "—"],
      [t("createdAt"), date(r.createdAt)],
      [t("crop"), t(r.submission.crop)],
      [t("district"), t(r.submission.district)],
      [t("season"), t(r.submission.season)],
      [t("variety"), r.submission.variety],
      [t("score"), n(r.reliabilityScore)],
      [t("completeness"), n(r.assessmentCompleteness) + "%"],
      [t("status"), t(r.reliabilityCategory)],
      [t("scoreNote")],
    ];
  if (profile) {
    rows.push([t("profile"), profile.farmer]);
    if (profile.plot)
      rows.push([
        t("plotName"),
        profile.plot.name,
        t(profile.plot.district),
        n(profile.plot.area),
        t(profile.plot.unit),
      ]);
  }
  for (const field of [
    "plantingStart",
    "plantingEnd",
    "growthStart",
    "growthEnd",
    "harvestStart",
    "harvestEnd",
  ])
    rows.push([t(field), date(r.submission[field])]);
  rows.push([
    t("stage"),
    t("submitted"),
    t("reference"),
    t("status"),
    t("deviation"),
    t("explanation"),
  ]);
  for (const c of r.conflicts)
    rows.push([
      t(c.field),
      ...conflictValues(r, c, lang),
      t(c.status),
      n(c.deviationDays),
      t(
        c.status === "Unavailable"
          ? "incompleteWeather"
          : c.status === "Compatible"
            ? "compatibleExplanation"
            : "conflictExplanation",
      ),
    ]);
  rows.push(
    [t("coverageNote")],
    [t("source"), r.reference.sourceName, r.reference.sourceUrl],
    [t("sourceDate"), r.reference.lastUpdated || "—"],
    [t("sourceDisclaimer")],
    [t("modelVersion"), r.mlResult.model_version || t("unavailable")],
    [
      t("ml"),
      t(
        r.mlResult.available
          ? r.mlResult.is_anomaly
            ? "mlAnomaly"
            : "mlNormal"
          : "mlUnknown",
      ),
    ],
    [t("anomalyScore"), n(r.mlResult.anomaly_score)],
    [t("weather"), t(r.weatherAssessment.product || "unavailable")],
    [t("source"), r.weatherAssessment.sourceUrl || "—"],
    [t("retrievedAt"), date(r.weatherAssessment.retrievedAt)],
    [
      t("coverage"),
      date(r.weatherAssessment.coverageStart),
      date(r.weatherAssessment.coverageEnd),
    ],
    [t("mean"), n(r.weatherAssessment.meanTemperature), t("celsius")],
    [t("rainfall"), n(r.weatherAssessment.totalRainfall), t("mm")],
    [t("guidanceNote")],
  );
  for (const k of [
    "plantingStart",
    "plantingEnd",
    "growthStart",
    "growthEnd",
    "harvestStart",
    "harvestEnd",
  ])
    rows.push([t("preview"), t(k), date(r.suggestedCalendar[k])]);
  if (r.comparison)
    rows.push([
      t("comparison"),
      n(r.comparison.originalScore),
      n(r.comparison.newScore),
      n(r.comparison.scoreImprovement),
    ]);
  if (r.comparison)
    for (const c of r.conflicts)
      rows.push([
        t("comparison"),
        t(c.field),
        t("original"),
        t(
          r.comparison.originalConflicts?.find((v) => v.field === c.field)
            ?.status || "Unavailable",
        ),
        t("revised"),
        t(c.status),
      ]);
  return rows;
}
module.exports = { reportRows };
