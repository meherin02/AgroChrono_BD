require("dotenv").config({ path: "backend/.env" });
const { MongoClient } = require("mongodb");
(async () => {
  if (!process.env.MONGODB_URI) throw Error("MONGODB_URI required");
  const c = await new MongoClient(process.env.MONGODB_URI).connect();
  try {
    const d = c.db(process.env.MONGODB_DB_NAME || "agrochrono");
    for (const name of ["analysisresults", "submissions"]) {
      const records = await d
        .collection(name)
        .find({ ownerId: { $exists: false } })
        .toArray();
      for (const r of records)
        await d
          .collection("legacy_archive_" + name)
          .updateOne(
            { _id: r._id },
            { $setOnInsert: { ...r, archivedAt: new Date() } },
            { upsert: true },
          );
      console.log(
        name,
        records.length,
        "ownerless records archived, never exposed by farmer routes. Original collection retained.",
      );
    }
  } finally {
    await c.close();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
