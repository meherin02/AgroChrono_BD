const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  axios = require("axios"),
  db = require("../src/config/db"),
  { fetchProduct } = require("../src/services/weatherService");
test("duplicate or shifted provider dates never pass a full weather coverage check", async () => {
  const get = axios.get,
    collection = db.collection;
  db.collection = async () => ({
    findOne: async () => null,
    updateOne: async () => ({}),
  });
  try {
    for (const dates of [
      ["2025-01-01", "2025-01-01"],
      ["2025-01-02", "2025-01-03"],
    ]) {
      axios.get = async () => ({
        data: {
          daily: {
            time: dates,
            temperature_2m_mean: [20, 20],
            temperature_2m_min: [10, 10],
            temperature_2m_max: [30, 30],
            precipitation_sum: [0, 0],
          },
        },
      });
      const weather = await fetchProduct("Rangpur", "2025-01-01", "2025-01-02");
      assert.equal(weather.available, false);
      assert.equal(weather.totalRainfall, null);
      assert.equal(weather.reason, "INCOMPLETE_WEATHER");
    }
  } finally {
    axios.get = get;
    db.collection = collection;
  }
});
