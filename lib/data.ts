import { EPDData, StageKey, STAGE_GROUPS } from './types';
import fs from 'fs';
import path from 'path';

export function loadAllEPDs(): EPDData[] {
  const dataDir = path.join(process.cwd(), 'data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  return files.map(file => {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    return JSON.parse(content) as EPDData;
  });
}

export function getUniqueStrengths(epds: EPDData[]): number[] {
  const strengths = new Set(
    epds
      .map(e => e.characteristics.compressive_strength.value)
      .filter((v): v is number => v !== null)
  );
  return Array.from(strengths).sort((a, b) => a - b);
}

export function getUniqueLocations(epds: EPDData[]): string[] {
  const locations = new Set(epds.map(e => e.location.state));
  return Array.from(locations).sort();
}

export function getUniqueManufacturers(epds: EPDData[]): string[] {
  const manufacturers = new Set(epds.map(e => e.product.manufacturer));
  return Array.from(manufacturers).sort();
}

export function calculateStageGroupTotal(epd: EPDData, group: StageKey[]): { value: number | null; complete: boolean } {
  let total = 0;
  let hasAnyDeclared = false;
  let allDeclared = true;

  for (const stage of group) {
    const stageData = epd.gwp.stages[stage];
    if (stageData.declared && stageData.value !== null) {
      total += stageData.value;
      hasAnyDeclared = true;
    } else {
      allDeclared = false;
    }
  }

  if (!hasAnyDeclared) {
    return { value: null, complete: false };
  }

  return { value: total, complete: allDeclared };
}

export function getComparableTotal(epd: EPDData): { value: number | null; stages: StageKey[]; missing: StageKey[] } {
  const declaredStages: StageKey[] = [];
  const missingStages: StageKey[] = [];
  let total = 0;

  const allStages = [...STAGE_GROUPS.production, ...STAGE_GROUPS.endOfLife] as StageKey[];

  for (const stage of allStages) {
    const stageData = epd.gwp.stages[stage];
    if (stageData.declared && stageData.value !== null) {
      total += stageData.value;
      declaredStages.push(stage);
    } else {
      missingStages.push(stage);
    }
  }

  return {
    value: declaredStages.length > 0 ? total : null,
    stages: declaredStages,
    missing: missingStages
  };
}
