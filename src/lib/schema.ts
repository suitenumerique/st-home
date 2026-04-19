import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
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
    phone: text("phone"),
    population: integer("population").notNull(),
    website_url: text("website_url"),
    website_domain: text("website_domain"),
    website_tld: text("website_tld"),
    website_metadata: jsonb("website_metadata").$type<Record<string, string>>(),
    issues: text("issues").array(),
    issues_last_checked: timestamp("issues_last_checked"),
    rcpnt: text("rcpnt").array(),
    email_official: text("email_official"),
    email_domain: text("email_domain"),
    email_tld: text("email_tld"),
    email_metadata: jsonb("email_metadata").$type<Record<string, string>>(),
    epci_name: text("epci_name"),
    epci_siren: text("epci_siren"),
    epci_siret: text("epci_siret"),
    epci_population: integer("epci_population"),
    dep_siret: text("dep_siret"),
    region_siret: text("region_siret"),
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

// Operators table
export const operators = pgTable(
  "st_operators",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    name_unaccent: text("name_unaccent").notNull(),
    shortname: text("shortname"),
    name_with_article: text("name_with_article"),
    status: text("status"),
    type: text("type").notNull(),
    website: text("website"),
    siret: text("siret"),
    departments: text("departments").array(),
  },
  (table) => [
    index("st_operators_name_search_index").using(
      "gin",
      sql`to_tsvector('french', ${table.name_unaccent})`,
    ),
  ],
);

// Organization to Operator many-to-many relation table
export const organizationsToOperators = pgTable(
  "st_organizations_to_operators",
  {
    organizationSiret: text("organization_siret")
      .notNull()
      .references(() => organizations.siret, { onDelete: "cascade" }),
    operatorId: text("operator_id")
      .notNull()
      .references(() => operators.id, { onDelete: "cascade" }),
    isPerimetre: boolean("is_perimetre").notNull().default(false),
    isAdherent: boolean("is_adherent").notNull().default(false),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.organizationSiret, table.operatorId] }),
      operatorIdIdx: index("st_organizations_to_operators_operator_id_index").on(table.operatorId),
    };
  },
);

// Services table
export const services = pgTable(
  "st_services",
  {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    url: text("url").notNull(),
    type: text("type"),
    instance_name: text("instance_name"),
    logo_url: text("logo_url"),
    maturity: text("maturity").notNull(),
    launch_date: date("launch_date"),
    description: text("description"),
  },
  (table) => [index("st_services_url_index").using("btree", table.url)],
);

// Services to Operators many-to-many relation table
export const servicesToOperators = pgTable(
  "st_services_to_operators",
  {
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    operatorId: text("operator_id")
      .notNull()
      .references(() => operators.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.serviceId, table.operatorId] }),
    };
  },
);

// ServiceUsage
export const organizationsToServices = pgTable(
  "st_organizations_to_services",
  {
    organizationSiret: text("organization_siret")
      .notNull()
      .references(() => organizations.siret, { onDelete: "cascade" }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    active: boolean("active").notNull().default(false),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.organizationSiret, table.serviceId] }),
    };
  },
);

// Organization relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  operators: many(organizationsToOperators),
}));

// Operator relations
export const operatorsRelations = relations(operators, ({ many }) => ({
  organizations: many(organizationsToOperators),
  services: many(servicesToOperators),
}));

// OrganizationsToOperators relations
export const organizationsToOperatorsRelations = relations(organizationsToOperators, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationsToOperators.organizationSiret],
    references: [organizations.siret],
  }),
  operator: one(operators, {
    fields: [organizationsToOperators.operatorId],
    references: [operators.id],
  }),
}));

// ServiceUsage relations
export const organizationsToServicesRelations = relations(organizationsToServices, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationsToServices.organizationSiret],
    references: [organizations.siret],
  }),
  service: one(services, {
    fields: [organizationsToServices.serviceId],
    references: [services.id],
  }),
}));

// ServicesToOperators relations
export const servicesToOperatorsRelations = relations(servicesToOperators, ({ one }) => ({
  service: one(services, {
    fields: [servicesToOperators.serviceId],
    references: [services.id],
  }),
  operator: one(operators, {
    fields: [servicesToOperators.operatorId],
    references: [operators.id],
  }),
}));

// Update existing relations to include servicesToOperators
export const servicesRelations = relations(services, ({ many }) => ({
  operators: many(servicesToOperators),
}));

// Inferred types
export type Organization = InferSelectModel<typeof organizations>;
export type Operator = InferSelectModel<typeof operators>;
export type Service = InferSelectModel<typeof services>;

export type OperatorWithRole = Pick<
  Operator,
  "id" | "name" | "shortname" | "name_with_article" | "type" | "website" | "status"
> & {
  isPerimetre: boolean;
  isAdherent: boolean;
};

export type Commune = Organization & {
  operators?: OperatorWithRole[];
};
