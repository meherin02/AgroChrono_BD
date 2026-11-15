const { test } = require("node:test"),
  assert = require("node:assert/strict");
const { validate } = require("../src/services/validation"),
  { analyzeConflicts } = require("../src/services/conflictEngine"),
  refs = require("../src/data/referenceCalendars.json"),
  {
    calculateReliabilityScore,
  } = require("../src/services/reliabilityCalculator");
test("all existing reference proposals preserve strict chronological order across years", () => {
  for (const ref of refs) {
    const s = {
      crop: ref.crop,
      season: ref.season,
      district: ref.district,
      plantingStart: "2025-07-20",
      plantingEnd: "2025-07-30",
      growthStart: "2025-08-01",
      growthEnd: "2025-11-01",
      harvestStart: "2025-11-15",
      harvestEnd: "2025-11-30",
    };
    const proposal = analyzeConflicts(s, ref, null).suggestedCalendar;
    const fields = [
      "crop",
      "season",
      "district",
      "variety",
      "plantingStart",
      "plantingEnd",
      "growthStart",
      "growthEnd",
      "harvestStart",
      "harvestEnd",
    ];
    const input = Object.fromEntries(fields.map((k) => [k, proposal[k]]));
    assert.equal(
      validate(input).valid,
      true,
      ref.id + JSON.stringify(validate(input).errors),
    );
  }
});
test("accepted successful scoring arithmetic remains unchanged, including anomaly adjustment", () => {
  const raw = { planting: 80, growth: 90, harvest: 70, weather: 85 };
  assert.equal(
    calculateReliabilityScore(raw, true, { available: true, is_anomaly: false })
      .score,
    81,
  );
  assert.equal(
    calculateReliabilityScore(raw, true, {
      available: true,
      is_anomaly: true,
      anomaly_score: 0.1,
    }).score,
    77,
  );
  assert.equal(
    calculateReliabilityScore(raw, false, null).assessmentCompleteness,
    75,
  );
});
test("Vercel handler imports without listening and artifact snapshots match expected inventory", () => {
  const handler = require("../../api/[...path].js");
  assert.equal(typeof handler, "function");
  const d = require("../src/data/bangladeshDistricts");
  assert.equal(d.length, 14);
  assert.equal(refs.length, 10);
  assert.equal(new Set(refs.map((r) => r.crop)).size, 4);
  assert.equal(new Set(refs.map((r) => r.district)).size, 7);
});

test("deployment SPA fallback excludes APIs, built assets, local fonts and favicon", () => {
  const config = require("../../vercel.json"),
    route = new RegExp("^" + config.rewrites[0].source + "$");
  for (const url of [
    "/api/health",
    "/api/history",
    "/api",
    "/assets/index.js",
    "/fonts/HindSiliguri-Regular.ttf",
    "/favicon.svg",
  ])
    assert.equal(route.test(url), false, url);
  assert.equal(route.test("/farmer/calendar"), true);
});
