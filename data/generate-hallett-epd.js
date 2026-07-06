// Script to generate all Hallett Group EPD JSON files
// Based on EPD-IES-0009353:003

const fs = require('fs');
const path = require('path');

// Reference end-of-life values at 2332 kg/m³ density
const EOL_REF_DENSITY = 2332;
const EOL_BASE = {
  C1: 14.8,
  C2: 5.96,
  C3: 5.02,
  C4: 8.45,
  D: -11.6
};

// Scale EOL values by density
function scaleEOL(density) {
  const factor = density / EOL_REF_DENSITY;
  return {
    C1: Math.round(factor * EOL_BASE.C1 * 100) / 100,
    C2: Math.round(factor * EOL_BASE.C2 * 100) / 100,
    C3: Math.round(factor * EOL_BASE.C3 * 100) / 100,
    C4: Math.round(factor * EOL_BASE.C4 * 100) / 100,
    D: Math.round(factor * EOL_BASE.D * 100) / 100
  };
}

// Plant location data
const PLANTS = {
  dry_creek: { name: "Dry Creek", production: "Dry Creek, South Australia" },
  elizabeth: { name: "Elizabeth", production: "Elizabeth, South Australia" },
  mile_end: { name: "Mile End", production: "Mile End, South Australia" },
  mclaren_vale: { name: "McLaren Vale", production: "McLaren Vale, South Australia" },
  osborne: { name: "Osborne", production: "Osborne, South Australia" }
};

