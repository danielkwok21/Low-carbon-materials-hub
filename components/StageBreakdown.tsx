'use client';

import { EPDData, StageKey, STAGE_GROUPS, GWPStages } from '@/lib/types';

interface StageBreakdownProps {
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

const GROUP_INFO = [
  { key: 'production', name: 'Production Stage', stages: STAGE_GROUPS.production, color: 'blue' },
  { key: 'use', name: 'Use Stage', stages: STAGE_GROUPS.use, color: 'gray' },
  { key: 'endOfLife', name: 'End of Life', stages: STAGE_GROUPS.endOfLife, color: 'orange' },
  { key: 'beyond', name: 'Beyond System', stages: STAGE_GROUPS.beyond, color: 'green' },
];

function CellValue({ stage, epd }: { stage: StageKey; epd: EPDData }) {
  const data = epd.gwp.stages[stage];

  if (!data.declared) {
    return (
      <div className="text-center">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          Not declared
        </span>
      </div>
    );
  }

  if (data.value === null) {
    return <span className="text-gray-400">—</span>;
  }

  const isNegative = data.value < 0;

  return (
    <span className={`font-mono ${isNegative ? 'text-green-600' : 'text-gray-900'}`}>
      {data.value.toFixed(1)}
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

export function StageBreakdown({ products }: StageBreakdownProps) {
  // Check if products have comparable data
  const allHaveA1A3 = products.every(p =>
    STAGE_GROUPS.production.slice(0, 3).every(s => p.gwp.stages[s].declared)
  );

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-mono text-gray-900">123.4</span>
          <span className="text-gray-600">= declared value (kg CO₂e)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Not declared
          </span>
          <span className="text-gray-600">= stage not reported in EPD</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-green-600">-12.3</span>
          <span className="text-gray-600">= carbon benefit/credit</span>
        </div>
      </div>

      {/* Comparability warning if applicable */}
      {!allHaveA1A3 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <strong>Comparability note:</strong> Not all selected products have the same stages declared.
          Comparing totals may be misleading when some stages are not reported.
        </div>
      )}

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-medium text-gray-600 w-48">Stage</th>
              {products.map(epd => (
                <th key={epd.epd.id} className="text-center py-2 px-3 font-medium text-gray-900 min-w-32">
                  <div>{epd.product.name}</div>
                  <div className="font-normal text-xs text-gray-500">{epd.characteristics.compressive_strength.value} MPa</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUP_INFO.map(group => (
              <>
                {/* Group header */}
                <tr key={`${group.key}-header`} className="bg-gray-50">
                  <td colSpan={products.length + 1} className="py-2 px-3 font-semibold text-gray-700">
                    {group.name}
                  </td>
                </tr>
                {/* Stage rows */}
                {group.stages.map(stage => (
                  <tr key={stage} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-600">{STAGE_LABELS[stage]}</td>
                    {products.map(epd => (
                      <td key={`${epd.epd.id}-${stage}`} className="py-2 px-3 text-center">
                        <CellValue stage={stage} epd={epd} />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Group subtotal */}
                <tr key={`${group.key}-total`} className="border-b border-gray-200 bg-gray-50/50">
                  <td className="py-2 px-3 font-medium text-gray-700">Subtotal</td>
                  {products.map(epd => {
                    const { value, hasUndeclared } = calculateGroupTotal(epd, group.stages);
                    return (
                      <td key={`${epd.epd.id}-${group.key}-total`} className="py-2 px-3 text-center">
                        {value !== null ? (
                          <div>
                            <span className={`font-mono font-medium ${value < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                              {value.toFixed(1)}
                            </span>
                            {hasUndeclared && (
                              <span className="text-amber-500 ml-1" title="Some stages not declared">*</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </>
            ))}
          </tbody>
          <tfoot>
            {/* Total excluding D */}
            <tr className="border-t-2 border-gray-300 bg-gray-100">
              <td className="py-3 px-3 font-semibold text-gray-800">Total (excl. D)</td>
              {products.map(epd => {
                const productionTotal = calculateGroupTotal(epd, STAGE_GROUPS.production);
                const eolTotal = calculateGroupTotal(epd, STAGE_GROUPS.endOfLife);
                const hasValue = productionTotal.value !== null || eolTotal.value !== null;
                const total = (productionTotal.value ?? 0) + (eolTotal.value ?? 0);
                const hasUndeclared = productionTotal.hasUndeclared || eolTotal.hasUndeclared;

                return (
                  <td key={`${epd.epd.id}-total`} className="py-3 px-3 text-center">
                    {hasValue ? (
                      <div>
                        <span className="font-mono font-bold text-gray-900">{total.toFixed(1)}</span>
                        {hasUndeclared && (
                          <span className="text-amber-500 ml-1" title="Some stages not declared - total may be incomplete">*</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
            {/* Total including D */}
            <tr className="bg-gray-100">
              <td className="py-3 px-3 font-semibold text-gray-800">Total (incl. D)</td>
              {products.map(epd => {
                const productionTotal = calculateGroupTotal(epd, STAGE_GROUPS.production);
                const eolTotal = calculateGroupTotal(epd, STAGE_GROUPS.endOfLife);
                const dValue = epd.gwp.stages.D.declared ? epd.gwp.stages.D.value : null;

                const hasValue = productionTotal.value !== null || eolTotal.value !== null;
                const total = (productionTotal.value ?? 0) + (eolTotal.value ?? 0) + (dValue ?? 0);
                const hasUndeclared = productionTotal.hasUndeclared || eolTotal.hasUndeclared || !epd.gwp.stages.D.declared;

                return (
                  <td key={`${epd.epd.id}-total-d`} className="py-3 px-3 text-center">
                    {hasValue ? (
                      <div>
                        <span className="font-mono font-bold text-gray-900">{total.toFixed(1)}</span>
                        {hasUndeclared && (
                          <span className="text-amber-500 ml-1" title="Some stages not declared - total may be incomplete">*</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footnote */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>* Indicates some lifecycle stages are not declared. Totals marked with * may be incomplete and should be compared with caution.</p>
        <p>B1-B7 (Use stage) is typically not declared for concrete products as it depends on the specific building application.</p>
      </div>

      {/* Source traceability */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Source Documents</h3>
        <div className="grid gap-2">
          {products.map(epd => (
            <div key={epd.epd.id} className="text-xs text-gray-600">
              <span className="font-medium">{epd.product.name}:</span>{' '}
              <span className="font-mono">{epd.epd.source_file}</span>
              {' · '}
              EPD ID: {epd.epd.id}
              {' · '}
              Verified by: {epd.epd.verification.verifier}
              {' · '}
              Valid: {epd.epd.published_date} to {epd.epd.valid_until}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
