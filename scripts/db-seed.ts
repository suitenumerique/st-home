import fs from "fs";
import path from "path";
import { pool } from "../src/lib/db";
import { unaccent } from "../src/lib/string";

interface OperatorLink {
  id: string;
  is_perimetre: boolean;
  is_adherent: boolean;
}

interface Organization {
  type: string;
  insee_com: string;
  zipcode: string;
  email_official: string;
  operators: OperatorLink[];
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
  epci_siret: string;
  epci_population: number;
  dep_siret: string;
  region_siret: string;
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

interface Operator {
  id: string;
  nom: string;
  nom_avec_article: string | null;
  statut: string | null;
  url: string;
  siret: string | null;
  services: number[];
  departements: string[];
}

interface Service {
  id: number;
  nom: string;
  url: string;
  type: string | null;
  nom_instance: string | null;
  logo_url: string | null;
  maturite: string;
  date_lancement: string | null;
  description: string | null;
}

interface ServiceUsage {
  siret: string;
  service: number;
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
    const operatorsPath = path.join(dumpsDir, "operators.json");
    const servicesPath = path.join(dumpsDir, "services.json");
    const serviceUsagesPath = path.join(dumpsDir, "service_usages.json");

    // Verify all required files exist
    for (const filePath of [communesPath, operatorsPath]) {
      if (!fs.existsSync(filePath)) {
        console.error(`Required file not found: ${filePath}`);
        process.exit(1);
      }
    }

    console.log(`Reading communes data from ${communesPath}...`);
    const communesData = fs.readFileSync(communesPath, "utf8");
    const communes: Organization[] = JSON.parse(communesData);

    console.log(`Found ${communes.length} organizations to import.`);

    console.log(`Reading operators from ${operatorsPath}...`);
    const operatorsData = fs.readFileSync(operatorsPath, "utf8");
    const operatorsList: Operator[] = JSON.parse(operatorsData);

    client = await pool.connect();

    // Prepare bulk insert data
    const operatorValues = operatorsList.map((operator) => ({
      id: operator.id,
      name: operator.nom,
      name_unaccent: unaccent(operator.nom),
      shortname: operator.nom,
      name_with_article: operator.nom_avec_article || operator.nom,
      status: operator.statut || null,
      type: "operator",
      website: operator.url,
      siret: operator.siret,
    }));

