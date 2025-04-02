import fs from "fs";
import path from "path";
import { pool } from "../src/lib/db";
import { unaccent } from "../src/lib/string";

interface BaseOrganization {
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

interface Commune extends BaseOrganization {
  type: "commune";
  insee_geo: string;
  zipcode: string;
  email_official: string;
  structures: number[];
  website_url: string | null;
  issues: string[];
  rcpnt: string[];
  issues_last_checked: string;
  website_domain: string | null;
  email_domain: string | null;
  website_tld: string | null;
  email_tld: string | null;
  epci_name: string;
  epci_siren: string;
  epci_population: number;
  service_public_url: string;
  service_public_id: string;
}

interface EPCI extends BaseOrganization {
  type: "epci";
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

    const communesPath = path.join(dumpsDir, "communes.json");
    const epcisPath = path.join(dumpsDir, "epcis.json");
    const structuresPath = path.join(dumpsDir, "structures.json");

    // Verify all required files exist
    for (const filePath of [communesPath, epcisPath, structuresPath]) {
      if (!fs.existsSync(filePath)) {
        console.error(`Required file not found: ${filePath}`);
        process.exit(1);
      }
    }

    console.log(`Reading communes data from ${communesPath}...`);
    const communesData = fs.readFileSync(communesPath, "utf8");
    const communes: Commune[] = JSON.parse(communesData);

    console.log(`Reading EPCIs data from ${epcisPath}...`);
    const epcisData = fs.readFileSync(epcisPath, "utf8");
    const epcis: EPCI[] = JSON.parse(epcisData);

    console.log(`Found ${communes.length} communes and ${epcis.length} EPCIs to import.`);

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

    // Transform communes
    const communeValues = communes
      .filter((commune) => {
        if (!commune.siret) {
          console.log(`Skipping commune without SIRET: ${commune.name}`);
          return false;
        }
        return true;
      })
      .map((commune) => ({
        siret: commune.siret,
        siren: commune.siren,
        type: "commune" as const,
        name: commune.name,
        name_unaccent: unaccent(commune.name),
        slug: commune.slug,
        insee_geo: commune.insee_geo,
        insee_dep: commune.insee_dep || null,
        insee_reg: commune.insee_reg || null,
        zipcode: commune.zipcode,
        population: commune.population,
        website_url: commune.website_url || null,
        website_domain: commune.website_domain || null,
        website_tld: commune.website_tld || null,
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

    // Transform EPCIs, keeping track of duplicates
    const seenSirets = new Set<string>();
    const epciValues = epcis
      .filter((epci) => {
        if (!epci.siret) {
          console.log(`Skipping EPCI without SIRET: ${epci.name}`);
          return false;
        }
        if (seenSirets.has(epci.siret)) {
          console.log(`Skipping duplicate SIRET in EPCIs: ${epci.siret} (${epci.name})`);
          return false;
        }
        seenSirets.add(epci.siret);
        return true;
      })
      .map((epci) => ({
        siret: epci.siret,
        siren: epci.siren,
        type: "epci" as const,
        name: epci.name,
        name_unaccent: unaccent(epci.name),
        slug: `epci-${epci.siren}`,
        insee_geo: "",
        insee_dep: epci.insee_dep || null,
        insee_reg: epci.insee_reg || null,
        zipcode: "",
        population: epci.population,
        website_url: null,
        website_domain: null,
        website_tld: null,
        issues: [],
        issues_last_checked: null,
        rcpnt: [],
        email_official: null,
        email_domain: null,
        email_tld: null,
        epci_name: null,
        epci_siren: null,
        epci_population: null,
        st_eligible: epci.st_eligible || false,
        st_active: false,
        service_public_url: null,
        service_public_id: null,
      }));

    // Combine all organizations
    const organizationValues = [...communeValues, ...epciValues];

    // Fill structure relations for communes only
    const structureRelations: {
      organization_siret: string;
      structure_id: string;
    }[] = [];
    communeValues.forEach((commune) => {
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

    // Start transaction and replace all data
    await client.query("BEGIN");

    // Clear existing data
    await client.query("TRUNCATE TABLE st_organizations_to_structures");
    await client.query("TRUNCATE TABLE st_organizations CASCADE");
    await client.query("TRUNCATE TABLE st_mutualization_structures CASCADE");

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

    await client.query("COMMIT");

    console.log(
      `Successfully imported ${communeValues.length} communes, ${epciValues.length} EPCIs and ${structureValues.length} structures.`,
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
