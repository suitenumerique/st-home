/**
 * Adds the mairies d'arrondissement (Paris, Lyon) and de secteur (Marseille) to the
 * per-department commune GeoJSON the map reads, and drops the commune de Paris, which
 * the pipeline now exposes at the département tier.
 *
 * The rest of public/geojson is produced outside this repo; this script only patches
 * the three departments concerned, and is idempotent.
 *
 * Contours come from geo.api.gouv.fr. A unit covering several INSEE arrondissements
 * (Paris Centre, the Marseille secteurs) is the union of their contours, so no internal
 * border shows.
 *
 * Run after a sync: npx tsx scripts/build-arrondissement-geojson.ts
 */
import { union } from "@turf/turf";
import fs from "fs";
import path from "path";

const GEOJSON_DIR = path.join(__dirname, "../public/geojson/communes_par_departement");
const ORGS = path.join(__dirname, "../data/dumps/organizations.json");

// Mirrors ARRONDISSEMENT_COMMUNES in data/tasks/defs.py: unit INSEE code -> the INSEE
// arrondissements it administers. Units absent here cover their own code only.
const COVERS: Record<string, string[]> = {
  "75103": ["75101", "75102", "75103", "75104"],
  "13201": ["13201", "13207"],
  "13202": ["13202", "13203"],
  "13205": ["13204", "13205"],
  "13208": ["13206", "13208"],
  "13209": ["13209", "13210"],
  "13212": ["13211", "13212"],
  "13214": ["13213", "13214"],
  "13215": ["13215", "13216"],
};

type Org = {
  type: string;
  siret: string;
  name: string;
  insee_com: string | null;
  insee_dep: string | null;
  epci_siren?: string | null;
};

type Contour = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;

const fetchContour = async (code: string): Promise<Contour> => {
  const url = `https://geo.api.gouv.fr/communes/${code}?fields=code&format=geojson&geometry=contour`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`geo.api.gouv.fr ${code}: HTTP ${res.status}`);
  const feature = (await res.json()) as Contour;
  // Without geometry=contour the API answers with the commune's centre, a Point.
  if (feature.geometry?.type !== "Polygon" && feature.geometry?.type !== "MultiPolygon") {
    throw new Error(`geo.api.gouv.fr ${code}: no contour`);
  }
  return feature;
};

const run = async () => {
  const orgs: Org[] = JSON.parse(fs.readFileSync(ORGS, "utf8"));
  const units = orgs.filter(
    (o) => o.type === "commune" && o.insee_com !== null && o.insee_com in ARRONDISSEMENT_UNITS,
  );

  // Group the new features by department file
  const byDep: Record<string, GeoJSON.Feature[]> = {};

  for (const unit of units) {
    const insee = unit.insee_com as string;
    const codes = COVERS[insee] ?? [insee];
    const parts = await Promise.all(codes.map(fetchContour));
    let merged = parts[0];
    for (const part of parts.slice(1)) {
      const u = union({ type: "FeatureCollection", features: [merged, part] });
      if (!u) throw new Error(`union failed for ${insee}`);
      merged = u;
    }
    const dep = unit.insee_dep as string;
    (byDep[dep] ??= []).push({
      type: "Feature",
      geometry: merged.geometry,
      properties: {
        INSEE_GEO: insee,
        INSEE_DEP: dep,
        NAME: unit.name,
        SIRET: unit.siret,
        EPCI_SIREN: unit.epci_siren ?? null,
      },
    });
    console.log(`  ${insee} ${unit.name} (${codes.length} contour(s))`);
  }

  for (const [dep, features] of Object.entries(byDep)) {
    const file = path.join(GEOJSON_DIR, `${dep}.json`);
    const fc = JSON.parse(fs.readFileSync(file, "utf8")) as GeoJSON.FeatureCollection;
    const added = new Set(features.map((f) => f.properties!.INSEE_GEO as string));
    // Idempotent: drop any previous run's units, and the commune de Paris, which is
    // now a département and must not be drawn on the commune layer.
    fc.features = fc.features.filter((f) => {
      const code = f.properties?.INSEE_GEO as string;
      return !added.has(code) && code !== "75056";
    });
    fc.features.push(...features);
    fs.writeFileSync(file, JSON.stringify(fc));
    console.log(`${dep}.json: ${fc.features.length} features`);
  }
};

// Kept in sync with defs.py by build time rather than at runtime: the units are the
// keys of ARRONDISSEMENT_COMMUNES.
const ARRONDISSEMENT_UNITS: Record<string, true> = Object.fromEntries(
  [
    "13201",
    "13202",
    "13205",
    "13208",
    "13209",
    "13212",
    "13214",
    "13215",
    "69381",
    "69382",
    "69383",
    "69384",
    "69385",
    "69386",
    "69387",
    "69388",
    "69389",
    "75103",
    "75105",
    "75106",
    "75107",
    "75108",
    "75109",
    "75110",
    "75111",
    "75112",
    "75113",
    "75114",
    "75115",
    "75116",
    "75117",
    "75118",
    "75119",
    "75120",
  ].map((c) => [c, true as const]),
);

run();
