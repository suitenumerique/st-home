const fs = require('fs');
const path = require('path');

// Read the parent_areas.json file
const parentAreasPath = path.join(__dirname, '../public/parent_areas.json');
const parentAreas = JSON.parse(fs.readFileSync(parentAreasPath, 'utf8'));

// Extract regions and departments
const regions = parentAreas.filter(area => area.type === 'region');
const departments = parentAreas.filter(area => area.type === 'department');

// Create deterministic hash function
function deterministicHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Generate fake data
const fakeData = {};

// Generate values for regions (0-250)
regions.forEach(region => {
  const hash = deterministicHash(region.insee_geo);
  const value = (hash % 251); // 0-250
  fakeData[region.insee_geo] = value;
});

// Generate values for departments (0-72)
departments.forEach(department => {
  const hash = deterministicHash(department.insee_geo);
  const value = (hash % 73); // 0-72
  fakeData[department.insee_geo] = value;
});

// Write the JSON file
const outputPath = path.join(__dirname, '../public/fake-data.json');
fs.writeFileSync(outputPath, JSON.stringify(fakeData, null, 2));

console.log('Generated fake data for:');
console.log(`- ${regions.length} regions`);
console.log(`- ${departments.length} departments`);
console.log(`- Total entries: ${Object.keys(fakeData).length}`);
console.log(`- Output file: ${outputPath}`);

// Show some examples
console.log('\nSample data:');
const sampleRegions = regions.slice(0, 3);
const sampleDepartments = departments.slice(0, 3);

console.log('Regions:');
sampleRegions.forEach(region => {
  console.log(`  ${region.insee_geo} (${region.name}): ${fakeData[region.insee_geo]}`);
});

console.log('Departments:');
sampleDepartments.forEach(department => {
  console.log(`  ${department.insee_geo} (${department.name}): ${fakeData[department.insee_geo]}`);
});
