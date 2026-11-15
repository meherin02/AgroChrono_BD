const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  http = require("node:http"),
  { pathToFileURL } = require("node:url"),
  path = require("node:path");
test("browser transport bounds body reads, reports timeouts, and returns JSON/blob responses", async () => {
  const { readHttp } = await import(
    pathToFileURL(
      path.resolve(__dirname, "../../frontend/src/utils/request.js"),
    )
  );
  const server = http.createServer((req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.url === "/hang") {
      res.write("{");
      return;
    }
    res.end(JSON.stringify({ ok: true }));
  });
  server.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  try {
    assert.equal((await readHttp(base)).data.ok, true);
    await assert.rejects(
      readHttp(base + "/hang", {}, { timeoutMs: 50 }),
      (e) => e.code === "REQUEST_TIMEOUT",
    );
    assert.equal(
      await (await readHttp(base, {}, { format: "blob" })).data.text(),
      '{"ok":true}',
    );
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
