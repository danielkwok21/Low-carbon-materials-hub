'use client';

import { EPDData, STAGE_GROUPS } from '@/lib/types';

interface ProductCardProps {
  epd: EPDData;
  isSelected: boolean;
  onToggleSelect: () => void;
}

function getCompleteness(epd: EPDData): { complete: string[]; missing: string[] } {
  const complete: string[] = [];
  const missing: string[] = [];

  const productionStages = STAGE_GROUPS.production;
  const eolStages = STAGE_GROUPS.endOfLife;

  for (const stage of productionStages) {
    if (epd.gwp.stages[stage].declared) {
      complete.push(stage);
    } else {
      missing.push(stage);
    }
  }

  for (const stage of eolStages) {
    if (epd.gwp.stages[stage].declared) {
      complete.push(stage);
    } else {
      missing.push(stage);
    }
  }

  return { complete, missing };
}

export function ProductCard({ epd, isSelected, onToggleSelect }: ProductCardProps) {
  const gwpA1A3 = epd.gwp.totals.A1_A3;
  const { complete, missing } = getCompleteness(epd);
  const hasAllProductionStages = STAGE_GROUPS.production.every(s => epd.gwp.stages[s].declared);

  return (
    <div
      className={`bg-white rounded-lg border p-4 transition-all ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">{epd.product.name}</h3>
              <p className="text-sm text-gray-600">{epd.product.manufacturer}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {gwpA1A3 !== null ? gwpA1A3.toFixed(0) : '—'}
              </div>
              <div className="text-sm text-gray-500">kg CO₂e (A1-A3)</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Strength:</span>{' '}
              <span className="font-medium">
                {epd.characteristics.compressive_strength.value} MPa
              </span>
            </div>
            <div>
              <span className="text-gray-500">Location:</span>{' '}
              <span className="font-medium">{epd.location.state}, {epd.location.country}</span>
            </div>
            <div>
              <span className="text-gray-500">EPD:</span>{' '}
              <span className="font-mono text-xs">{epd.epd.id}</span>
            </div>
          </div>

          {/* Data completeness indicator */}
          <div className="mt-3">
            {missing.length > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Missing stages: {missing.join(', ')}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Complete lifecycle data (A1-C4)</span>
              </div>
            )}
          </div>

          {/* Source EPD link */}
          <div className="mt-2 text-xs text-gray-500">
            Source: <span className="font-mono">{epd.epd.source_file}</span>
            {' · '}Valid until: {epd.epd.valid_until}
          </div>
        </div>
      </div>
    </div>
  );
}
