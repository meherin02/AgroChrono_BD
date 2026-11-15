const { test, before, after } = require("node:test"),
  assert = require("node:assert/strict"),
  { randomUUID } = require("node:crypto");
process.env.MONGODB_URI =
  process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27029";
process.env.MONGODB_DB_NAME =
  "agrochrono_test_" + randomUUID().replaceAll("-", "");
process.env.SESSION_SECRET = "test-only-session-secret-at-least-32-characters";
process.env.APP_ORIGIN = "http://localhost:3999";
process.env.ML_SERVICE_URL = "http://fixture-inference";
const db = require("../src/config/db"),
  axios = require("axios"),
  app = require("../src/app");
let server,
  base,
  farmerA,
  farmerB,
  result,
  revision,
  plot,
  failWeather = false,
  partialWeather = false,
  failML = false;
const sourceGet = axios.get,
  sourcePost = axios.post;
axios.get = async (url, { params } = {}) => {
  if (url.endsWith("/health"))
    return { data: { model_loaded: true, model_version: "fixture-model" } };
  if (failWeather) throw Error("fixture provider failure");
  const dates = [];
  for (
    let d = Date.parse(params.start_date);
    d <= Date.parse(params.end_date);
    d += 86400000
  )
    dates.push(new Date(d).toISOString().slice(0, 10));
  return {
    data: {
      daily: {
        time: dates,
        temperature_2m_mean: dates.map(() => 29.2),
        temperature_2m_min: dates.map(() => 23),
        temperature_2m_max: dates.map(() => 42),
        precipitation_sum: dates.map((_, i) =>
          partialWeather && i === 0 ? null : 3,
        ),
      },
    },
  };
};
axios.post = async () => {
  if (failML) throw Error();
  return {
    data: {
      is_anomaly: false,
      anomaly_score: -0.1049,
      model_version: "fixture-model",
    },
  };
};
const calendar = {
  crop: "Rice",
  season: "Aman",
  district: "Rangpur",
  variety: "BRRI dhan49",
  plantingStart: "2025-07-20",
  plantingEnd: "2025-07-30",
  growthStart: "2025-08-01",
  growthEnd: "2025-11-01",
  harvestStart: "2025-11-15",
  harvestEnd: "2025-11-30",
};
async function request(
  path,
  {
    user,
    method = "GET",
    body,
    origin = process.env.APP_ORIGIN,
    csrf = true,
    key,
  } = {},
) {
  const response = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      "X-Requested-With": "AgroChrono",
      ...(user
        ? {
            Cookie: user.cookie,
            ...(csrf ? { "X-CSRF-Token": user.csrf } : {}),
          }
        : {}),
      ...(key ? { "Idempotency-Key": key } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  return {
    status: response.status,
    headers: response.headers,
    text,
    data: response.headers.get("content-type")?.includes("json")
      ? JSON.parse(text)
      : text,
  };
}
async function register(username) {
  const r = await request("/auth/register", {
    method: "POST",
    body: {
      username,
      password: "correct-test-password",
      displayName: "কৃষক " + username,
      language: "bn",
    },
  });
  assert.equal(r.status, 201, r.text);
  return {
    cookie: r.headers.get("set-cookie").split(";")[0],
    csrf: r.data.csrf,
    id: r.data.user.id,
  };
}
before(async () => {
  await db.connectDB();
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = "http://127.0.0.1:" + server.address().port + "/api";
});
after(async () => {
  axios.get = sourceGet;
  axios.post = sourcePost;
  await (await db.connectDB()).dropDatabase();
  await db.close();
  await new Promise((resolve) => server.close(resolve));
});
test("farmer registration, Bengali username, secure hash/session, reload and injection", async () => {
  farmerA = await register("কৃষক_এক");
  farmerB = await register("farmer_two");
  const s = await request("/auth/session", { user: farmerA });
  assert.equal(s.data.user.id, farmerA.id);
  assert.equal(s.data.user.passwordHash, undefined);
  assert.equal(s.data.user.username, "কৃষক_এক");
  assert.match(
    (
      await request("/auth/login", {
        method: "POST",
        body: { username: "farmer_two", password: "correct-test-password" },
      })
    ).headers.get("set-cookie"),
    /HttpOnly/i,
  );
  const u = await (await db.collection("farmers")).findOne({ id: farmerA.id });
  assert.notEqual(u.passwordHash, "correct-test-password");
  assert.equal(
    (
      await request("/profile", {
        user: farmerA,
        method: "PATCH",
        body: { ownerId: farmerB.id, role: "admin" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/profile", {
        user: farmerA,
        method: "PATCH",
        body: { displayName: "x" },
        csrf: false,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("/profile", {
        user: farmerA,
        method: "PATCH",
        body: { displayName: "x" },
        origin: "https://attacker.invalid",
      })
    ).status,
    403,
  );
});
test("strict date/type/order validation and unsupported exact references", async () => {
  for (const body of [
    null,
    [],
    { ...calendar, crop: {} },
    { ...calendar, plantingStart: "2025-02-30" },
    { ...calendar, growthEnd: "2025-12-30" },
    { ...calendar, harvestEnd: "Infinity" },
  ]) {
    assert.equal(
      (await request("/validate", { user: farmerA, method: "POST", body }))
        .status,
      400,
    );
  }
  assert.equal(
    (
      await request("/validate", {
        user: farmerA,
        method: "POST",
        body: { ...calendar, plantingStart: "২০২৫-০৭-২০" },
      })
    ).status,
    200,
  );
  const leap = {
    ...calendar,
    crop: "Wheat",
    season: "Rabi",
    district: "Dinajpur",
    plantingStart: "2023-11-20",
    plantingEnd: "2023-11-25",
    growthStart: "2023-11-26",
    growthEnd: "2024-02-29",
    harvestStart: "2024-03-05",
    harvestEnd: "2024-03-15",
  };
  assert.equal(
    (await request("/validate", { user: farmerA, method: "POST", body: leap }))
      .status,
    200,
  );
  assert.equal(
    (
      await request("/analyze", {
        user: farmerA,
        method: "POST",
        key: randomUUID(),
        body: { ...calendar, district: "Sylhet" },
      })
    ).status,
    422,
  );
});
test("valid durable analysis, concurrent duplicate safe retry and owner isolation", async () => {
  const key = randomUUID();
  const pair = await Promise.all([
    request("/analyze", { user: farmerA, method: "POST", key, body: calendar }),
    request("/analyze", { user: farmerA, method: "POST", key, body: calendar }),
  ]);
  assert.ok(pair.some((r) => r.status === 201));
  assert.ok(pair.every((r) => [200, 201, 409].includes(r.status)));
  result = pair.find((r) => r.status === 201).data.data;
  assert.equal(
    await (
      await db.collection("results")
    ).countDocuments({ ownerId: farmerA.id }),
    1,
  );
  const retry = await request("/analyze", {
    user: farmerA,
    method: "POST",
    key,
    body: calendar,
  });
  assert.equal(retry.data.data.id, result.id);
  assert.equal((await request("/history", { user: farmerB })).data.total, 0);
  assert.equal(
    (await request("/results/" + result.id, { user: farmerB })).status,
    404,
  );
  assert.equal(
    (await request("/results/" + result.id + "/report.csv", { user: farmerB }))
      .status,
    404,
  );
  assert.equal(
    (await request("/results/" + result.id, { user: farmerA })).data.data.id,
    result.id,
  );
  assert.equal(
    (await request("/history?search=[Rangpur]", { user: farmerA })).status,
    200,
  );
});
test("plot ownership, linked revision, original immutable, independent activities", async () => {
  plot = (
    await request("/plots", {
      user: farmerA,
      method: "POST",
      body: { name: "দক্ষিণ মাঠ", district: "Rangpur", area: 1.2, unit: "ha" },
    })
  ).data;
  assert.equal((await request("/plots", { user: farmerB })).data.length, 0);
  assert.equal(
    (
      await request("/analyze", {
        user: farmerB,
        method: "POST",
        key: randomUUID(),
        body: { ...calendar, plotId: plot.id },
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await request("/reanalyze", {
        user: farmerB,
        method: "POST",
        key: randomUUID(),
        body: { originalResultId: result.id, correctedCalendar: calendar },
      })
    ).status,
    404,
  );
  const revised = await request("/reanalyze", {
    user: farmerA,
    method: "POST",
    key: randomUUID(),
    body: {
      originalResultId: result.id,
      correctedCalendar: {
        ...calendar,
        plotId: plot.id,
        plantingStart: "2025-07-22",
      },
    },
  });
  assert.equal(revised.status, 201, revised.text);
  revision = revised.data.data;
  assert.equal(revision.parentId, result.id);
  assert.equal(
    revision.comparison.scoreImprovement,
    revision.reliabilityScore - result.reliabilityScore,
  );
  assert.equal(
    (await request("/results/" + result.id, { user: farmerA })).data.data
      .submission.plantingStart,
    calendar.plantingStart,
  );
  assert.equal(
    (
      await request("/results/" + revision.id + "/activities/planting", {
        user: farmerA,
        method: "PATCH",
        body: { complete: true },
      })
    ).status,
    200,
  );
  assert.equal(
    (await request("/results/" + revision.id, { user: farmerA })).data.data
      .activities[0].complete,
    true,
  );
  assert.equal(
    (await request("/results/" + result.id, { user: farmerA })).data.data
      .activities[0].complete,
    false,
  );
  assert.equal(
    (
      await request("/results/" + revision.id + "/activities/planting", {
        user: farmerB,
        method: "PATCH",
        body: { complete: true },
      })
    ).status,
    404,
  );
  await request("/results/" + revision.id + "/activities/planting", {
    user: farmerA,
    method: "PATCH",
    body: { complete: false },
  });
  assert.equal(
    (await request("/results/" + revision.id, { user: farmerA })).data.data
      .activities[0].complete,
    false,
  );
});
test("CSV localization and escaping preserve cells and prevent formula injection", async () => {
  const altered = await request("/analyze", {
    user: farmerA,
    method: "POST",
    key: randomUUID(),
    body: { ...calendar, variety: '=SUM(1,2)\n"quoted"' },
  });
  const csv = await request(
    "/results/" + altered.data.data.id + "/report.csv?lang=bn",
    { user: farmerA },
  );
  assert.equal(csv.status, 200);
  assert.match(csv.text, /ফসল ক্যালেন্ডার/);
  assert.match(csv.text, /'=SUM\(1,2\)/);
  assert.match(csv.text, /""quoted""/);
  const en = await request("/results/" + result.id + "/report.csv?lang=en", {
    user: farmerA,
  });
  assert.match(en.text, /Crop calendar assessment report/);
});
test("missing weather never fabricates ML features; partial coverage and stale cache are explicit", async () => {
  const { getCultivationWeather } = require("../src/services/weatherService"),
    ref = require("../src/data/referenceCalendars.json")[0];
  failWeather = true;
  const r = await request("/analyze", {
    user: farmerA,
    method: "POST",
    key: randomUUID(),
    body: { ...calendar, district: "Dhaka" },
  });
  assert.equal(r.status, 201, r.text);
  assert.equal(r.data.data.mlFeatures.mean_temperature, null);
  assert.equal(r.data.data.mlResult.is_anomaly, null);
  assert.equal(r.data.data.weatherAssessment.available, false);
  assert.equal(r.data.data.assessmentCompleteness, 75);
  failWeather = false;
  partialWeather = true;
  const w = await getCultivationWeather(
    "Rangpur",
    "Aman",
    "2024-07-20",
    "2024-11-30",
    ref,
  );
  assert.equal(w.available, false);
  assert.equal(w.totalRainfall, null);
  partialWeather = false;
  const cache = await db.collection("weathercache");
  await cache.updateMany(
    {},
    { $set: { "product.retrievedAt": "2020-01-01T00:00:00Z" } },
  );
  failWeather = true;
  const stale = await getCultivationWeather(
    "Rangpur",
    "Aman",
    calendar.plantingStart,
    calendar.harvestEnd,
    ref,
  );
  assert.equal(stale.stale, true);
  assert.equal(stale.available, false);
  failWeather = false;
  failML = true;
  const ml = await require("../src/services/mlService").predictAnomaly({
    planting_doy: 205,
    growth_days: 125,
    harvest_doy: 330,
    mean_temperature: 29.2,
    total_rainfall: 950,
  });
  assert.equal(ml.available, false);
  assert.equal(ml.is_anomaly, null);
  failML = false;
});
test("weather alerts persist, deduplicate and enforce read/dismiss ownership", async () => {
  const date = (d) =>
    new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
  const live = {
    ...calendar,
    plantingStart: date(0),
    plantingEnd: date(10),
    growthStart: date(11),
    growthEnd: date(100),
    harvestStart: date(101),
    harvestEnd: date(115),
    plotId: plot.id,
  };
  assert.equal(
    (
      await request("/analyze", {
        user: farmerA,
        method: "POST",
        key: randomUUID(),
        body: live,
      })
    ).status,
    201,
  );
  const refresh = await request("/weather/refresh", {
    user: farmerA,
    method: "POST",
    body: {},
  });
  assert.equal(refresh.status, 200, refresh.text);
  const first = (await request("/notifications", { user: farmerA })).data;
  assert.ok(first.length > 0);
  await request("/weather/refresh", {
    user: farmerA,
    method: "POST",
    body: {},
  });
  assert.equal(
    (await request("/notifications", { user: farmerA })).data.length,
    first.length,
  );
  const id = first[0].id;
  assert.equal(
    (
      await request("/notifications/" + id, {
        user: farmerB,
        method: "PATCH",
        body: { read: true },
      })
    ).status,
    404,
  );
  await request("/notifications/" + id, {
    user: farmerA,
    method: "PATCH",
    body: { read: true },
  });
  assert.equal(
    (await request("/notifications", { user: farmerA })).data.find(
      (a) => a.id === id,
    ).read,
    true,
  );
  await request("/notifications/" + id, {
    user: farmerA,
    method: "PATCH",
    body: { dismissed: true },
  });
  assert.ok(
    !(await request("/notifications", { user: farmerA })).data.some(
      (a) => a.id === id,
    ),
  );
});
test("profile language, consent and pagination; no fixed history truncation", async () => {
  assert.equal(
    (
      await request("/profile", {
        user: farmerA,
        method: "PATCH",
        body: { phone: "01700000000" },
      })
    ).status,
    400,
  );
  const p = await request("/profile", {
    user: farmerA,
    method: "PATCH",
    body: {
      language: "en",
      contactConsent: true,
      phone: "01700000000",
      defaultDistrict: "Rangpur",
    },
  });
  assert.equal(p.data.language, "en");
  const c = await db.collection("results");
  await c.insertMany(
    Array.from({ length: 101 }, (_, i) => ({
      ...result,
      ownerId: farmerA.id,
      _id: undefined,
      id: randomUUID(),
      createdAt:
        "2024-01-" + String((i % 28) + 1).padStart(2, "0") + "T00:00:00.000Z",
    })),
  );
  const h = await request("/history?page=2", { user: farmerA });
  assert.equal(h.data.data.length, 10);
  assert.ok(h.data.total > 100);
  assert.ok((await request("/dashboard", { user: farmerA })).data.count > 100);
});
test("one farmer name supports registration, spaced Bengali sign-in, rename and legacy name login", async () => {
  const password = "name-only-test-password";
  const r = await request("/auth/register", {
    method: "POST",
    body: { displayName: "মোঃ রহিম উদ্দিন", password, language: "bn" },
  });
  assert.equal(r.status, 201, r.text);
  const user = {
    cookie: r.headers.get("set-cookie").split(";")[0],
    csrf: r.data.csrf,
    id: r.data.user.id,
  };
  assert.equal(r.data.user.displayName, "মোঃ রহিম উদ্দিন");
  const login = await request("/auth/login", {
    method: "POST",
    body: { displayName: "  মোঃ রহিম উদ্দিন  ", password },
  });
  assert.equal(login.status, 200, login.text);
  const renamed = await request("/profile", {
    user,
    method: "PATCH",
    body: { displayName: "রহিম উদ্দিন মিয়া" },
  });
  assert.equal(renamed.status, 200, renamed.text);
  assert.equal(
    (
      await request("/auth/login", {
        method: "POST",
        body: { displayName: "রহিম উদ্দিন মিয়া", password },
      })
    ).status,
    200,
  );
  const legacy = await request("/auth/login", {
    method: "POST",
    body: { displayName: "কৃষক কৃষক_এক", password: "correct-test-password" },
  });
  assert.equal(legacy.status, 200, legacy.text);
});
test("concurrent login throttling and production HTTPS cookie flags", async () => {
  const login = await request("/auth/login", {
    method: "POST",
    body: { username: "farmer_two", password: "correct-test-password" },
  });
  assert.equal(login.status, 200);
  const before = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    const secure = await request("/auth/login", {
      method: "POST",
      body: { username: "farmer_two", password: "correct-test-password" },
    });
    assert.match(secure.headers.get("set-cookie"), /Secure/);
    assert.match(secure.headers.get("set-cookie"), /SameSite=Lax/);
  } finally {
    process.env.NODE_ENV = before || "test";
  }
  const attempts = await Promise.all(
    Array.from({ length: 12 }, () =>
      request("/auth/login", {
        method: "POST",
        body: { username: "farmer_two", password: "incorrect-test-password" },
      }),
    ),
  );
  assert.ok(attempts.some((r) => r.status === 429));
  assert.ok(attempts.every((r) => [401, 429].includes(r.status)));
});
test("expired sessions, logout and failed database writes never report durable success", async () => {
  await (
    await db.collection("sessions")
  ).updateMany({ ownerId: farmerB.id }, { $set: { expiresAt: new Date(0) } });
  assert.equal((await request("/history", { user: farmerB })).status, 401);
  const originalCollection = db.collection;
  db.collection = async (name) => {
    const collection = await originalCollection(name);
    if (name === "results")
      return new Proxy(collection, {
        get(target, key) {
          if (key === "insertOne")
            return async () => {
              throw Error("simulated database write failure");
            };
          const value = target[key];
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
    return collection;
  };
  try {
    assert.equal(
      (
        await request("/analyze", {
          user: farmerA,
          method: "POST",
          key: randomUUID(),
          body: calendar,
        })
      ).status,
      503,
    );
  } finally {
    db.collection = originalCollection;
  }
  assert.equal(
    (await request("/auth/logout", { user: farmerA, method: "POST", body: {} }))
      .status,
    200,
  );
  assert.equal((await request("/history", { user: farmerA })).status, 401);
});
test("missing database configuration and unknown APIs fail without SPA or leaked internals", async () => {
  const uri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;
  try {
    await assert.rejects(db.connectDB(), { code: "DATABASE_UNAVAILABLE" });
  } finally {
    process.env.MONGODB_URI = uri;
  }
  assert.equal((await request("/officer")).status, 401);
  const r = await request("/health");
  assert.equal(r.data.database.connected, true);
  assert.ok(!r.text.includes("mongodb://"));
});