// Products available at all 5 plants (standard mixes)
const FIVE_PLANT_PRODUCTS = [
  // N2020P variants
  { mix: "N2020P", variant: "Ref", density: 2308, grade: 20, enviro: null, gwp: { dry_creek: 275, elizabeth: 281, mile_end: 266, mclaren_vale: 273, osborne: 278 } },
  { mix: "N2020P", variant: "F30", density: 2308, grade: 20, enviro: "Level 1", gwp: { dry_creek: 203, elizabeth: 209, mile_end: 195, mclaren_vale: 201, osborne: 207 } },
  { mix: "N2020P", variant: "S30", density: 2297, grade: 20, enviro: "Level 1", gwp: { dry_creek: 206, elizabeth: 212, mile_end: 198, mclaren_vale: 204, osborne: 209 } },
  { mix: "N2020P", variant: "S50", density: 2293, grade: 20, enviro: "Level 2", gwp: { dry_creek: 162, elizabeth: 168, mile_end: 154, mclaren_vale: 159, osborne: 165 } },

  // N2520P variants
  { mix: "N2520P", variant: "Ref", density: 2312, grade: 25, enviro: null, gwp: { dry_creek: 301, elizabeth: 306, mile_end: 291, mclaren_vale: 298, osborne: 303 } },
  { mix: "N2520P", variant: "F30", density: 2310, grade: 25, enviro: "Level 1", gwp: { dry_creek: 221, elizabeth: 227, mile_end: 213, mclaren_vale: 219, osborne: 224 } },
  { mix: "N2520P", variant: "S30", density: 2301, grade: 25, enviro: "Level 1", gwp: { dry_creek: 225, elizabeth: 231, mile_end: 216, mclaren_vale: 223, osborne: 228 } },
  { mix: "N2520P", variant: "T50", density: 2311, grade: 25, enviro: "Level 3", gwp: { dry_creek: 171, elizabeth: 177, mile_end: 163, mclaren_vale: 168, osborne: 174 } },
  { mix: "N2520P", variant: "S50", density: 2296, grade: 25, enviro: "Level 2", gwp: { dry_creek: 176, elizabeth: 181, mile_end: 168, mclaren_vale: 173, osborne: 179 } },

  // N3220P variants
  { mix: "N3220P", variant: "Ref", density: 2351, grade: 32, enviro: null, gwp: { dry_creek: 344, elizabeth: 349, mile_end: 334, mclaren_vale: 342, osborne: 346 } },
  { mix: "N3220P", variant: "F30", density: 2347, grade: 32, enviro: "Level 1", gwp: { dry_creek: 251, elizabeth: 257, mile_end: 242, mclaren_vale: 249, osborne: 254 } },
  { mix: "N3220P", variant: "S30", density: 2338, grade: 32, enviro: "Level 1", gwp: { dry_creek: 255, elizabeth: 261, mile_end: 246, mclaren_vale: 253, osborne: 258 } },
  { mix: "N3220P", variant: "T50", density: 2346, grade: 32, enviro: "Level 3", gwp: { dry_creek: 192, elizabeth: 198, mile_end: 184, mclaren_vale: 190, osborne: 196 } },
  { mix: "N3220P", variant: "S50", density: 2332, grade: 32, enviro: "Level 3", gwp: { dry_creek: 198, elizabeth: 204, mile_end: 190, mclaren_vale: 196, osborne: 201 } },

  // N4020P variants
  { mix: "N4020P", variant: "Ref", density: 2356, grade: 40, enviro: null, gwp: { dry_creek: 412, elizabeth: 417, mile_end: 402, mclaren_vale: 411, osborne: 414 } },
  { mix: "N4020P", variant: "F30", density: 2347, grade: 40, enviro: "Level 1", gwp: { dry_creek: 299, elizabeth: 304, mile_end: 290, mclaren_vale: 298, osborne: 302 } },
  { mix: "N4020P", variant: "S30", density: 2339, grade: 40, enviro: "Level 1", gwp: { dry_creek: 304, elizabeth: 308, mile_end: 294, mclaren_vale: 302, osborne: 306 } },
  { mix: "N4020P", variant: "T50", density: 2343, grade: 40, enviro: "Level 3", gwp: { dry_creek: 227, elizabeth: 232, mile_end: 218, mclaren_vale: 225, osborne: 230 } },
  { mix: "N4020P", variant: "S50", density: 2332, grade: 40, enviro: "Level 3", gwp: { dry_creek: 234, elizabeth: 239, mile_end: 225, mclaren_vale: 232, osborne: 236 } },

  // N5020P variants
  { mix: "N5020P", variant: "Ref", density: 2367, grade: 50, enviro: null, gwp: { dry_creek: 506, elizabeth: 510, mile_end: 495, mclaren_vale: 505, osborne: 507 } },
  { mix: "N5020P", variant: "F30", density: 2353, grade: 50, enviro: "Level 1", gwp: { dry_creek: 365, elizabeth: 370, mile_end: 355, mclaren_vale: 363, osborne: 367 } },
  { mix: "N5020P", variant: "S30", density: 2345, grade: 50, enviro: "Level 1", gwp: { dry_creek: 370, elizabeth: 374, mile_end: 360, mclaren_vale: 368, osborne: 371 } },
  { mix: "N5020P", variant: "T50", density: 2348, grade: 50, enviro: "Level 3", gwp: { dry_creek: 274, elizabeth: 279, mile_end: 265, mclaren_vale: 272, osborne: 276 } },
  { mix: "N5020P", variant: "S50", density: 2336, grade: 50, enviro: "Level 3", gwp: { dry_creek: 282, elizabeth: 287, mile_end: 273, mclaren_vale: 281, osborne: 285 } }
];

