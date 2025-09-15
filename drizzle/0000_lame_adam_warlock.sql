CREATE TABLE "st_mutualization_structures" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_unaccent" text NOT NULL,
	"shortname" text,
	"type" text NOT NULL,
	"website" text
);
--> statement-breakpoint
CREATE TABLE "st_organizations" (
	"siret" text PRIMARY KEY NOT NULL,
	"siren" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"name_unaccent" text NOT NULL,
	"slug" text NOT NULL,
	"insee_geo" text,
	"insee_dep" text,
	"insee_reg" text,
	"zipcode" text,
	"phone" text,
	"population" integer NOT NULL,
	"website_url" text,
	"website_domain" text,
	"website_tld" text,
	"website_metadata" jsonb,
	"issues" text[],
	"issues_last_checked" timestamp,
	"rcpnt" text[],
	"email_official" text,
	"email_domain" text,
	"email_tld" text,
	"email_metadata" jsonb,
	"epci_name" text,
	"epci_siren" text,
	"epci_population" integer,
	"st_eligible" boolean DEFAULT false NOT NULL,
	"st_active" boolean DEFAULT false NOT NULL,
	"service_public_url" text,
	"service_public_id" text,
	CONSTRAINT "st_organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "st_organizations_to_services" (
	"organization_siret" text NOT NULL,
	"service_id" text NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	CONSTRAINT "st_organizations_to_services_organization_siret_service_id_pk" PRIMARY KEY("organization_siret","service_id")
);
--> statement-breakpoint
CREATE TABLE "st_organizations_to_structures" (
	"organization_siret" text NOT NULL,
	"structure_id" text NOT NULL,
	CONSTRAINT "st_organizations_to_structures_organization_siret_structure_id_pk" PRIMARY KEY("organization_siret","structure_id")
);
--> statement-breakpoint
CREATE TABLE "st_services" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"logo_url" text,
	"maturity" text NOT NULL,
	"launch_date" date
);
--> statement-breakpoint
ALTER TABLE "st_organizations_to_services" ADD CONSTRAINT "st_organizations_to_services_organization_siret_st_organizations_siret_fk" FOREIGN KEY ("organization_siret") REFERENCES "public"."st_organizations"("siret") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "st_organizations_to_services" ADD CONSTRAINT "st_organizations_to_services_service_id_st_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."st_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "st_organizations_to_structures" ADD CONSTRAINT "st_organizations_to_structures_organization_siret_st_organizations_siret_fk" FOREIGN KEY ("organization_siret") REFERENCES "public"."st_organizations"("siret") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "st_organizations_to_structures" ADD CONSTRAINT "st_organizations_to_structures_structure_id_st_mutualization_structures_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."st_mutualization_structures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "st_mutualizationstructures_name_search_index" ON "st_mutualization_structures" USING gin (to_tsvector('french', "name_unaccent"));--> statement-breakpoint
CREATE INDEX "st_organizations_name_search_index" ON "st_organizations" USING gin (to_tsvector('french', "name_unaccent"));--> statement-breakpoint
CREATE INDEX "st_organizations_insee_dep" ON "st_organizations" USING btree ("insee_dep");--> statement-breakpoint
CREATE INDEX "st_organizations_insee_reg" ON "st_organizations" USING btree ("insee_reg");--> statement-breakpoint
CREATE INDEX "st_organizations_siren" ON "st_organizations" USING btree ("siren");--> statement-breakpoint
CREATE INDEX "st_organizations_zipcode" ON "st_organizations" USING btree ("zipcode");--> statement-breakpoint
CREATE INDEX "st_organizations_name_unaccent" ON "st_organizations" USING btree ("name_unaccent");--> statement-breakpoint
CREATE INDEX "st_organizations_slug_index" ON "st_organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "st_services_url_index" ON "st_services" USING btree ("url");