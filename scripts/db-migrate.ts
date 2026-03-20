import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";

async function migrate() {
  try {
    console.log("Migrating...");

    // Perform migrations sequentially here

    await db.execute(sql`
      ALTER TABLE data_checks ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';
    `);

    // Rename structures tables/columns to operators (must run before adding new columns)
    await db.execute(sql`
      ALTER TABLE IF EXISTS st_mutualization_structures RENAME TO st_operators;
    `);
    await db.execute(sql`
      ALTER TABLE IF EXISTS st_organizations_to_structures RENAME TO st_organizations_to_operators;
    `);
    await db.execute(sql`
      ALTER TABLE IF EXISTS st_services_to_structures RENAME TO st_services_to_operators;
    `);
    await db.execute(sql`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'st_organizations_to_operators' AND column_name = 'structure_id') THEN
          ALTER TABLE st_organizations_to_operators RENAME COLUMN structure_id TO operator_id;
        END IF;
      END $$;
    `);
    await db.execute(sql`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'st_services_to_operators' AND column_name = 'structure_id') THEN
          ALTER TABLE st_services_to_operators RENAME COLUMN structure_id TO operator_id;
        END IF;
      END $$;
    `);

    // Add is_perimetre and is_adherent columns to organizations_to_operators
    await db.execute(sql`
      ALTER TABLE st_organizations_to_operators ADD COLUMN IF NOT EXISTS is_perimetre BOOLEAN NOT NULL DEFAULT false;
    `);
    await db.execute(sql`
      ALTER TABLE st_organizations_to_operators ADD COLUMN IF NOT EXISTS is_adherent BOOLEAN NOT NULL DEFAULT false;
    `);

    // Add siret column to operators
    await db.execute(sql`
      ALTER TABLE st_operators ADD COLUMN IF NOT EXISTS siret TEXT;
    `);

    // Add type, instance_name, and description columns to services
    await db.execute(sql`
      ALTER TABLE st_services ADD COLUMN IF NOT EXISTS type TEXT;
    `);
    await db.execute(sql`
      ALTER TABLE st_services ADD COLUMN IF NOT EXISTS instance_name TEXT;
    `);
    await db.execute(sql`
      ALTER TABLE st_services ADD COLUMN IF NOT EXISTS description TEXT;
    `);

    // Add epci_siret and dep_siret columns to organizations
    await db.execute(sql`
      ALTER TABLE st_organizations ADD COLUMN IF NOT EXISTS epci_siret TEXT;
    `);
    await db.execute(sql`
      ALTER TABLE st_organizations ADD COLUMN IF NOT EXISTS dep_siret TEXT;
    `);
    await db.execute(sql`
      ALTER TABLE st_organizations ADD COLUMN IF NOT EXISTS region_siret TEXT;
    `);

    console.log("Migration successful.");
    process.exit(0);
  } catch (error) {
    console.error("Error migrating:", error);
    process.exit(1);
  }
}

migrate();
