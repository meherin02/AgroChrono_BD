const catalogs = require("./locales.json");
function tools(lang = "en") {
  const locale = lang === "bn" ? "bn-BD" : "en-GB",
    t = (key) => catalogs[lang][key] || key;
  const n = (value) =>
    value === null || value === undefined
      ? "—"
      : new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(
          value,
        );
  const date = (value) =>
    !value
      ? "—"
      : new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(value));
  const window = (w) =>
    typeof w === "object" && w
      ? new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "long",
          timeZone: "UTC",
        }).format(new Date(Date.UTC(2000, w.startMonth - 1, w.startDay))) +
        " – " +
        new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "long",
          timeZone: "UTC",
        }).format(new Date(Date.UTC(2000, w.endMonth - 1, w.endDay)))
      : w || "—";
  return { t, n, date, window };
}
function conflictValues(r, c, lang) {
  const { t, n, date, window } = tools(lang),
    s = r.submission,
    ref = r.reference,
    w = r.weatherAssessment;
  if (c.field === "Planting Window")
    return [
      date(s.plantingStart) + " – " + date(s.plantingEnd),
      window(ref.plantingWindow),
    ];
  if (c.field === "Harvest Window")
    return [
      date(s.harvestStart) + " – " + date(s.harvestEnd),
      window(ref.harvestWindow),
    ];
  if (c.field === "Growth Duration")
    return [
      n(r.mlFeatures.growth_days) + " " + t("days"),
      n(ref.growthDurationDays.min) +
        "–" +
        n(ref.growthDurationDays.max) +
        " " +
        t("days"),
    ];
  return [
    w.available
      ? n(w.meanTemperature) +
        t("celsius") +
        " / " +
        n(w.totalRainfall) +
        " " +
        t("mm")
      : t("unavailable"),
    n(ref.temperatureRange.optimalMin) +
      "–" +
      n(ref.temperatureRange.optimalMax) +
      t("celsius"),
  ];
}
module.exports = { tools, conflictValues, catalogs };
