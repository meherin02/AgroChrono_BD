const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  { randomUUID } = require("node:crypto"),
  { execFile } = require("node:child_process"),
  { promisify } = require("node:util"),
  fs = require("fs"),
  path = require("path");
const run = promisify(execFile),
  root = path.resolve(__dirname, "../.."),
  suffix = randomUUID().replaceAll("-", ""),
  name = "agrochrono_ops_" + suffix,
  restoreName = "agrochrono_restore_" + suffix;
process.env.MONGODB_URI =
  process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27029";
process.env.MONGODB_DB_NAME = name;
const db = require("../src/config/db");
test("real isolated EJSON backup/restore, refusal of existing targets, reconnect durability", async () => {
  const file = path.join(root, ".local/evidence", `rehearsal-${suffix}.json`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  try {
    const d = await db.connectDB();
    await d.collection("farmers").insertOne({
      id: "fixture-farmer",
      username: "backup_fixture",
      passwordHash: "fixture-only-not-a-credential",
      createdAt: new Date("2026-01-01"),
    });
    await d.collection("results").insertOne({
      id: "fixture-result",
      ownerId: "fixture-farmer",
      submission: { crop: "Rice" },
      activities: [{ id: "planting", complete: true }],
      parentId: "fixture-parent",
    });
    await db.close();
    const reconnected = await db.connectDB();
    assert.equal(
      (
        await reconnected
          .collection("results")
          .findOne({ id: "fixture-result" })
      ).activities[0].complete,
      true,
    );
    const env = { ...process.env };
    await run(process.execPath, ["scripts/maintenance.cjs", "backup", file], {
      cwd: root,
      env,
    });
    await assert.rejects(
      run(process.execPath, ["scripts/maintenance.cjs", "backup", file], {
        cwd: root,
        env,
      }),
    );
    await run(
      process.execPath,
      ["scripts/maintenance.cjs", "restore", file, restoreName],
      { cwd: root, env },
    );
    const restored = reconnected.client.db(restoreName);
    assert.equal(
      await restored
        .collection("results")
        .countDocuments({ ownerId: "fixture-farmer" }),
      1,
    );
    assert.ok(
      (await restored.collection("farmers").findOne({ id: "fixture-farmer" }))
        .createdAt instanceof Date,
    );
    await assert.rejects(
      run(
        process.execPath,
        ["scripts/maintenance.cjs", "restore", file, restoreName],
        { cwd: root, env },
      ),
    );
    await assert.rejects(
      run(
        process.execPath,
        ["scripts/maintenance.cjs", "restore", file, name],
        { cwd: root, env },
      ),
    );
    console.log(
      "Actual Mongo reconnect and isolated backup/restore rehearsal passed; sessions excluded.",
    );
  } finally {
    const d = await db.connectDB();
    await d.client.db(restoreName).dropDatabase();
    await d.dropDatabase();
    await db.close();
  }
});
