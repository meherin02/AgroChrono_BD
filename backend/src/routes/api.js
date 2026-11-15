const express = require("express"),
  router = express.Router(),
  db = require("../config/db"),
  a = require("../services/auth");
const { validate, crops, validDate } = require("../services/validation"),
  districts = require("../data/bangladeshDistricts");
const { analyze, references, findReference } = require("../services/analysis"),
  { checkMLHealth } = require("../services/mlService"),
  { getForecast } = require("../services/weatherService");
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const clean = (d) => {
  if (!d) return d;
  const { _id, ownerId, ...rest } = d;
  return rest;
};
async function own(req, id) {
  const r = await (
    await db.collection("results")
  ).findOne({ id, ownerId: req.session.ownerId });
  if (!r) throw a.fail(404, "NOT_FOUND");
  return r;
}
function bodyOnly(body, keys) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).some((k) => !keys.includes(k))
  )
    throw a.fail(400, "UNEXPECTED_FIELD");
}
router.get(
  "/health",
  wrap(async (req, res) => {
    let database;
    try {
      await db.connectDB();
      database = { connected: true };
    } catch {
      database = { connected: false };
    }
    const ml = await checkMLHealth(),
      configuration = Boolean(
        process.env.SESSION_SECRET?.length >= 32 &&
        process.env.APP_ORIGIN &&
        (process.env.NODE_ENV !== "production" ||
          (process.env.ML_SERVICE_URL && process.env.ML_SERVICE_TOKEN)),
      );
    res
      .status(
        database.connected && configuration && ml.model_loaded ? 200 : 503,
      )
      .json({
        status:
          database.connected && configuration && ml.model_loaded
            ? "ready"
            : "degraded",
        configurationReady: configuration,
        database,
        mlMicroservice: ml,
      });
  }),
);
router.get("/options", (req, res) =>
  res.json({ crops, districts, references }),
);
router.get("/reference", (req, res) => {
  const { crop, season, district } = req.query;
  const found = findReference(crop, season, district);
  if (!found) return res.status(404).json({ error: "REFERENCE_UNAVAILABLE" });
  res.json(found);
});
router.get(
  "/auth/session",
  wrap(async (req, res) => {
    const s = await a.session(req);
    res.json(s ? { user: s.user, csrf: s.csrf } : { user: null });
  }),
);
router.post(
  "/auth/register",
  a.csrf,
  wrap(async (req, res) => {
    bodyOnly(req.body, ["username", "password", "displayName", "language"]);
    const username = a.username(req.body.username ?? req.body.displayName);
    await a.throttle(req, "register");
    const passwordHash = await a.hashPassword(req.body.password);
    if (
      typeof req.body.displayName !== "string" ||
      !req.body.displayName.trim() ||
      req.body.displayName.length > 100
    )
      throw a.fail(400, "INVALID_TEXT");
    const u = {
      id: a.randomUUID(),
      username,
      nameLogin: req.body.username === undefined,
      displayName: req.body.displayName.trim(),
      language: req.body.language === "bn" ? "bn" : "en",
      defaultDistrict: "",
      phone: "",
      contactConsent: false,
      createdAt: new Date().toISOString(),
      passwordHash,
    };
    try {
      await (await db.collection("farmers")).insertOne(u);
    } catch (e) {
      if (e.code === 11000) throw a.fail(409, "USERNAME_TAKEN");
      throw e;
    }
    res.status(201).json(await a.createSession(req, res, u));
  }),
);
router.post(
  "/auth/login",
  a.csrf,
  wrap(async (req, res) => {
    bodyOnly(req.body, ["username", "displayName", "password"]);
    await a.throttle(req, "login");
    const username = a.username(req.body.username ?? req.body.displayName);
    const farmers = await db.collection("farmers");
    let u = await farmers.findOne({ username });
    // Preserve sign-in for accounts created before the separate username input was removed.
    if (!u && typeof req.body.displayName === "string") {
      const matches = await farmers
        .find({ displayName: req.body.displayName.normalize("NFC").trim() })
        .collation({ locale: "en", strength: 2 })
        .limit(2)
        .toArray();
      if (matches.length === 1) u = matches[0];
    }
    if (!u || !(await a.verify(req.body.password, u.passwordHash)))
      throw a.fail(401, "INVALID_CREDENTIALS");
    res.json(await a.createSession(req, res, u));
  }),
);
router.use(a.requireAuth);
router.use(a.csrf);
router.post(
  "/auth/logout",
  wrap(async (req, res) => {
    await (
      await db.collection("sessions")
    ).deleteOne({
      tokenHash: req.session.tokenHash,
      ownerId: req.session.ownerId,
    });
    a.setCookie(res, "", new Date(0));
    res.json({ success: true });
  }),
);
router.patch(
  "/profile",
  wrap(async (req, res) => {
    bodyOnly(req.body, [
      "displayName",
      "language",
      "defaultDistrict",
      "phone",
      "contactConsent",
    ]);
    const p = req.body;
    if (
      p.displayName !== undefined &&
      (typeof p.displayName !== "string" ||
        !p.displayName.trim() ||
        p.displayName.length > 100)
    )
      throw a.fail(400, "INVALID_TEXT");
    if (p.language !== undefined && !["en", "bn"].includes(p.language))
      throw a.fail(400, "INVALID_LANGUAGE");
    if (
      p.defaultDistrict !== undefined &&
      p.defaultDistrict !== "" &&
      !districts.some((d) => d.name === p.defaultDistrict)
    )
      throw a.fail(400, "INVALID_DISTRICT");
    if (p.contactConsent !== undefined && typeof p.contactConsent !== "boolean")
      throw a.fail(400, "INVALID_TEXT");
    if (
      p.phone !== undefined &&
      (typeof p.phone !== "string" || !/^\+?[০-৯\d -]{0,20}$/.test(p.phone))
    )
      throw a.fail(400, "INVALID_TEXT");
    const current = await (
      await db.collection("farmers")
    ).findOne({ id: req.session.ownerId });
    if (p.phone && !((p.contactConsent ?? current.contactConsent) === true))
      throw a.fail(400, "CONTACT_CONSENT_REQUIRED");
    if (p.contactConsent === false) p.phone = "";
    if (p.displayName !== undefined && current.nameLogin)
      p.username = a.username(p.displayName);
    try {
      await (
        await db.collection("farmers")
      ).updateOne({ id: req.session.ownerId }, { $set: p });
    } catch (e) {
      if (e.code === 11000) throw a.fail(409, "USERNAME_TAKEN");
      throw e;
    }

    res.json(a.publicFarmer({ ...current, ...p }));
  }),
);
router.get(
  "/plots",
  wrap(async (req, res) =>
    res.json(
      (
        await (
          await db.collection("plots")
        )
          .find({ ownerId: req.session.ownerId })
          .toArray()
      ).map(clean),
    ),
  ),
);
router.post(
  "/plots",
  wrap(async (req, res) => {
    bodyOnly(req.body, ["name", "area", "unit", "district"]);
    const p = req.body;
    if (
      typeof p.name !== "string" ||
      !p.name.trim() ||
      p.name.length > 100 ||
      !districts.some((d) => d.name === p.district) ||
      !["ha", "acre", "decimal"].includes(p.unit) ||
      (p.area !== null && (!Number.isFinite(p.area) || p.area <= 0))
    )
      throw a.fail(400, "INVALID_PLOT");
    const r = { ...p, id: a.randomUUID(), ownerId: req.session.ownerId };
    await (await db.collection("plots")).insertOne(r);
    res.status(201).json(clean(r));
  }),
);
router.post("/validate", (req, res) => {
  const v = validate(req.body);
  res.status(v.valid ? 200 : 400).json(v);
});
async function saveAnalysis(req, res, parentId) {
  const key = req.get("Idempotency-Key");
  if (!key || !/^[\w-]{16,100}$/.test(key))
    throw a.fail(400, "IDEMPOTENCY_REQUIRED");
  const parent = parentId ? await own(req, parentId) : null,
    input = parentId ? req.body.correctedCalendar : req.body;
  const validation = validate(input);
  if (!validation.valid)
    throw Object.assign(a.fail(400, "VALIDATION_FAILED"), {
      details: validation.errors,
    });
  if (input.plotId) {
    const plot = await (
      await db.collection("plots")
    ).findOne({ id: input.plotId, ownerId: req.session.ownerId });
    if (!plot) throw a.fail(404, "NOT_FOUND");
    if (plot.district !== input.district) throw a.fail(400, "INVALID_PLOT");
  }
  const ownerId = req.session.ownerId,
    requests = await db.collection("requests"),
    results = await db.collection("results");
  const fingerprint = require("crypto")
    .createHash("sha256")
    .update(JSON.stringify({ input: validation.value, parentId }))
    .digest("hex");
  const prior = await requests.findOne({ ownerId, key });
  if (prior) {
    if (prior.fingerprint !== fingerprint)
      throw a.fail(409, "IDEMPOTENCY_CONFLICT");
    const result = await results.findOne({ ownerId, id: prior.resultId });
    if (result) return res.json({ success: true, data: clean(result) });
    if (Date.now() - new Date(prior.createdAt).getTime() > 120000) {
      await requests.deleteOne({ _id: prior._id, createdAt: prior.createdAt });
    } else throw a.fail(409, "REQUEST_IN_PROGRESS");
  }
  const resultId = prior?.resultId || a.randomUUID();
  try {
    await requests.insertOne({
      ownerId,
      key,
      fingerprint,
      resultId,
      createdAt: new Date(),
    });
  } catch (e) {
    if (e.code === 11000) throw a.fail(409, "REQUEST_IN_PROGRESS");
    throw e;
  }
  try {
    const result = await analyze(validation.value);
    result.id = resultId;
    result.ownerId = ownerId;
    if (input.plotId) {
      const p = await (
        await db.collection("plots")
      ).findOne({ id: input.plotId, ownerId });
      result.plotSnapshot = {
        name: p.name,
        district: p.district,
        area: p.area,
        unit: p.unit,
      };
    }
    result.parentId = parent?.id || null;
    result.rootId = parent?.rootId || parent?.id || resultId;
    if (parent)
      result.comparison = {
        originalScore: parent.reliabilityScore,
        newScore: result.reliabilityScore,
        scoreImprovement: result.reliabilityScore - parent.reliabilityScore,
        originalConflicts: parent.conflicts,
        newConflicts: result.conflicts,
        sourceChanged:
          JSON.stringify(parent.reference) !==
            JSON.stringify(result.reference) ||
          parent.mlResult?.model_version !== result.mlResult?.model_version,
      };
    await results.insertOne(result);
    res.status(201).json({ success: true, data: clean(result) });
  } catch (e) {
    await requests.deleteOne({ ownerId, key });
    throw e;
  }
}
router.post(
  "/analyze",
  wrap((req, res) => saveAnalysis(req, res, null)),
);
router.post(
  "/reanalyze",
  wrap((req, res) => {
    bodyOnly(req.body, ["correctedCalendar", "originalResultId"]);
    if (typeof req.body.originalResultId !== "string")
      throw a.fail(400, "NOT_FOUND");
    return saveAnalysis(req, res, req.body.originalResultId);
  }),
);
router.get(
  "/history",
  wrap(async (req, res) => {
    const page = Number(req.query.page || 1);
    if (!Number.isSafeInteger(page) || page < 1 || page > 100000)
      throw a.fail(400, "INVALID_TEXT");
    const limit = 10,
      filter = { ownerId: req.session.ownerId };
    for (const k of ["crop", "district"])
      if (req.query[k]) filter["submission." + k] = String(req.query[k]);
    if (req.query.status) filter.reliabilityCategory = String(req.query.status);
    if (req.query.date) {
      if (!validDate(req.query.date)) throw a.fail(400, "INVALID_DATE");
      filter.createdAt = { $gte: req.query.date, $lt: req.query.date + "T99" };
    }
    if (req.query.search) {
      const q = String(req.query.search)
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        "submission.crop",
        "submission.district",
        "submission.variety",
      ].map((k) => ({ [k]: { $regex: q, $options: "i" } }));
    }
    const c = await db.collection("results");
    res.json({
      data: (
        await c
          .find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray()
      ).map(clean),
      page,
      total: await c.countDocuments(filter),
      limit,
    });
  }),
);
router.get(
  "/results/:id",
  wrap(async (req, res) =>
    res.json({ data: clean(await own(req, req.params.id)) }),
  ),
);
router.patch(
  "/results/:id/activities/:stage",
  wrap(async (req, res) => {
    await own(req, req.params.id);
    bodyOnly(req.body, ["complete"]);
    if (
      typeof req.body.complete !== "boolean" ||
      !["planting", "growth", "harvest"].includes(req.params.stage)
    )
      throw a.fail(400, "INVALID_ACTIVITY");
    await (
      await db.collection("results")
    ).updateOne(
      {
        id: req.params.id,
        ownerId: req.session.ownerId,
        "activities.id": req.params.stage,
      },
      {
        $set: {
          "activities.$.complete": req.body.complete,
          "activities.$.updatedAt": new Date().toISOString(),
        },
      },
    );
    res.json({ data: clean(await own(req, req.params.id)) });
  }),
);
router.get(
  "/dashboard",
  wrap(async (req, res) => {
    const c = await db.collection("results"),
      all = await c
        .find({ ownerId: req.session.ownerId })
        .sort({ createdAt: -1 })
        .toArray();
    const active = all.filter((r) => !all.some((x) => x.parentId === r.id));
    const activities = active
      .flatMap((r) =>
        (r.activities || []).map((v) => ({
          ...v,
          resultId: r.id,
          crop: r.submission.crop,
          district: r.submission.district,
          plotId: r.submission.plotId,
        })),
      )
      .filter((v) => !v.complete)
      .sort((a, b) => a.start.localeCompare(b.start));
    const overlaps = [];
    for (let i = 0; i < active.length; i++)
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i],
          b = active[j];
        if (
          a.submission.plotId &&
          a.submission.plotId === b.submission.plotId &&
          a.rootId !== b.rootId &&
          a.submission.plantingStart <= b.submission.harvestEnd &&
          b.submission.plantingStart <= a.submission.harvestEnd
        )
          overlaps.push({
            first: a.id,
            second: b.id,
            plotId: a.submission.plotId,
          });
      }
    res.json({
      count: all.length,
      recent: all.slice(0, 5).map(clean),
      recentRevisions: all
        .filter((r) => r.parentId)
        .slice(0, 5)
        .map(clean),
      activities: activities.slice(0, 30),
      incomplete: activities.length,
      revisions: all.filter((r) => r.parentId).length,
      overlaps,
      activeAlerts: await (
        await db.collection("notifications")
      ).countDocuments({ ownerId: req.session.ownerId, dismissed: false }),
    });
  }),
);
router.get(
  "/notifications",
  wrap(async (req, res) =>
    res.json(
      (
        await (
          await db.collection("notifications")
        )
          .find({ ownerId: req.session.ownerId, dismissed: false })
          .sort({ createdAt: -1 })
          .limit(100)
          .toArray()
      ).map(clean),
    ),
  ),
);
router.patch(
  "/notifications/:id",
  wrap(async (req, res) => {
    bodyOnly(req.body, ["read", "dismissed"]);
    if (
      !Object.keys(req.body).length ||
      Object.values(req.body).some((v) => typeof v !== "boolean")
    )
      throw a.fail(400, "INVALID_TEXT");
    const c = await db.collection("notifications"),
      r = await c.updateOne(
        { id: req.params.id, ownerId: req.session.ownerId },
        { $set: req.body },
      );
    if (!r.matchedCount) throw a.fail(404, "NOT_FOUND");
    res.json({ success: true });
  }),
);
router.post(
  "/weather/refresh",
  wrap(async (req, res) => {
    bodyOnly(req.body, []);
    const ownerId = req.session.ownerId,
      all = await (await db.collection("results")).find({ ownerId }).toArray(),
      current = all.filter((r) => !all.some((x) => x.parentId === r.id));
    const products = [],
      forecasts = new Map(),
      today = new Date().toISOString().slice(0, 10),
      end = new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10);
    const applicable = current.filter(
      (r) =>
        r.submission.harvestEnd >= today && r.submission.plantingStart <= end,
    );
    const districtNames = [
      ...new Set(applicable.map((r) => r.submission.district)),
    ];
    // At most three provider requests at once; avoid serial timeouts across districts.
    for (let i = 0; i < districtNames.length; i += 3)
      await Promise.all(
        districtNames
          .slice(i, i + 3)
          .map(async (district) =>
            forecasts.set(district, await getForecast(district)),
          ),
      );
    for (const r of applicable) {
      const w = forecasts.get(r.submission.district);
      products.push({ resultId: r.id, ...w });
      if (!w.available) continue;
      for (const day of w.rows) {
        const stage = r.activities.find(
          (a) => a.start <= day.date && a.end >= day.date,
        );
        if (!stage) continue;
        const t = r.reference.temperatureRange;
        if (day.max > t.max || day.min < t.min) {
          const key = [r.id, day.date, stage.stage, "temperature"].join(":");
          await (
            await db.collection("notifications")
          ).updateOne(
            { ownerId, key },
            {
              $set: { weather: w, day, threshold: t },
              $setOnInsert: {
                id: a.randomUUID(),
                ownerId,
                key,
                resultId: r.id,
                crop: r.submission.crop,
                district: r.submission.district,
                plotId: r.submission.plotId || null,
                date: day.date,
                stage: stage.stage,
                type: "temperature",
                read: false,
                dismissed: false,
                createdAt: new Date().toISOString(),
              },
            },
            { upsert: true },
          );
        }
      }
    }
    res.json({ products, checkedAt: new Date().toISOString() });
  }),
);
router.get(
  "/results/:id/report.csv",
  wrap(async (req, res) => {
    const r = await own(req, req.params.id);
    const { reportRows } = require("../services/report");
    const lang = req.query.lang === "bn" ? "bn" : "en";
    const escape = (v) =>
      '"' +
      String(v ?? "")
        .replace(/^[\s\uFEFF]*[=+@-]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    res
      .set("Content-Type", "text/csv; charset=utf-8")
      .set(
        "Content-Disposition",
        `attachment; filename="agrochrono-${r.id}-${lang}.csv"`,
      )
      .send(
        "\uFEFF" +
          reportRows(
            r,
            lang,
            req.query.includeProfile === "true"
              ? { farmer: req.session.user.displayName, plot: r.plotSnapshot }
              : null,
          )
            .map((row) => row.map(escape).join(","))
            .join("\r\n"),
      );
  }),
);
module.exports = router;
