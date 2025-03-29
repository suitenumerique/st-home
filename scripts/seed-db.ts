import fs from "fs";
import path from "path";
import { pool } from "../src/lib/db";
import { unaccent } from "../src/lib/string";

interface Commune {
  name: string;
  slug: string;
  insee_geo: string;
  siren: string;
  siret: string;
  population: number;
  zipcode: string;
  email_official: string;
  structures: number[];
  website_url: string | null;
  issues: string[];
  website_domain: string | null;
  email_domain: string | null;
  website_tld: string | null;
  email_tld: string | null;
  epci_name: string;
  epci_siren: string;
  epci_population: number;
  url_service_public: string;
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

async function importCommunes(filePath: string) {
  let client;
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      console.error(
        "Database connection failed. Please check your DATABASE_URL and try again.",
      );
      process.exit(1);
    }

    console.log(`Reading data from ${filePath}...`);
    const data = fs.readFileSync(filePath, "utf8");
    const communes: Commune[] = JSON.parse(data);

    console.log(`Found ${communes.length} communes to import.`);

    // Get structures data
    const structuresPath = filePath.replace(
      /[a-z0-9]+.json/,
      "structures.json",
    );
    console.log(`Reading structures from ${structuresPath}...`);

    if (!fs.existsSync(structuresPath) || structuresPath === filePath) {
      console.error(`Structures file not found: ${structuresPath}`);
      process.exit(1);
    }

    const structuresData = fs.readFileSync(structuresPath, "utf8");
    const structuresList: Structure[] = JSON.parse(structuresData);

    // Filter out structures that are not mutualization structures
    const mutualizationStructures = structuresList.filter(
      (structure) =>
        structure.Typologie.indexOf("OPSN") !== -1 ||
        structure.Typologie.indexOf("Centre de gestion") !== -1,
    );

    // Get a client for transaction
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
    const validStructureIds = new Set(
      mutualizationStructures.map((s) => String(s.id)),
    );
    const seenSirets = new Set<string>();
    let structureRelations: {
      organization_siret: string;
      structure_id: string;
    }[] = [];

    // Filter and transform organizations
    const organizationValues = communes
      .filter((commune) => {
        if (!commune.siret || commune.population === 0) return false;
        if (seenSirets.has(commune.siret)) {
          console.log(
            `Skipping duplicate SIRET: ${commune.siret} (${commune.name})`,
          );
          return false;
        }
        seenSirets.add(commune.siret);

        // Fill structure relations
        if (commune.structures && commune.structures.length > 0) {
          commune.structures.forEach((structureId) => {
            if (validStructureIds.has(String(structureId))) {
              structureRelations.push({
                organization_siret: commune.siret,
                structure_id: String(structureId),
              });
            }
          });
        }
        return true;
      })
      .map((commune) => ({
        siret: commune.siret,
        siren: commune.siren,
        name: commune.name,
        name_unaccent: unaccent(commune.name),
        slug: commune.slug,
        insee_geo: commune.insee_geo,
        zipcode: commune.zipcode,
        population: commune.population,
        website_url: commune.website_url || null,
        website_domain: commune.website_domain || null,
        website_tld: commune.website_tld || null,
        issues: commune.issues,
        email_official: commune.email_official || null,
        email_domain: commune.email_domain || null,
        email_tld: commune.email_tld || null,
        epci_name: commune.epci_name || null,
        epci_siren: commune.epci_siren || null,
        epci_population: commune.epci_population || null,
        st_eligible: commune.st_eligible || false,
        st_active: commune.st_active || false,
        url_service_public: commune.url_service_public,
      }));

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
      console.log(
        `Bulk inserting ${structureRelations.length} structure relations...`,
      );
      const relationsQuery = `
        INSERT INTO st_organizations_to_structures (organization_siret, structure_id)
        SELECT * FROM json_populate_recordset(null::st_organizations_to_structures, $1)
      `;
      await client.query(relationsQuery, [JSON.stringify(structureRelations)]);
    }

    await client.query("COMMIT");

    console.log(
      `Successfully imported ${organizationValues.length} communes and ${structureValues.length} structures.`,
    );
  } catch (error) {
    console.error("Error importing communes:", error);
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

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error("Please provide a file path as an argument.");
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), filePath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  process.exit(1);
}

importCommunes(resolvedPath);
