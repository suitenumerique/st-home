import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";

async function checkDatabase() {
  try {
    console.log("Checking database connection...");

    // Simple query to test the connection
    const result = await db.execute(sql`SELECT 1 as test`);

    if (result.rows && result.rows.length > 0) {
      console.log("✓ Database connection successful.");
      process.exit(0);
    } else {
      console.error("✗ Database connection failed: No result returned.");
      process.exit(1);
    }
  } catch (error) {
    console.error("✗ Database connection failed:", error);
    process.exit(1);
  }
}

checkDatabase();
