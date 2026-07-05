'use client';

import { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EPDData } from '@/lib/types';
import { ComparisonTable } from './ComparisonTable';

interface ComparisonViewProps {
  epds: EPDData[];
  availableStrengths: number[];
  availableLocations: string[];
}

type SortOption = 'name' | 'gwp_a1a3' | 'strength';

export function ComparisonView({ epds, availableStrengths, availableLocations }: ComparisonViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read state from URL
  const selectedStrengths = useMemo(() => {
    const param = searchParams.get('strength');
    if (!param) return [];
    return param.split(',').map(Number).filter(n => !isNaN(n));
  }, [searchParams]);

  const selectedLocations = useMemo(() => {
    const param = searchParams.get('location');
    if (!param) return [];
    return param.split(',');
  }, [searchParams]);

  const sortBy: SortOption = useMemo(() => {
    const param = searchParams.get('sort');
    if (param && ['name', 'gwp_a1a3', 'strength'].includes(param)) {
      return param as SortOption;
    }
    return 'gwp_a1a3';
  }, [searchParams]);

  // Update URL helper
  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : '/', { scroll: false });
  }, [searchParams, router]);

  const toggleStrength = (strength: number) => {
    const newStrengths = selectedStrengths.includes(strength)
      ? selectedStrengths.filter(s => s !== strength)
      : [...selectedStrengths, strength];
    updateParams({ strength: newStrengths.length ? newStrengths.join(',') : null });
  };

  const toggleLocation = (location: string) => {
    const newLocations = selectedLocations.includes(location)
      ? selectedLocations.filter(l => l !== location)
      : [...selectedLocations, location];
    updateParams({ location: newLocations.length ? newLocations.join(',') : null });
  };

  const handleSortChange = (newSort: SortOption) => {
    updateParams({ sort: newSort });
  };

  const clearFilters = () => {
    updateParams({ strength: null, location: null });
  };

  const filteredEpds = useMemo(() => {
    return epds.filter(epd => {
      if (selectedStrengths.length > 0 && !selectedStrengths.includes(epd.characteristics.compressive_strength.value)) {
        return false;
      }
      if (selectedLocations.length > 0 && !selectedLocations.includes(epd.location.state)) {
        return false;
      }
      return true;
    });
  }, [epds, selectedStrengths, selectedLocations]);

  const sortedEpds = useMemo(() => {
    return [...filteredEpds].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.product.name.localeCompare(b.product.name);
        case 'gwp_a1a3':
          return (a.gwp.totals.A1_A3 ?? Infinity) - (b.gwp.totals.A1_A3 ?? Infinity);
        case 'strength':
          return a.characteristics.compressive_strength.value - b.characteristics.compressive_strength.value;
        default:
          return 0;
      }
    });
  }, [filteredEpds, sortBy]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Filters</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Compressive Strength (MPa)</label>
            <div className="flex flex-wrap gap-2">
              {availableStrengths.map(strength => (
                <button
                  key={strength}
                  onClick={() => toggleStrength(strength)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedStrengths.includes(strength)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {strength} MPa
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Manufacturing Location</label>
            <div className="flex flex-wrap gap-2">
              {availableLocations.map(location => (
                <button
                  key={location}
                  onClick={() => toggleLocation(location)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedLocations.includes(location)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="w-full text-sm border border-gray-300 rounded px-3 py-1.5"
            >
              <option value="gwp_a1a3">Carbon (A1-A3) - Low to High</option>
              <option value="strength">Strength - Low to High</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
        {(selectedStrengths.length > 0 || selectedLocations.length > 0) && (
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredEpds.length} of {epds.length} products
      </div>

      {/* Comparison Table */}
      {sortedEpds.length > 0 ? (
        <ComparisonTable products={sortedEpds} />
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          No products match your filter criteria. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}
