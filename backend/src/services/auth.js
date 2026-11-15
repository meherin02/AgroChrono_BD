const {
  randomBytes,
  randomUUID,
  createHash,
  scrypt: derive,
  timingSafeEqual,
  createHmac,
} = require("node:crypto");
const { promisify } = require("node:util");
const scrypt = promisify(derive),
  db = require("../config/db");
const fail = (status, code) => Object.assign(new Error(code), { status, code });
function secret() {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)
    throw fail(503, "CONFIGURATION_REQUIRED");
  return process.env.SESSION_SECRET;
}
function tokenHash(v) {
  return createHmac("sha256", secret()).update(v).digest("hex");
}
function username(v) {
  if (typeof v !== "string") throw fail(400, "INVALID_USERNAME");
  const s = v
    .normalize("NFC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("en");
  if (!/^[\p{L}\p{M}\p{N} ._'’\-]{2,100}$/u.test(s))
    throw fail(400, "INVALID_USERNAME");
  return s;
}
async function hashPassword(v) {
  if (typeof v !== "string" || v.length < 10 || v.length > 128)
    throw fail(400, "PASSWORD_LENGTH");
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + (await scrypt(v, salt, 64)).toString("hex");
}
async function verify(v, hash) {
  if (typeof v !== "string" || v.length > 128) return false;
  const [salt, expected] = hash.split(":");
  const actual = await scrypt(v, salt, 64);
  return (
    actual.length === Buffer.from(expected, "hex").length &&
    timingSafeEqual(actual, Buffer.from(expected, "hex"))
  );
}
function publicFarmer(u) {
  const { passwordHash, _id, ...safe } = u;
  return safe;
}
function cookie(req) {
  const s = (req.headers.cookie || "")
    .split(";")
    .find((s) => s.trim().startsWith("agro_session="));
  return s ? s.trim().slice(13) : "";
}
function setCookie(res, token, expires) {
  res.cookie("agro_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}
async function session(req) {
  const token = cookie(req);
  if (!token) return null;
  const s = await (
    await db.collection("sessions")
  ).findOne({ tokenHash: tokenHash(token), expiresAt: { $gt: new Date() } });
  if (!s) return null;
  const u = await (await db.collection("farmers")).findOne({ id: s.ownerId });
  return u ? { ...s, user: publicFarmer(u) } : null;
}
async function requireAuth(req, res, next) {
  try {
    req.session = await session(req);
    if (!req.session) throw fail(401, "SIGN_IN_REQUIRED");
    next();
  } catch (e) {
    next(e);
  }
}
async function createSession(req, res, u) {
  const token = randomBytes(32).toString("hex"),
    csrf = randomBytes(24).toString("hex"),
    expiresAt = new Date(Date.now() + 7 * 86400000);
  await (
    await db.collection("sessions")
  ).insertOne({ tokenHash: tokenHash(token), ownerId: u.id, csrf, expiresAt });
  setCookie(res, token, expiresAt);
  return { user: publicFarmer(u), csrf };
}
async function throttle(req, name) {
  const c = await db.collection("throttles"),
    id = tokenHash(`${req.ip}:${name}`),
    now = new Date(),
    expires = new Date(Date.now() + 15 * 60000);
  const pipeline = [
    {
      $set: {
        count: {
          $cond: [
            { $gt: ["$expiresAt", now] },
            { $add: [{ $ifNull: ["$count", 0] }, 1] },
            1,
          ],
        },
        expiresAt: {
          $cond: [{ $gt: ["$expiresAt", now] }, "$expiresAt", expires],
        },
      },
    },
  ];
  let row;
  try {
    row = await c.findOneAndUpdate({ _id: id }, pipeline, {
      upsert: true,
      returnDocument: "after",
    });
  } catch (e) {
    if (e.code !== 11000) throw e;
    row = await c.findOneAndUpdate({ _id: id }, pipeline, {
      returnDocument: "after",
    });
  }
  if (row.count > 10) throw fail(429, "TOO_MANY_ATTEMPTS");
}
async function csrf(req, res, next) {
  try {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origin = req.get("origin"),
      allowed = process.env.APP_ORIGIN;
    if (!allowed) throw fail(503, "CONFIGURATION_REQUIRED");
    if (origin !== allowed || req.get("X-Requested-With") !== "AgroChrono")
      throw fail(403, "REQUEST_ORIGIN_REJECTED");
    if (req.session && req.get("X-CSRF-Token") !== req.session.csrf)
      throw fail(403, "CSRF_REJECTED");
    next();
  } catch (e) {
    next(e);
  }
}
module.exports = {
  fail,
  username,
  hashPassword,
  verify,
  publicFarmer,
  session,
  requireAuth,
  createSession,
  throttle,
  csrf,
  randomUUID,
  tokenHash,
  setCookie,
};
