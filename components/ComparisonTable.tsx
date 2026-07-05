'use client';

import { useState } from 'react';
import { EPDData, StageKey, STAGE_GROUPS } from '@/lib/types';

interface ComparisonTableProps {
  products: EPDData[];
}

const STAGE_LABELS: Record<StageKey, string> = {
  A1: 'A1 - Raw materials',
  A2: 'A2 - Transport to factory',
  A3: 'A3 - Manufacturing',
  A4: 'A4 - Transport to site',
  A5: 'A5 - Installation',
  B1: 'B1 - Use',
  B2: 'B2 - Maintenance',
  B3: 'B3 - Repair',
  B4: 'B4 - Replacement',
  B5: 'B5 - Refurbishment',
  B6: 'B6 - Operational energy',
  B7: 'B7 - Operational water',
  C1: 'C1 - Demolition',
  C2: 'C2 - Transport to disposal',
  C3: 'C3 - Waste processing',
  C4: 'C4 - Disposal',
  D: 'D - Beyond system boundary',
};

const STAGE_SHORT: Record<StageKey, string> = {
  A1: 'A1', A2: 'A2', A3: 'A3', A4: 'A4', A5: 'A5',
  B1: 'B1', B2: 'B2', B3: 'B3', B4: 'B4', B5: 'B5', B6: 'B6', B7: 'B7',
  C1: 'C1', C2: 'C2', C3: 'C3', C4: 'C4', D: 'D',
};

function CellValue({ stage, epd, showFull }: { stage: StageKey; epd: EPDData; showFull?: boolean }) {
  const data = epd.gwp.stages[stage];

  if (!data.declared) {
    return (
      <span className="text-amber-500 cursor-help" title="Not declared in EPD (not zero)">—</span>
    );
  }

  if (data.value === null) {
    return <span className="text-gray-400">—</span>;
  }

  const isNegative = data.value < 0;

  return (
    <span className={`font-mono text-sm ${isNegative ? 'text-green-600' : 'text-gray-900'}`}>
      {showFull ? data.value.toFixed(1) : data.value.toFixed(0)}
    </span>
  );
}

function calculateGroupTotal(epd: EPDData, stages: StageKey[]): { value: number | null; hasUndeclared: boolean } {
  let total = 0;
  let hasAny = false;
  let hasUndeclared = false;

  for (const stage of stages) {
    const data = epd.gwp.stages[stage];
    if (data.declared && data.value !== null) {
      total += data.value;
      hasAny = true;
    } else if (!data.declared) {
      hasUndeclared = true;
    }
  }

  return { value: hasAny ? total : null, hasUndeclared };
}

