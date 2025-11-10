import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
  tablesFilter: ["st_organizations", "st_services", "st_organizations_to_structures", "st_organizations_to_services", "st_mutualization_structures"],
  verbose: true,
  strict: true,
} satisfies Config;
