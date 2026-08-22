/* eslint-disable no-console */
// One-off migration: converts the old `favorites: ObjectId[]` field into the new
// `library: [{ book, status: "want" }]` shape. Safe to run more than once — users
// that no longer have a `favorites` field are skipped.
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import dbConnect from "../lib/dbConnect";

async function migrate() {
  await dbConnect();
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database connection.");

  const users = db.collection("users");
  const cursor = users.find({ favorites: { $exists: true } });

  let migrated = 0;
  for await (const user of cursor) {
    const favorites: mongoose.Types.ObjectId[] = user.favorites ?? [];
    const library = favorites.map((book) => ({ book, status: "want" }));

    await users.updateOne(
      { _id: user._id },
      { $set: { library }, $unset: { favorites: "" } }
    );
    migrated += 1;
    console.log(`Migrated user ${user.email ?? user._id}: ${library.length} favorite(s) -> library.`);
  }

  console.log(`Done. ${migrated} user(s) migrated.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
