import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";

async function dropAllTables() {
  try {
    console.log("Dropping all tables...");

    // Drop all tables in the correct order (respecting foreign key constraints)
    await db.execute(sql`
      DROP TABLE IF EXISTS st_organizations_to_structures CASCADE;
      DROP TABLE IF EXISTS st_mutualization_structures CASCADE;
      DROP TABLE IF EXISTS st_organizations CASCADE;
      DROP TABLE IF EXISTS st_services CASCADE;
      DROP TABLE IF EXISTS st_organizations_to_services CASCADE;
    `);

    console.log("All tables dropped successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error dropping tables:", error);
    process.exit(1);
  }
}

dropAllTables();
