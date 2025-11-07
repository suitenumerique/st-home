import fs from "fs";
import path from "path";
import { pool } from "../src/lib/db";
import { unaccent } from "../src/lib/string";

interface Organization {
  type: string;
  insee_com: string;
  zipcode: string;
  email_official: string;
  structures: number[];
  website_url: string | null;
  phone: string | null;
  issues: string[];
  rcpnt: string[];
  issues_last_checked: string;
  website_domain: string | null;
  email_domain: string | null;
  website_metadata: Record<string, any> | null;
  email_metadata: Record<string, any> | null;
  website_tld: string | null;
  email_tld: string | null;
  epci_name: string;
  epci_siren: string;
  epci_population: number;
  service_public_url: string;
  service_public_id: string;
  name: string;
  slug: string;
  siren: string;
  siret: string;
  population: number;
  insee_dep: string | null;
  insee_reg: string | null;
  st_eligible: boolean;
  st_active: boolean;
}

interface Structure {
  id: number;
  Nom: string;
  Sigle: string;
  Nom_sigle: string;
  Typologie: string;
  Statut_juridique: string;
  Site_web: string;
}

interface Service {
  id: string;
  nom: string;
  url: string;
  logo_url: string;
  maturite: string;
  date_lancement: string;
}

interface ServiceUsage {
  organization_siret: string;
  service_id: string;
  active: boolean;
}

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Successfully connected to database");
    client.release();
    return true;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return false;
  }
}

