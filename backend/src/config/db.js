const mongoose = require("mongoose");
let pending;
async function connectDB() {
  if (!process.env.MONGODB_URI)
    throw Object.assign(new Error("Database configuration missing"), {
      status: 503,
      code: "DATABASE_UNAVAILABLE",
    });
  if (mongoose.connection.readyState === 1) return mongoose.connection.db;
  if (!pending)
    pending = mongoose
      .connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || "agrochrono",
        serverSelectionTimeoutMS: 3000,
        maxPoolSize: 5,
        bufferCommands: false,
      })
      .then(async () => {
        const d = mongoose.connection.db;
        await Promise.all([
          d
            .collection("farmers")
            .createIndex({ username: 1 }, { unique: true }),
          d
            .collection("sessions")
            .createIndex({ tokenHash: 1 }, { unique: true }),
          d
            .collection("sessions")
            .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
          d.collection("results").createIndex({ ownerId: 1, createdAt: -1 }),
          d.collection("results").createIndex({ id: 1 }, { unique: true }),
          d
            .collection("requests")
            .createIndex({ ownerId: 1, key: 1 }, { unique: true }),
          d
            .collection("notifications")
            .createIndex({ ownerId: 1, key: 1 }, { unique: true }),
          d
            .collection("throttles")
            .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
          d
            .collection("weathercache")
            .createIndex({ key: 1 }, { unique: true }),
        ]);
        return d;
      })
      .catch(() => {
        throw Object.assign(new Error("Database unavailable"), {
          status: 503,
          code: "DATABASE_UNAVAILABLE",
        });
      })
      .finally(() => {
        pending = null;
      });
  return pending;
}
async function collection(name) {
  return (await connectDB()).collection(name);
}
async function close() {
  await mongoose.disconnect();
}
module.exports = {
  connectDB,
  collection,
  close,
  getDatabaseStatus: () => ({
    connected: mongoose.connection.readyState === 1,
    provider: "MongoDB",
  }),
};
