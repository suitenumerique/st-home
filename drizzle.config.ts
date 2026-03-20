import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
  tablesFilter: [
    "st_organizations",
    "st_services",
    "st_organizations_to_operators",
    "st_organizations_to_services",
    "st_operators",
    "st_services_to_operators",
  ],
  verbose: true,
  strict: true,
} satisfies Config;
