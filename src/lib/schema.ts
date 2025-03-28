import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";

// Organization table
export const organizations = pgTable(
  "organizations",
  {
    siret: text("siret").primaryKey(),
    siren: text("siren").notNull(),
    name: text("name").notNull(),
    name_unaccent: text("name_unaccent").notNull(),
    slug: text("slug").notNull().unique(),
    insee_geo: text("insee_geo").notNull(),
    zipcode: text("zipcode").notNull(),
    population: integer("population").notNull(),
    website_url: text("website_url"),
    website_domain: text("website_domain"),
    website_tld: text("website_tld"),
    website_compliant: boolean("website_compliant"),
    domain_ownership: integer("domain_ownership"),
    email_official: text("email_official"),
    email_domain: text("email_domain"),
    email_compliant: boolean("email_compliant"),
    epci_name: text("epci_name"),
    epci_siren: text("epci_siren"),
    epci_population: integer("epci_population"),
    active_in_regie: boolean("active_in_regie").notNull().default(false),
    url_service_public: text("url_service_public"),
  },
  (table) => [
    index("organizations_name_search_index").using(
      "gin",
      sql`to_tsvector('french', ${table.name_unaccent})`,
    ),
  ],
);

// MutualizationStructure table
export const mutualizationStructures = pgTable(
  "mutualization_structures",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    name_unaccent: text("name_unaccent").notNull(),
    shortname: text("shortname"),
    type: text("type").notNull(),
    website: text("website"),
  },
  (table) => [
    index("mutualizationstructures_name_search_index").using(
      "gin",
      sql`to_tsvector('french', ${table.name_unaccent})`,
    ),
  ],
);

// Organization to MutualizationStructure many-to-many relation table
export const organizationsToStructures = pgTable(
  "organizations_to_structures",
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
