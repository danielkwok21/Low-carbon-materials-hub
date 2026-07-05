export interface GWPStage {
  value: number | null;
  declared: boolean;
  name: string;
}

export interface GWPStages {
  A1: GWPStage;
  A2: GWPStage;
  A3: GWPStage;
  A4: GWPStage;
  A5: GWPStage;
  B1: GWPStage;
  B2: GWPStage;
  B3: GWPStage;
  B4: GWPStage;
  B5: GWPStage;
  B6: GWPStage;
  B7: GWPStage;
  C1: GWPStage;
  C2: GWPStage;
  C3: GWPStage;
  C4: GWPStage;
  D: GWPStage;
}

export interface GWPTotals {
  A1_A3: number | null;
  A1_A5: number | null;
  C1_C4: number | null;
  full_lifecycle_excl_D: number | null;
  full_lifecycle_incl_D: number | null;
}

export interface EPDData {
  epd: {
    id: string;
    source_file: string;
    program_operator: string;
    published_date: string;
    valid_until: string;
    standard: string;
    verification: {
      type: string;
      verifier: string;
    };
  };
  product: {
    name: string;
    manufacturer: string;
    type: string;
    standard: string;
  };
  location: {
    production: string;
    plants: string[];
    country: string;
    state: string;
  };
  characteristics: {
    compressive_strength: {
      value: number;
      unit: string;
      class: string;
    };
    strength_evaluation_days: number;
    exposure_class: string | null;
    aggregate_size_mm: number | null;
    slump_mm: number | null;
    application: string;
  };
  declared_unit: {
    value: number;
    unit: string;
    mass_kg: number;
  };
  gwp: {
    unit: string;
    stages: GWPStages;
    totals: GWPTotals;
  };
  gwp_fossil: {
    unit: string;
    A1_A3: number;
  };
  notes: {
    carbonation: string;
    use_phase: string;
    transport_installation?: string;
    recycling_rate_percent: number;
    landfill_rate_percent: number;
  };
}

export type StageKey = keyof GWPStages;

export const STAGE_GROUPS = {
  production: ['A1', 'A2', 'A3', 'A4', 'A5'] as StageKey[],
  use: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'] as StageKey[],
  endOfLife: ['C1', 'C2', 'C3', 'C4'] as StageKey[],
  beyond: ['D'] as StageKey[],
};

export const STAGE_GROUP_NAMES = {
  production: 'Production (A1-A5)',
  use: 'Use (B1-B7)',
  endOfLife: 'End of Life (C1-C4)',
  beyond: 'Beyond System (D)',
};