export function ComparisonTable({ products }: ComparisonTableProps) {
  const [expandedStages, setExpandedStages] = useState(false);

  // Find min values for highlighting
  const minA1A3 = Math.min(...products.map(p => p.gwp.totals.A1_A3 ?? Infinity));

  return (
    <div className="space-y-4">
      {/* Toggle for detailed stages */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpandedStages(!expandedStages)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {expandedStages ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Hide stage details
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Show stage details
            </>
          )}
        </button>
      </div>

      {/* Main comparison table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 sticky left-0 bg-gray-50 min-w-48">Product</th>
                <th className="text-center py-3 px-3 font-semibold text-gray-700">
                  <div>Strength</div>
                  <div className="text-xs font-normal text-gray-500">MPa</div>
                </th>
                <th className="text-center py-3 px-3 font-semibold text-gray-700">Location</th>
                <th className="text-center py-3 px-3 font-semibold text-gray-700 bg-blue-50">
                  <div>A1-A3</div>
                  <div className="text-xs font-normal text-gray-500">kg CO₂e/m³</div>
                </th>
                {expandedStages && (
                  <>
                    {STAGE_GROUPS.production.map(stage => (
                      <th key={stage} className="text-center py-3 px-2 font-medium text-gray-600 text-xs" title={STAGE_LABELS[stage]}>
                        {STAGE_SHORT[stage]}
                      </th>
                    ))}
                  </>
                )}
                <th className="text-center py-3 px-3 font-semibold text-gray-700">
                  <div>C1-C4</div>
                  <div className="text-xs font-normal text-gray-500">kg CO₂e/m³</div>
                </th>
                {expandedStages && (
                  <>
                    {STAGE_GROUPS.endOfLife.map(stage => (
                      <th key={stage} className="text-center py-3 px-2 font-medium text-gray-600 text-xs" title={STAGE_LABELS[stage]}>
                        {STAGE_SHORT[stage]}
                      </th>
                    ))}
                  </>
                )}
                <th className="text-center py-3 px-3 font-semibold text-gray-700">
                  <div>D</div>
                  <div className="text-xs font-normal text-gray-500">credit</div>
                </th>
                <th className="text-center py-3 px-3 font-semibold text-gray-700 bg-gray-100">
                  <div>Total*</div>
                  <div className="text-xs font-normal text-gray-500" title="Dash (—) = not declared in EPD, not zero">kg CO₂e/m³</div>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Source</th>
              </tr>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500">
                <td colSpan={expandedStages ? 100 : 8} className="py-1.5 px-4">
                  <span className="text-amber-500">—</span> = not declared in EPD (not zero) ·
                  <span className="text-green-600 ml-2">negative</span> = carbon credit ·
                  <span className="ml-2">*</span> = may be incomplete if stages undeclared
                </td>
              </tr>
            </thead>
            <tbody>
              {products.map((epd, idx) => {
                const productionTotal = calculateGroupTotal(epd, STAGE_GROUPS.production);
                const eolTotal = calculateGroupTotal(epd, STAGE_GROUPS.endOfLife);
                const dValue = epd.gwp.stages.D.declared ? epd.gwp.stages.D.value : null;

                const totalExclD = (productionTotal.value ?? 0) + (eolTotal.value ?? 0);
                const totalInclD = totalExclD + (dValue ?? 0);
                const hasUndeclared = productionTotal.hasUndeclared || eolTotal.hasUndeclared;

                const isLowestA1A3 = epd.gwp.totals.A1_A3 === minA1A3;

                return (
                  <tr key={epd.epd.id} className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    {/* Product info */}
                    <td className="py-3 px-4 sticky left-0 bg-white">
                      <div className="font-medium text-gray-900">{epd.product.name}</div>
                      <div className="text-xs text-gray-500">{epd.product.manufacturer}</div>
                    </td>

                    {/* Strength */}
                    <td className="py-3 px-3 text-center font-medium">
                      {epd.characteristics.compressive_strength.value}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3 text-center text-gray-700">
                      {epd.location.state}
                    </td>

                    {/* A1-A3 Total */}
                    <td className={`py-3 px-3 text-center ${isLowestA1A3 ? 'bg-green-100' : 'bg-blue-50'}`}>
                      <span className="font-mono font-semibold text-lg">
                        {epd.gwp.totals.A1_A3?.toFixed(0) ?? '—'}
                      </span>
                    </td>

                    {/* Production stages detail */}
                    {expandedStages && (
                      <>
                        {STAGE_GROUPS.production.map(stage => (
                          <td key={stage} className="py-3 px-2 text-center">
                            <CellValue stage={stage} epd={epd} />
                          </td>
                        ))}
                      </>
                    )}

                    {/* C1-C4 Total */}
                    <td className="py-3 px-3 text-center">
                      {eolTotal.value !== null ? (
                        <span className="font-mono">
                          {eolTotal.value.toFixed(0)}
                          {eolTotal.hasUndeclared && <span className="text-amber-500">*</span>}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* End of life stages detail */}
                    {expandedStages && (
                      <>
                        {STAGE_GROUPS.endOfLife.map(stage => (
                          <td key={stage} className="py-3 px-2 text-center">
                            <CellValue stage={stage} epd={epd} />
                          </td>
                        ))}
                      </>
                    )}

                    {/* D */}
                    <td className="py-3 px-3 text-center">
                      <CellValue stage="D" epd={epd} />
                    </td>

                    {/* Total */}
                    <td className="py-3 px-3 text-center bg-gray-100">
                      <div>
                        <span className="font-mono font-semibold">
                          {totalInclD.toFixed(0)}
                        </span>
                        {hasUndeclared && (
                          <span className="text-amber-500 ml-0.5" title="Some stages not declared">*</span>
                        )}
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4">
                      <div className="text-xs">
                        <span className="font-mono text-gray-600">{epd.epd.id}</span>
                        <div>
                          <a
                            href={`/pdfs/${epd.epd.source_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            title={`Open ${epd.epd.source_file}`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View PDF
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {/* Source traceability */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">EPD Sources & Verification</h3>
        <div className="grid gap-2 text-xs">
          {products.map(epd => (
            <div key={epd.epd.id} className="flex flex-wrap gap-x-4 gap-y-1 py-2 border-b border-gray-100 last:border-0">
              <span className="font-medium text-gray-900 min-w-40">{epd.product.name}</span>
              <span className="text-gray-600">
                <span className="text-gray-400">Source:</span>{' '}
                <a
                  href={`/pdfs/${epd.epd.source_file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {epd.epd.source_file}
                </a>
              </span>
              <span className="text-gray-600">
                <span className="text-gray-400">Verified by:</span> {epd.epd.verification.verifier}
              </span>
              <span className="text-gray-600">
                <span className="text-gray-400">Valid:</span> {epd.epd.published_date} to {epd.epd.valid_until}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
