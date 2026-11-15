const assert = require("node:assert/strict"),
  fs = require("fs"),
  path = require("path");
const { en, bn } = require("../shared/locales.json");
assert.deepEqual(Object.keys(en).sort(), Object.keys(bn).sort());
for (const [k, v] of Object.entries(bn))
  assert.ok(
    v && /[\u0980-\u09ff]/.test(v),
    `Missing Bengali translation: ${k}`,
  );
const files = [
  "frontend/src/App.jsx",
  ...fs
    .readdirSync(path.join(__dirname, "../frontend/src/components"))
    .filter((f) => f.endsWith(".jsx"))
    .map((f) => "frontend/src/components/" + f),
];
let references = 0;
for (const file of files) {
  const s = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  for (const match of s.matchAll(/\bt\(\s*["']([^"']+)["']\s*\)/g)) {
    references++;
    assert.ok(en[match[1]], `Missing key ${match[1]} in ${file}`);
  }
}
assert.ok(
  references > 100,
  "Translation call scanning must actually inspect component labels",
);
for (const dir of ["backend/src/services", "backend/src/routes"])
  for (const name of fs.readdirSync(path.join(__dirname, "..", dir))) {
    if (!name.endsWith(".js")) continue;
    const s = fs.readFileSync(path.join(__dirname, "..", dir, name), "utf8");
    for (const m of s.matchAll(/\bfail\(\s*\d+\s*,\s*["']([^"']+)["']/g))
      assert.ok(en[m[1]], `Missing server error translation: ${m[1]}`);
  }
console.log(
  `Translation coverage passed: ${Object.keys(en).length} matching English/Bengali keys, ${references} literal UI calls, server error labels checked.`,
);
