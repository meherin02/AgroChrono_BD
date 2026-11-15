require("dotenv").config();
const express = require("express"),
  app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  res.set("X-Content-Type-Options", "nosniff");
  res.set("X-Frame-Options", "DENY");
  res.set("Referrer-Policy", "same-origin");
  next();
});
app.use(express.json({ limit: "32kb" }));
app.use("/api", require("./routes/api"));
app.use("/api", (req, res) => res.status(404).json({ error: "NOT_FOUND" }));
app.use((err, req, res, next) => {
  const status = err.status || 503;
  res.status(status).json({
    success: false,
    error:
      err.code || (status === 400 ? "INVALID_JSON" : "SERVICE_UNAVAILABLE"),
    details: err.details || undefined,
  });
});
module.exports = app;