async function importOrganizations(dumpsDir: string) {
  let client;
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      console.error("Database connection failed. Please check your DATABASE_URL and try again.");
      process.exit(1);
    }

    const communesPath = path.join(dumpsDir, "organizations.json");
    const structuresPath = path.join(dumpsDir, "structures.json");
    const servicesPath = path.join(dumpsDir, "services.json");
    const serviceUsagesPath = path.join(dumpsDir, "service_usages.json");

    // Verify all required files exist
    for (const filePath of [communesPath, structuresPath]) {
      if (!fs.existsSync(filePath)) {
        console.error(`Required file not found: ${filePath}`);
        process.exit(1);
      }
    }

    console.log(`Reading communes data from ${communesPath}...`);
    const communesData = fs.readFileSync(communesPath, "utf8");
    const communes: Organization[] = JSON.parse(communesData);

    console.log(`Found ${communes.length} organizations to import.`);

    console.log(`Reading structures from ${structuresPath}...`);
    const structuresData = fs.readFileSync(structuresPath, "utf8");
    const structuresList: Structure[] = JSON.parse(structuresData);

    // Filter out structures that are not mutualization structures
    const mutualizationStructures = structuresList.filter(
      (structure) =>
        structure.Typologie &&
        (structure.Typologie.indexOf("OPSN") !== -1 ||
          structure.Typologie.indexOf("Centre de gestion") !== -1),
    );

    client = await pool.connect();

    // Prepare bulk insert data
    const structureValues = mutualizationStructures.map((structure) => ({
      id: String(structure.id),
      name: structure.Nom,
      name_unaccent: unaccent(structure.Nom),
      shortname: structure.Sigle,
      type: structure.Typologie,
      website: structure.Site_web || null,
    }));

    // Keep track of valid organizations and structures
    const validStructureIds = new Set(mutualizationStructures.map((s) => String(s.id)));
    const organizationSirets = new Set();

    const organizationValues = communes
      .filter((commune) => {
        if (!commune.siret) {
          console.log(`Skipping org without SIRET: ${commune.name}`);
          return false;
        }
        organizationSirets.add(commune.siret);
        return true;
      })
      .map((commune) => ({
        siret: commune.siret,
        siren: commune.siren,
        type: commune.type,
        name: commune.name,
        name_unaccent: unaccent(commune.name),
        slug: commune.slug,
        insee_geo: commune.insee_com,
        insee_dep: commune.insee_dep || null,
        insee_reg: commune.insee_reg || null,
        zipcode: commune.zipcode,
        phone: commune.phone || null,
        population: commune.population,
        website_url: commune.website_url || null,
        website_domain: commune.website_domain || null,
        website_tld: commune.website_tld || null,
        website_metadata: commune.website_metadata || null,
        email_metadata: commune.email_metadata || null,
        issues: commune.issues,
        issues_last_checked: commune.issues_last_checked
          ? new Date(commune.issues_last_checked)
          : null,
        rcpnt: commune.rcpnt || [],
        email_official: commune.email_official || null,
        email_domain: commune.email_domain || null,
        email_tld: commune.email_tld || null,
        epci_name: commune.epci_name || null,
        epci_siren: commune.epci_siren || null,
        epci_population: commune.epci_population || null,
        st_eligible: commune.st_eligible || false,
        st_active: commune.st_active || false,
        service_public_url: commune.service_public_url,
        service_public_id: commune.service_public_id || null,
      }));

    // Fill structure relations for communes only
    const structureRelations: {
      organization_siret: string;
      structure_id: string;
    }[] = [];
    organizationValues.forEach((commune) => {
      const originalCommune = communes.find((c) => c.siret === commune.siret);
      if (originalCommune?.structures && originalCommune.structures.length > 0) {
        originalCommune.structures.forEach((structureId) => {
          if (validStructureIds.has(String(structureId))) {
            structureRelations.push({
              organization_siret: commune.siret,
              structure_id: String(structureId),
            });
          }
        });
      }
    });

    console.log(`Reading services from ${servicesPath}...`);
    const servicesData = fs.readFileSync(servicesPath, "utf8");

    // Prepare services
    const services: Service[] = JSON.parse(servicesData).map((service) => ({
      id: parseInt(service.id, 10),
      name: service.nom,
      url: service.url,
      logo_url: service.logo_url || null,
      maturity: service.maturite,
      launch_date: service.date_lancement ? new Date(service.date_lancement) : null,
    }));

    console.log(`Reading service usages from ${serviceUsagesPath}...`);
    const serviceUsagesData = fs.readFileSync(serviceUsagesPath, "utf8");

    // Prepare service usages
    const serviceUsage: ServiceUsage[] = JSON.parse(serviceUsagesData)
      .map((row) => ({
        organization_siret: row.siret,
        service_id: parseInt(row.service, 10),
        active: row.active === "1",
      }))
      .filter(
        (serviceUsage) =>
          serviceUsage.organization_siret &&
          organizationSirets.has(serviceUsage.organization_siret),
      );

    console.log(`Found ${serviceUsage.length} service usages to import.`);

    console.log(`Starting DB transaction...`);

    // Start transaction and replace all data
    await client.query("BEGIN");

    // Clear existing data
    await client.query("TRUNCATE TABLE st_organizations_to_structures");
    await client.query("TRUNCATE TABLE st_organizations CASCADE");
    await client.query("TRUNCATE TABLE st_mutualization_structures CASCADE");
    await client.query("TRUNCATE TABLE st_services CASCADE");
    await client.query("TRUNCATE TABLE st_organizations_to_services CASCADE");

    // Bulk insert structures
    console.log(`Bulk inserting ${structureValues.length} structures...`);
    const structureQuery = `
      INSERT INTO st_mutualization_structures
      SELECT * FROM json_populate_recordset(null::st_mutualization_structures, $1)
    `;
    await client.query(structureQuery, [JSON.stringify(structureValues)]);

    // Bulk insert organizations
    console.log(`Bulk inserting ${organizationValues.length} organizations...`);
    const orgQuery = `
      INSERT INTO st_organizations
      SELECT * FROM json_populate_recordset(null::st_organizations, $1)
    `;
    await client.query(orgQuery, [JSON.stringify(organizationValues)]);

    // Bulk insert relations
    if (structureRelations.length > 0) {
      console.log(`Bulk inserting ${structureRelations.length} structure relations...`);
      const relationsQuery = `
        INSERT INTO st_organizations_to_structures (organization_siret, structure_id)
        SELECT * FROM json_populate_recordset(null::st_organizations_to_structures, $1)
      `;
      await client.query(relationsQuery, [JSON.stringify(structureRelations)]);
    }

    // Bulk insert services
    console.log(`Bulk inserting ${services.length} services...`);
    const servicesQuery = `
      INSERT INTO st_services
      SELECT * FROM json_populate_recordset(null::st_services, $1)
    `;
    await client.query(servicesQuery, [JSON.stringify(services)]);

    // Bulk insert service usage
    console.log(`Bulk inserting ${serviceUsage.length} service usage...`);
    const serviceUsageQuery = `
      INSERT INTO st_organizations_to_services
      SELECT * FROM json_populate_recordset(null::st_organizations_to_services, $1)
    `;
    await client.query(serviceUsageQuery, [JSON.stringify(serviceUsage)]);

    await client.query("COMMIT");

    console.log(
      `Successfully imported ${organizationValues.length} organizations and ${structureValues.length} structures.`,
    );
  } catch (error) {
    console.error("Error importing organizations:", error);
    if (client) {
      await client.query("ROLLBACK");
    }
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
  }
  process.exit(0);
}

// Add cleanup handler
process.on("SIGINT", async () => {
  console.log("Closing database pool...");
  await pool.end();
  process.exit();
});

// Update the main execution
const dumpsDir = process.argv[2];

if (!dumpsDir) {
  console.error("Please provide the dumps directory path as an argument.");
  process.exit(1);
}

const resolvedDumpsDir = path.resolve(process.cwd(), dumpsDir);

if (!fs.existsSync(resolvedDumpsDir)) {
  console.error(`Directory not found: ${resolvedDumpsDir}`);
  process.exit(1);
}

importOrganizations(resolvedDumpsDir);
