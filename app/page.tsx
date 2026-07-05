import { Suspense } from 'react';
import { loadAllEPDs, getUniqueStrengths, getUniqueLocations } from '@/lib/data';
import { ComparisonView } from '@/components/ComparisonView';

export default function Home() {
  const epds = loadAllEPDs();
  const strengths = getUniqueStrengths(epds);
  const locations = getUniqueLocations(epds);

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Low Carbon Materials Hub
        </h1>
        <p className="text-gray-600">
          Compare concrete products by embodied carbon across their full life cycle.
          All values per 1 m³ of concrete.
        </p>
      </header>

      <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
        <ComparisonView
          epds={epds}
          availableStrengths={strengths}
          availableLocations={locations}
        />
      </Suspense>
    </main>
  );
}
