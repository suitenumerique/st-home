import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";

async function migrate() {
  try {
    console.log("Migrating...");

    // Perform migrations sequentially here

    await db.execute(sql`
      ALTER TABLE data_checks ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';
    `);

    console.log("Migration successful.");
    process.exit(0);
  } catch (error) {
    console.error("Error migrating:", error);
    process.exit(1);
  }
}

migrate();