    // Keep track of valid organizations and operators
    const validOperatorIds = new Set<string>(operatorsList.map((s) => s.id));
    const organizationSirets = new Set<string>();

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
        epci_siret: commune.epci_siret || null,
        epci_population: commune.epci_population || null,
        dep_siret: commune.dep_siret || null,
        region_siret: commune.region_siret || null,
        st_eligible: commune.st_eligible || false,
        st_active: commune.st_active || false,
        service_public_url: commune.service_public_url,
        service_public_id: commune.service_public_id || null,
      }));

    // Fill operator relations for communes only
    const operatorRelations: {
      organization_siret: string;
      operator_id: string;
      is_perimetre: boolean;
      is_adherent: boolean;
    }[] = [];
    organizationValues.forEach((commune) => {
      const originalCommune = communes.find((c) => c.siret === commune.siret);
      if (originalCommune?.operators && originalCommune.operators.length > 0) {
        originalCommune.operators.forEach((link) => {
          if (validOperatorIds.has(link.id)) {
            operatorRelations.push({
              organization_siret: commune.siret,
              operator_id: link.id,
              is_perimetre: link.is_perimetre ?? false,
              is_adherent: link.is_adherent ?? false,
            });
          }
        });
      }
    });

    console.log(`Reading services from ${servicesPath}...`);
    const servicesData = fs.readFileSync(servicesPath, "utf8");
    const services: Service[] = JSON.parse(servicesData);

    console.log(`Reading service usages from ${serviceUsagesPath}...`);
    const serviceUsagesData = fs.readFileSync(serviceUsagesPath, "utf8");
    const serviceUsage: ServiceUsage[] = (JSON.parse(serviceUsagesData) as ServiceUsage[]).filter(
      (usage) => usage.siret && organizationSirets.has(usage.siret),
    );

    console.log(`Found ${serviceUsage.length} service usages to import.`);

    // Prepare services to operators relations
    const validServiceIds = new Set<number>(services.map((s) => s.id));
    const servicesToOperatorsRelations: {
      service_id: number;
      operator_id: string;
      position: number;
    }[] = [];
    operatorsList.forEach((operator) => {
      if (operator.services && operator.services.length > 0) {
        operator.services
          .filter((id) => validServiceIds.has(id))
          .forEach((serviceId, index) => {
            servicesToOperatorsRelations.push({
              service_id: serviceId,
              operator_id: operator.id,
              position: index,
            });
          });
      }
    });

    console.log(
      `Found ${servicesToOperatorsRelations.length} services to operators relations to import.`,
    );

    console.log(`Starting DB transaction...`);

    // Start transaction and replace all data
    await client.query("BEGIN");

    // Clear existing data
    await client.query("TRUNCATE TABLE st_organizations_to_operators");
    await client.query("TRUNCATE TABLE st_organizations CASCADE");
    await client.query("TRUNCATE TABLE st_operators CASCADE");
    await client.query("TRUNCATE TABLE st_services CASCADE");
    await client.query("TRUNCATE TABLE st_organizations_to_services CASCADE");
    await client.query("TRUNCATE TABLE st_services_to_operators CASCADE");

    // Bulk insert operators
    console.log(`Bulk inserting ${operatorValues.length} operators...`);
    const operatorQuery = `
      INSERT INTO st_operators
      SELECT * FROM json_populate_recordset(null::st_operators, $1)
    `;
    await client.query(operatorQuery, [JSON.stringify(operatorValues)]);

    // Bulk insert organizations
    console.log(`Bulk inserting ${organizationValues.length} organizations...`);
    const orgQuery = `
      INSERT INTO st_organizations
      SELECT * FROM json_populate_recordset(null::st_organizations, $1)
    `;
    await client.query(orgQuery, [JSON.stringify(organizationValues)]);

    // Bulk insert relations
    if (operatorRelations.length > 0) {
      console.log(`Bulk inserting ${operatorRelations.length} operator relations...`);
      const relationsQuery = `
        INSERT INTO st_organizations_to_operators (organization_siret, operator_id, is_perimetre, is_adherent)
        SELECT * FROM json_populate_recordset(null::st_organizations_to_operators, $1)
      `;
      await client.query(relationsQuery, [JSON.stringify(operatorRelations)]);
    }

    // Bulk insert services (map French dump keys to DB column names)
    const serviceValues = services.map((s) => ({
      id: s.id,
      name: s.nom,
      url: s.url,
      type: s.type,
      instance_name: s.nom_instance,
      logo_url: s.logo_url,
      maturity: s.maturite,
      launch_date: s.date_lancement,
      description: s.description || null,
    }));

    console.log(`Bulk inserting ${serviceValues.length} services...`);
    const servicesQuery = `
      INSERT INTO st_services
      SELECT * FROM json_populate_recordset(null::st_services, $1)
    `;
    await client.query(servicesQuery, [JSON.stringify(serviceValues)]);

    // Bulk insert service usage (map French dump keys to DB column names)
    const serviceUsageValues = serviceUsage.map((u) => ({
      organization_siret: u.siret,
      service_id: u.service,
      active: u.active,
    }));
    console.log(`Bulk inserting ${serviceUsageValues.length} service usage...`);
    const serviceUsageQuery = `
      INSERT INTO st_organizations_to_services
      SELECT * FROM json_populate_recordset(null::st_organizations_to_services, $1)
    `;
    await client.query(serviceUsageQuery, [JSON.stringify(serviceUsageValues)]);

    // Bulk insert services to operators relations
    if (servicesToOperatorsRelations.length > 0) {
      console.log(
        `Bulk inserting ${servicesToOperatorsRelations.length} services to operators relations...`,
      );
      const servicesToOperatorsQuery = `
        INSERT INTO st_services_to_operators (service_id, operator_id, position)
        SELECT * FROM json_populate_recordset(null::st_services_to_operators, $1)
      `;
      await client.query(servicesToOperatorsQuery, [JSON.stringify(servicesToOperatorsRelations)]);
    }

    await client.query("COMMIT");

    console.log(
      `Successfully imported ${organizationValues.length} organizations and ${operatorValues.length} operators.`,
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