// Products available at 2 plants (Dry Creek and Mile End)
const TWO_PLANT_PRODUCTS = [
  // S1020
  { mix: "S1020", variant: "PLC1", density: 2290, grade: 10, enviro: "Level 1", gwp: { dry_creek: 146, mile_end: 139 } },

  // S1520
  { mix: "S1520", variant: "PLC1120", density: 2030, grade: 15, enviro: "Level 1", gwp: { dry_creek: 163, mile_end: 155 } },
  { mix: "S1520", variant: "PLC2120", density: 2090, grade: 15, enviro: "Level 3", gwp: { dry_creek: 114, mile_end: 106 } },

  // S2520
  { mix: "S2520", variant: "PLC1", density: 2270, grade: 25, enviro: "Level 1", gwp: { dry_creek: 209, mile_end: 200 } },

  // S3220
  { mix: "S3220", variant: "PLC2", density: 2300, grade: 32, enviro: "Level 1", gwp: { dry_creek: 227, mile_end: 219 } },
  { mix: "S3220", variant: "LSLC2", density: 2300, grade: 32, enviro: "Level 3", gwp: { dry_creek: 161, mile_end: 153 } },
  { mix: "S3220", variant: "PLC2XYP", density: 2340, grade: 32, enviro: "Level 3", gwp: { dry_creek: 168, mile_end: 160 } },
  { mix: "S3220", variant: "PLC2120", density: 2230, grade: 32, enviro: "Level 2", gwp: { dry_creek: 225, mile_end: 216 } },

  // S4020
  { mix: "S4020", variant: "PTLC2", density: 2350, grade: 40, enviro: "Level 3", gwp: { dry_creek: 196, mile_end: 188 } },
  { mix: "S4020", variant: "COLLC1", density: 2400, grade: 40, enviro: "Level 1", gwp: { dry_creek: 299, mile_end: 290 } },
  { mix: "S4020", variant: "COLLC2", density: 2400, grade: 40, enviro: "Level 3", gwp: { dry_creek: 207, mile_end: 198 } },
  { mix: "S4020", variant: "PLC1120", density: 2430, grade: 40, enviro: "Level 1", gwp: { dry_creek: 297, mile_end: 287 } },
  { mix: "S4020", variant: "PLC2120", density: 2250, grade: 40, enviro: "Level 3", gwp: { dry_creek: 196, mile_end: 187 } },
  { mix: "S4020", variant: "PLC2XYP", density: 2260, grade: 40, enviro: "Level 3", gwp: { dry_creek: 216, mile_end: 207 } },

  // S5010
  { mix: "S5010", variant: "SCPLC2", density: 2580, grade: 50, enviro: "Level 1", gwp: { dry_creek: 306, mile_end: 297 } },

  // S6510
  { mix: "S6510", variant: "SCPLC2", density: 2410, grade: 65, enviro: "Level 3", gwp: { dry_creek: 253, mile_end: 245 } },
  { mix: "S6510", variant: "SCPEC2", density: 2400, grade: 65, enviro: "Level 2", gwp: { dry_creek: 316, mile_end: 307 } },

  // S6520
  { mix: "S6520", variant: "PLC2120", density: 2480, grade: 65, enviro: "Level 3", gwp: { dry_creek: 266, mile_end: 257 } },

  // S8010
  { mix: "S8010", variant: "COLSCLC2", density: 2500, grade: 80, enviro: "Level 3", gwp: { dry_creek: 290, mile_end: 282 } },
  { mix: "S8010", variant: "SCPEC2", density: 2420, grade: 80, enviro: "Level 2", gwp: { dry_creek: 348, mile_end: 339 } }
];

