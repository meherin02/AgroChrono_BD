// Local maintenance only. Never exposes a browser admin endpoint.
require("dotenv").config({ path: "backend/.env" });
const { MongoClient } = require("mongodb"),
  { EJSON } = require("bson"),
  fs = require("fs");
const collections = [
  "farmers",
  "plots",
  "results",
  "notifications",
  "requests",
  "weathercache",
];
async function main() {
  const [operation, file, target] = process.argv.slice(2);
  if (!["backup", "restore"].includes(operation) || !file)
    throw Error(
      "Usage: maintenance.cjs backup FILE | restore FILE NEW_EMPTY_DB",
    );
  if (!process.env.MONGODB_URI) throw Error("MONGODB_URI required");
  const c = await new MongoClient(process.env.MONGODB_URI).connect();
  try {
    if (operation === "backup") {
      const db = c.db(process.env.MONGODB_DB_NAME || "agrochrono"),
        data = { version: 1, createdAt: new Date(), collections: {} };
      for (const name of collections)
        data.collections[name] = await db.collection(name).find().toArray();
      fs.writeFileSync(file, EJSON.stringify(data, null, 2), {
        flag: "wx",
        mode: 0o600,
      });
      console.log(
        "Backup written; contains private farmer data. Keep it outside source control. Sessions excluded.",
      );
    } else {
      if (
        !target ||
        !/^[\w-]+$/.test(target) ||
        target === (process.env.MONGODB_DB_NAME || "agrochrono")
      )
        throw Error("Restore requires a different new database name");
      const d = c.db(target);
      if ((await d.listCollections().toArray()).length)
        throw Error("Restore target must be empty");
      const data = EJSON.parse(fs.readFileSync(file, "utf8"));
      if (data.version !== 1) throw Error("Unsupported backup version");
      for (const name of collections)
        if (data.collections[name]?.length)
          await d.collection(name).insertMany(data.collections[name]);
      console.log(
        "Restored to isolated empty database; indexes rebuild when app connects. Sessions require sign-in again.",
      );
    }
  } finally {
    await c.close();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
