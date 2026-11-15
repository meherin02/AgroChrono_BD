const districts = require("../data/bangladeshDistricts");
const crops = [
  { id: "Rice", seasons: ["Aman", "Boro", "Aus"] },
  { id: "Wheat", seasons: ["Rabi"] },
  { id: "Potato", seasons: ["Rabi"] },
  { id: "Mustard", seasons: ["Rabi"] },
];
const dateFields = [
  "plantingStart",
  "plantingEnd",
  "growthStart",
  "growthEnd",
  "harvestStart",
  "harvestEnd",
];
const digits = (v) =>
  typeof v === "string"
    ? v.replace(/[০-৯]/g, (c) => "০১২৩৪৫৬৭৮৯".indexOf(c))
    : v;
function validDate(v) {
  return (
    typeof v === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    Number.isFinite(Date.parse(v)) &&
    new Date(v).toISOString().slice(0, 10) === v
  );
}
function normalizeDate(v) {
  const text = typeof v === "string" ? digits(v).trim() : v;
  const match = typeof text === "string" && /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  return match ? `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}` : text;
}
function validate(data) {
  let errors = [];
  if (!data || typeof data !== "object" || Array.isArray(data))
    return { valid: false, errors: [{ code: "OBJECT_REQUIRED" }] };
  const allowed = [
    ...dateFields,
    "crop",
    "district",
    "season",
    "variety",
    "plotId",
  ];
  for (const field of Object.keys(data))
    if (!allowed.includes(field))
      errors.push({ code: "UNEXPECTED_FIELD", field });
  for (const field of ["crop", "district", "season", ...dateFields])
    if (typeof data[field] !== "string" || !data[field].trim())
      errors.push({ code: "FIELD_REQUIRED", field });
  if (errors.length) return { valid: false, errors };
  const value = Object.fromEntries(
    allowed
      .filter((k) => data[k] !== undefined)
      .map((k) => [k, dateFields.includes(k) ? normalizeDate(data[k]) : data[k]]),
  );
  for (const field of ["variety", "plotId"])
    if (
      value[field] !== undefined &&
      (typeof value[field] !== "string" || value[field].length > 120)
    )
      errors.push({ code: "INVALID_TEXT", field });
  const crop = crops.find((c) => c.id === value.crop);
  if (!crop || !crop.seasons.includes(value.season))
    errors.push({ code: "INVALID_CROP_SEASON" });
  if (!districts.some((d) => d.name === value.district))
    errors.push({ code: "INVALID_DISTRICT" });
  for (const field of dateFields)
    if (!validDate(value[field])) errors.push({ code: "INVALID_DATE", field });
  if (!errors.length) {
    for (let i = 1; i < dateFields.length; i++)
      if (value[dateFields[i]] < value[dateFields[i - 1]])
        errors.push({ code: "STAGE_ORDER", field: dateFields[i] });
    // Agronomic duration is assessed against the crop reference by the scoring
    // engine. Unusual durations must reach assessment instead of being rejected.
  }
  return { valid: errors.length === 0, errors, value };
}
module.exports = { validate, validDate, dateFields, crops, digits };
