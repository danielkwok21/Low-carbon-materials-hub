# EPD Data Extraction Guide

This document describes the process for extracting Environmental Product Declaration (EPD) data from PDF documents and converting them into the JSON format used by the Low Carbon Materials Hub.

## Overview

EPDs are standardized documents that provide transparent, comparable information about the environmental impact of products throughout their life cycle. This application focuses on ready-mix concrete EPDs following the EN 15804:2012+A2:2019 standard.

## Source Documents

EPD PDFs are obtained from:
- **EPD Hub** (epdhub.com) - Australian EPD registry
- **EPD IES** - International EPD System

Source files should be placed in the project root and are excluded from version control via `.gitignore` (`*.pdf`).

## JSON Schema

Each extracted EPD is saved as a JSON file in the `/data` directory with the naming convention: `EPD_{SOURCE}-{ID}.json`

### Required Fields

```json
{
  "epd": {
    "id": "HUB-5991",
    "source_file": "EPD_HUB-5991_2026-06-27_en.pdf",
    "program_operator": "EPD Hub",
    "published_date": "2026-04-15",
    "valid_until": "2031-04-14",
    "standard": "EN 15804:2012+A2:2019/AC:2021",
    "verification": {
      "type": "third_party",
      "verifier": "Verifier Name"
    }
  },
  "product": {
    "name": "N40/20 Xencrete",
    "manufacturer": "Manufacturer Name",
    "type": "Ready-mix concrete",
    "standard": "AS 1379-2007"
  },
  "location": {
    "production": "City, State, Country",
    "plants": ["Plant 1", "Plant 2"],
    "country": "Australia",
    "state": "NSW"
  },
  "characteristics": {
    "compressive_strength": {
      "value": 40,
      "unit": "MPa",
      "class": "N40"
    },
    "strength_evaluation_days": 28,
    "exposure_class": "B1",
    "aggregate_size_mm": 20,
    "slump_mm": 80,
    "application": "General use concrete"
  },
  "declared_unit": {
    "value": 1,
    "unit": "m3",
    "mass_kg": 2306
  },
  "gwp": {
    "unit": "kg CO2e",
    "stages": { ... },
    "totals": { ... }
  },
  "gwp_fossil": {
    "unit": "kg CO2e",
    "A1_A3": 273
  },
  "notes": {
    "carbonation": "Description of carbonation treatment",
    "use_phase": "B1-B7 declaration status",
    "recycling_rate_percent": 70,
    "landfill_rate_percent": 30
  }
}
```

## Life Cycle Stages (GWP)

The Global Warming Potential (GWP) is broken down by EN 15804 life cycle stages:

| Stage | Name | Description |
|-------|------|-------------|
| **A1** | Raw materials | Extraction and processing of raw materials |
| **A2** | Transport to factory | Transport of materials to manufacturing site |
| **A3** | Manufacturing | Production/manufacturing processes |
| **A4** | Transport to site | Transport to construction site |
| **A5** | Installation | Installation and construction processes |
| **B1-B7** | Use phase | Typically not declared for concrete |
| **C1** | Demolition | Deconstruction/demolition |
| **C2** | Transport to disposal | Transport to waste processing |
| **C3** | Waste processing | Recycling and processing |
| **C4** | Disposal | Final disposal (landfill) |
| **D** | Beyond system boundary | Benefits from recycling/reuse |

### Stage Data Format

```json
"stages": {
  "A1": { "value": 235, "declared": true, "name": "Raw materials" },
  "A2": { "value": 34.2, "declared": true, "name": "Transport to factory" },
  "B1": { "value": null, "declared": false, "name": "Use" }
}
```

- `value`: GWP in kg CO2e (null if not declared)
- `declared`: Whether the stage is included in the EPD
- `name`: Human-readable stage description

## Extraction Process

1. **Obtain the PDF** - Download the EPD from the program operator's website

2. **Extract metadata** - Identify:
   - EPD ID and validity dates
   - Program operator and verification details
   - Product name, manufacturer, and specifications

3. **Extract GWP data** - Locate the environmental impact table and extract:
   - Individual stage values (A1-D)
   - Pre-calculated totals (A1-A3, C1-C4, etc.)

4. **Validate totals** - Cross-check extracted totals against calculated sums

5. **Create JSON file** - Format according to the schema in `/lib/types.ts`

6. **Test the data** - Run the app locally to verify the EPD displays correctly

## Data Quality Notes

- All values should be per 1 m³ of concrete (the declared unit)
- Negative values for Stage D indicate environmental benefits
- Use phase (B1-B7) is typically not declared for concrete products
- Record carbonation treatment status in the notes field

## Adding New EPDs

1. Place the source PDF in the project root (it will be gitignored)
2. Create a new JSON file in `/data` following the naming convention
3. Fill in all required fields from the EPD document
4. Run `npm run dev` to verify the data loads correctly
5. Commit the JSON file (not the PDF)