// Products available only at Mile End
const MILE_END_ONLY_PRODUCTS = [
  // N2010P
  { mix: "N2010P", variant: null, density: 2290, grade: 20, enviro: null, gwp: 193 },
  { mix: "N2010P", variant: "100", density: 2280, grade: 20, enviro: null, gwp: 199 },

  // N2020P special
  { mix: "N2020P", variant: "100", density: 2290, grade: 20, enviro: null, gwp: 230 },
  { mix: "N2020P", variant: "120", density: 2290, grade: 20, enviro: null, gwp: 238 },

  // S2020P
  { mix: "S2020P", variant: "200", density: 2280, grade: 20, enviro: null, gwp: 232 },

  // S2520
  { mix: "S2520", variant: "E1100", density: 2270, grade: 25, enviro: "Level 1", gwp: 187 },

  // S3220
  { mix: "S3220", variant: "E1100", density: 2320, grade: 32, enviro: "Level 1", gwp: 231 },

  // S4010
  { mix: "S4010", variant: "SCPH", density: 2390, grade: 40, enviro: "Level 1", gwp: 305 },

  // S4020 Mile End specials
  { mix: "S4020", variant: "E1100", density: 2340, grade: 40, enviro: "Level 1", gwp: 267 },
  { mix: "S4020", variant: "E1150H", density: 2310, grade: 40, enviro: "Level 1", gwp: 270 },
  { mix: "S4020", variant: "E2", density: 2400, grade: 40, enviro: "Level 2", gwp: 227 },
  { mix: "S4020", variant: "E2100", density: 2330, grade: 40, enviro: "Level 2", gwp: 215 },
  { mix: "S4020", variant: "E2120", density: 2360, grade: 40, enviro: "Level 2", gwp: 231 },
  { mix: "S4020", variant: "E2150", density: 2400, grade: 40, enviro: "Level 2", gwp: 229 },
  { mix: "S4020", variant: "E2150F", density: 2400, grade: 40, enviro: "Level 2", gwp: 226 },
  { mix: "S4020", variant: "E2200", density: 2400, grade: 40, enviro: "Level 2", gwp: 229 },
  { mix: "S4020", variant: "E3150", density: 2360, grade: 40, enviro: "Level 3", gwp: 175 },
  { mix: "S4020", variant: "E3150F", density: 2340, grade: 40, enviro: "Level 3", gwp: 173 },

  // S5010 Mile End
  { mix: "S5010", variant: "DW500D", density: 2250, grade: 50, enviro: "Level 3", gwp: 252 },
  { mix: "S5010", variant: "DW500D3", density: 2250, grade: 50, enviro: "Level 3", gwp: 253 },
  { mix: "S5010", variant: "E1150H", density: 2410, grade: 50, enviro: "Level 1", gwp: 294 },
  { mix: "S5010", variant: "SCPH", density: 2390, grade: 50, enviro: "Level 1", gwp: 306 },

  // S5020
  { mix: "S5020", variant: "E1200", density: 2300, grade: 50, enviro: "Level 1", gwp: 292 },
  { mix: "S5020", variant: "METALDIT", density: 2310, grade: 50, enviro: "Level 1", gwp: 288 },

  // S6520
  { mix: "S6520", variant: "E2150", density: 2350, grade: 65, enviro: "Level 2", gwp: 326 },

  // CLSM
  { mix: "CLSM", variant: "PEB", density: 2020, grade: null, enviro: null, gwp: 89 },
  { mix: "CLSM", variant: "SB", density: 2000, grade: null, enviro: "Level 1", gwp: 142 },
  { mix: "CLSM", variant: "3", density: 2010, grade: null, enviro: null, gwp: 73 },
  { mix: "CLSM", variant: "4", density: 2000, grade: null, enviro: null, gwp: 85 },
  { mix: "CLSM", variant: "5", density: 2000, grade: null, enviro: null, gwp: 98 },
  { mix: "CLSM", variant: "15", density: 2000, grade: null, enviro: "Level 1", gwp: 167 },

  // NOFINES
  { mix: "NOFINES", variant: null, density: 1790, grade: null, enviro: null, gwp: 167 }
];

