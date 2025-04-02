import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Organization table
export const organizations = pgTable(
  "st_organizations",
  {
    siret: text("siret").primaryKey(),
    siren: text("siren").notNull(),
    type: text("type").notNull(), // "commune" or "epci"
    name: text("name").notNull(),
    name_unaccent: text("name_unaccent").notNull(),
    slug: text("slug").notNull().unique(),
    insee_geo: text("insee_geo"),
    insee_dep: text("insee_dep"),
    insee_reg: text("insee_reg"),
    zipcode: text("zipcode"),
    population: integer("population").notNull(),
    website_url: text("website_url"),
    website_domain: text("website_domain"),
    website_tld: text("website_tld"),
    issues: text("issues").array(),
    issues_last_checked: timestamp("issues_last_checked"),
    rcpnt: text("rcpnt").array(),
    email_official: text("email_official"),
    email_domain: text("email_domain"),
    email_tld: text("email_tld"),
    epci_name: text("epci_name"),
    epci_siren: text("epci_siren"),
    epci_population: integer("epci_population"),
    st_eligible: boolean("st_eligible").notNull().default(false),
    st_active: boolean("st_active").notNull().default(false),
    service_public_url: text("service_public_url"),
    service_public_id: text("service_public_id"),
  },
  (table) => [
    index("st_organizations_name_search_index").using(
      "gin",
      sql`to_tsvector('french', ${table.name_unaccent})`,
    ),
    index("st_organizations_insee_dep").using("btree", table.insee_dep),
    index("st_organizations_insee_reg").using("btree", table.insee_reg),
    index("st_organizations_siren").using("btree", table.siren),
    index("st_organizations_zipcode").using("btree", table.zipcode),
    index("st_organizations_name_unaccent").using("btree", table.name_unaccent),
    index("st_organizations_slug_index").using("btree", table.slug),
  ],
);

// MutualizationStructure table
export const mutualizationStructures = pgTable(
  "st_mutualization_structures",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    name_unaccent: text("name_unaccent").notNull(),
    shortname: text("shortname"),
    type: text("type").notNull(),
    website: text("website"),
  },
  (table) => [
    index("st_mutualizationstructures_name_search_index").using(
      "gin",
      sql`to_tsvector('french', ${table.name_unaccent})`,
    ),
  ],
);

// Organization to MutualizationStructure many-to-many relation table
export const organizationsToStructures = pgTable(
  "st_organizations_to_structures",
  {
    organizationSiret: text("organization_siret")
      .notNull()
      .references(() => organizations.siret, { onDelete: "cascade" }),
    structureId: text("structure_id")
      .notNull()
      .references(() => mutualizationStructures.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.organizationSiret, table.structureId] }),
    };
  },
);

// Organization relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  structures: many(organizationsToStructures),
}));

// MutualizationStructure relations
export const mutualizationStructuresRelations = relations(
  mutualizationStructures,
  ({ many }) => ({
    organizations: many(organizationsToStructures),
  }),
);

// OrganizationsToStructures relations
export const organizationsToStructuresRelations = relations(
  organizationsToStructures,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationsToStructures.organizationSiret],
      references: [organizations.siret],
    }),
    structure: one(mutualizationStructures, {
      fields: [organizationsToStructures.structureId],
      references: [mutualizationStructures.id],
    }),
  }),
);
