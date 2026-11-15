// Test fixture weather transport only. Inference goes to the actual frozen FastAPI model.
// These meteorological fixtures do NOT establish agricultural accuracy.
const axios = require("axios"),
  originalGet = axios.get;
axios.get = async function (url, config) {
  if (!url.includes("open-meteo.com")) return originalGet(url, config);
  const p = config.params,
    dates = [];
  for (
    let d = Date.parse(p.start_date);
    d <= Date.parse(p.end_date);
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
        precipitation_sum: dates.map(() => 3),
      },
    },
  };
};
require("../../backend/src/app").listen(5019, "127.0.0.1", () =>
  console.log("Isolated browser fixture API ready"),
);