// Generate EPD JSON object
function createEPD(product, plantKey) {
  const plant = PLANTS[plantKey];
  const eol = scaleEOL(product.density);

  const productName = product.variant
    ? `${product.mix} ${product.variant}${product.enviro ? ` (Enviro Construct ${product.enviro})` : ''}`
    : `${product.mix}${product.enviro ? ` (Enviro Construct ${product.enviro})` : ''}`;

  const gwpValue = typeof product.gwp === 'number' ? product.gwp : product.gwp[plantKey];

  // Determine application based on grade
  let application = "General construction";
  if (product.grade === null) {
    if (product.mix === "CLSM") application = "Controlled low-strength material";
    else if (product.mix === "NOFINES") application = "No-fines concrete";
  } else if (product.grade >= 32) {
    application = "Industrial and structural applications";
  }

  // Determine strength class
  const strengthClass = product.grade ? (product.mix.startsWith('S') ? `S${product.grade}` : `N${product.grade}`) : null;

  return {
    epd: {
      id: `EPD-IES-0009353:003-${plantKey.toUpperCase().replace('_', '')}-${product.mix}${product.variant ? '-' + product.variant : ''}`,
      source_file: "epd-australasia-com-wp-content-uploads-2023-08-epd-ies-0009353-003-hallett-ready-mix-concrete-2026-05-04-pdf.pdf",
      program_operator: "EPD Australasia",
      published_date: "2023-07-31",
      valid_until: "2028-07-31",
      standard: "EN 15804:2012+A2:2019/AC:2021",
      verification: {
        type: "third_party",
        verifier: "Rob Rouwette"
      }
    },
    product: {
      name: productName,
      manufacturer: "Hallett Group Pty Ltd",
      type: "Ready-mix concrete",
      standard: "AS 1379"
    },
    location: {
      production: plant.production,
      plants: [plant.name],
      country: "Australia",
      state: "SA"
    },
    characteristics: {
      compressive_strength: {
        value: product.grade,
        unit: "MPa",
        class: strengthClass
      },
      strength_evaluation_days: 28,
      exposure_class: null,
      aggregate_size_mm: 20,
      slump_mm: null,
      application: application
    },
    declared_unit: {
      value: 1,
      unit: "m3",
      mass_kg: product.density
    },
    gwp: {
      unit: "kg CO2e",
      stages: {
        A1: { value: gwpValue, declared: true, name: "Raw materials" },
        A2: { value: null, declared: true, name: "Transport to factory" },
        A3: { value: null, declared: true, name: "Manufacturing" },
        A4: { value: null, declared: false, name: "Transport to site" },
        A5: { value: null, declared: false, name: "Installation" },
        B1: { value: null, declared: false, name: "Use" },
        B2: { value: null, declared: false, name: "Maintenance" },
        B3: { value: null, declared: false, name: "Repair" },
        B4: { value: null, declared: false, name: "Replacement" },
        B5: { value: null, declared: false, name: "Refurbishment" },
        B6: { value: null, declared: false, name: "Operational energy use" },
        B7: { value: null, declared: false, name: "Operational water use" },
        C1: { value: eol.C1, declared: true, name: "Demolition" },
        C2: { value: eol.C2, declared: true, name: "Transport to disposal" },
        C3: { value: eol.C3, declared: true, name: "Waste processing" },
        C4: { value: eol.C4, declared: true, name: "Disposal" },
        D: { value: eol.D, declared: true, name: "Benefits beyond system boundary" }
      },
      totals: {
        A1_A3: gwpValue,
        A1_A5: null,
        C1_C4: Math.round((eol.C1 + eol.C2 + eol.C3 + eol.C4) * 100) / 100,
        full_lifecycle_excl_D: null,
        full_lifecycle_incl_D: null
      }
    },
    gwp_fossil: {
      unit: "kg CO2e",
      A1_A3: gwpValue
    },
    notes: {
      carbonation: "Not considered (conservative approach)",
      use_phase: "B1-B7 not declared",
      recycling_rate_percent: 82,
      landfill_rate_percent: 18
    }
  };
}

// Generate filename
function getFilename(product, plantKey) {
  const plantShort = plantKey.replace('_', '-');
  const mixName = product.mix.toLowerCase();
  const variant = product.variant ? `-${product.variant}` : '';
  return `EPD-IES-0009353-${plantShort}-${mixName}${variant}.json`;
}

// Main generation
const outputDir = __dirname;
let filesCreated = 0;

// Generate 5-plant products
for (const product of FIVE_PLANT_PRODUCTS) {
  for (const plantKey of Object.keys(PLANTS)) {
    const epd = createEPD(product, plantKey);
    const filename = getFilename(product, plantKey);
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(epd, null, 2) + '\n');
    filesCreated++;
    console.log(`Created: ${filename}`);
  }
}

// Generate 2-plant products (Dry Creek and Mile End)
for (const product of TWO_PLANT_PRODUCTS) {
  for (const plantKey of ['dry_creek', 'mile_end']) {
    if (product.gwp[plantKey]) {
      const epd = createEPD(product, plantKey);
      const filename = getFilename(product, plantKey);
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(epd, null, 2) + '\n');
      filesCreated++;
      console.log(`Created: ${filename}`);
    }
  }
}

// Generate Mile End only products
for (const product of MILE_END_ONLY_PRODUCTS) {
  const epd = createEPD(product, 'mile_end');
  const filename = getFilename(product, 'mile_end');
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(epd, null, 2) + '\n');
  filesCreated++;
  console.log(`Created: ${filename}`);
}

console.log(`\nTotal files created: ${filesCreated}`);
