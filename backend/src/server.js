const app = require("./app");
const port = process.env.PORT || 5000;
app.listen(port, process.env.HOST || "127.0.0.1", () =>
  console.log(`AgroChrono API listening on ${port}`),
);
