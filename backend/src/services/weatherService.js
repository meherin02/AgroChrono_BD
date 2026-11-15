const axios = require("axios"),
  db = require("../config/db");
const districts = require("../data/bangladeshDistricts");
const { validDate } = require("./validation");
const DAY = 86400000,
  iso = (d) => new Date(d).toISOString().slice(0, 10);
const unavailable = (reason, extra = {}) => ({
  available: false,
  reason,
  meanTemperature: null,
  minTemperature: null,
  maxTemperature: null,
  totalRainfall: null,
  weatherCompatibilityScore: null,
  weatherStatus: "Unavailable",
  ...extra,
});
async function fetchProduct(
  districtName,
  startDate,
  endDate,
  forecast = false,
) {
  const district = districts.find((d) => d.name === districtName);
  if (
    !district ||
    !validDate(startDate) ||
    !validDate(endDate) ||
    startDate > endDate
  )
    return unavailable("INVALID_WEATHER_WINDOW");
  const today = iso(Date.now()),
    archiveEnd = iso(Date.now() - 5 * DAY);
  if (!forecast && endDate >= archiveEnd) {
    if (startDate >= today && endDate <= iso(Date.now() + 15 * DAY))
      forecast = true;
    else
      return unavailable("OUTSIDE_WEATHER_COVERAGE", {
        requestedStart: startDate,
        requestedEnd: endDate,
      });
  }
  const key = [
      districtName,
      startDate,
      endDate,
      forecast ? "forecast" : "archive",
    ].join(":"),
    cache = await db.collection("weathercache");
  const saved = await cache.findOne({ key }),
    maxAge = forecast ? 30 * 60000 : 7 * DAY;
  if (
    saved &&
    Date.now() - new Date(saved.product.retrievedAt).getTime() < maxAge
  )
    return { ...saved.product, cached: true };
  const base = forecast
    ? "https://api.open-meteo.com/v1/forecast"
    : "https://archive-api.open-meteo.com/v1/archive";
  const params = {
    latitude: district.lat,
    longitude: district.lon,
    start_date: startDate,
    end_date: endDate,
    daily:
      "temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum",
    timezone: "Asia/Dhaka",
  };
  try {
    const response = await axios.get(base, { params, timeout: 8000 }),
      daily = response.data.daily;
    if (!daily || !Array.isArray(daily.time))
      throw new Error("Missing daily data");
    const expectedDays =
      Math.round((Date.parse(endDate) - Date.parse(startDate)) / DAY) + 1;
    const rows = daily.time.map((date, i) => ({
      date,
      mean: daily.temperature_2m_mean?.[i],
      min: daily.temperature_2m_min?.[i],
      max: daily.temperature_2m_max?.[i],
      rain: daily.precipitation_sum?.[i],
    }));
    const completeRows = rows.filter((r) =>
      [r.mean, r.min, r.max, r.rain].every(Number.isFinite),
    );
    const datesMatch = rows.every(
      (r, i) =>
        validDate(r.date) && r.date === iso(Date.parse(startDate) + i * DAY),
    );
    const complete =
      datesMatch &&
      rows.length === expectedDays &&
      completeRows.length === expectedDays;

    const product = {
      available: complete,
      reason: complete ? null : "INCOMPLETE_WEATHER",
      product: forecast ? "forecast" : "historical_reanalysis",
      dataSource: forecast
        ? "Open-Meteo Forecast"
        : "Open-Meteo Historical Archive",
      sourceUrl: forecast
        ? "https://open-meteo.com/en/docs"
        : "https://open-meteo.com/en/docs/historical-weather-api",
      retrievedAt: new Date().toISOString(),
      coverageStart: startDate,
      coverageEnd: endDate,
      expectedDays,
      completeDays: completeRows.length,
      district: districtName,
      rows,
      meanTemperature: complete
        ? Math.round(
            (completeRows.reduce((s, r) => s + r.mean, 0) / expectedDays) * 10,
          ) / 10
        : null,
      minTemperature: complete
        ? Math.round(Math.min(...completeRows.map((r) => r.min)) * 10) / 10
        : null,
      maxTemperature: complete
        ? Math.round(Math.max(...completeRows.map((r) => r.max)) * 10) / 10
        : null,
      totalRainfall: complete
        ? Math.round(completeRows.reduce((s, r) => s + r.rain, 0) * 10) / 10
        : null,
    };
    await cache.updateOne({ key }, { $set: { product } }, { upsert: true });
    return product;
  } catch (e) {
    if (saved)
      return {
        ...saved.product,
        cached: true,
        stale: true,
        available: false,
        reason: "STALE_WEATHER",
      };
    return unavailable("WEATHER_PROVIDER_UNAVAILABLE", {
      requestedStart: startDate,
      requestedEnd: endDate,
    });
  }
}
async function getCultivationWeather(district, season, start, end, reference) {
  const w = await fetchProduct(district, start, end);
  return w.available ? { ...w, ...assessWeatherSuitability(w, reference) } : w;
}
async function getForecast(district) {
  return fetchProduct(
    district,
    iso(Date.now()),
    iso(Date.now() + 6 * DAY),
    true,
  );
}
function assessWeatherSuitability(weather, reference) {
  if (!reference || !reference.temperatureRange) {
    return {
      score: 85,
      status: "Compatible",
      explanation:
        "Weather parameters are within general agro-climatic tolerance.",
    };
  }

  const { min, max, optimalMin, optimalMax } = reference.temperatureRange;
  const temp = weather.meanTemperature;

  let tempScore = 100;
  let issues = [];

  if (temp < min) {
    const dev = Math.round((min - temp) * 10) / 10;
    tempScore = Math.max(20, 100 - dev * 15);
    issues.push(
      `Average temperature (${temp}°C) is ${dev}°C below reference threshold (${min}°C). Risk of stunted vegetative growth or chilling injury.`,
    );
  } else if (temp > max) {
    const dev = Math.round((temp - max) * 10) / 10;
    tempScore = Math.max(20, 100 - dev * 15);
    issues.push(
      `Average temperature (${temp}°C) is ${dev}°C above reference limit (${max}°C). Heat stress may affect flowering and grain filling.`,
    );
  } else if (temp < optimalMin || temp > optimalMax) {
    tempScore = 85;
  }

  // Rainfall suitability check
  let rainScore = 100;
  if (reference.rainfallRequirementMm) {
    const { min: rainMin } = reference.rainfallRequirementMm;
    if (weather.totalRainfall < rainMin * 0.4) {
      rainScore = 65;
      issues.push(
        `Seasonal rainfall (${weather.totalRainfall}mm) is low for ${reference.crop} (${reference.rainfallRequirementMm.label}). Timely supplemental irrigation will be essential.`,
      );
    }
  }

  const overallScore = Math.round(tempScore * 0.6 + rainScore * 0.4);
  const status =
    overallScore >= 80
      ? "Compatible"
      : overallScore >= 55
        ? "Moderate Risk"
        : "Severe Conflict";

  return {
    weatherCompatibilityScore: overallScore,
    weatherStatus: status,
    weatherIssues: issues,
    suitabilitySummary:
      issues.length > 0
        ? issues.join(" ")
        : "Temperatures and moisture levels align favorably with crop phenological requirements.",
  };
}

module.exports = {
  getCultivationWeather,
  getForecast,
  fetchProduct,
  assessWeatherSuitability,
};
