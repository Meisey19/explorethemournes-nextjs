import { getAllMountains } from '@/lib/api/mountains';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Mountains | Explore the Mournes',
  description: 'Browse all 56 peaks in the Mourne Mountains, Northern Ireland',
};

export default async function MountainsPage() {
  const mountains = await getAllMountains();

  // Group mountains by height ranges
  const highPeaks = mountains.filter((m) => m.height && m.height >= 700);
  const mediumPeaks = mountains.filter((m) => m.height && m.height >= 500 && m.height < 700);
  const lowerPeaks = mountains.filter((m) => m.height && m.height < 500);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold hover:opacity-80 transition-opacity">
              <span className="text-green-400">EXPLORE</span> the Mournes
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              All Mountains
            </h2>
            <p className="text-xl text-slate-300">
              Discover all {mountains.length} peaks in the Mourne Mountains
            </p>
          </div>

          {/* High Peaks (700m+) */}
          {highPeaks.length > 0 && (
            <section className="mb-12">
              <h3 className="text-3xl font-bold text-green-400 mb-6">
                High Peaks (700m+)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {highPeaks.map((mountain) => (
                  <MountainCard key={mountain.id} mountain={mountain} />
                ))}
              </div>
            </section>
          )}

          {/* Medium Peaks (500-699m) */}
          {mediumPeaks.length > 0 && (
            <section className="mb-12">
              <h3 className="text-3xl font-bold text-green-400 mb-6">
                Medium Peaks (500-699m)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediumPeaks.map((mountain) => (
                  <MountainCard key={mountain.id} mountain={mountain} />
                ))}
              </div>
            </section>
          )}

          {/* Lower Peaks (<500m) */}
          {lowerPeaks.length > 0 && (
            <section className="mb-12">
              <h3 className="text-3xl font-bold text-green-400 mb-6">
                Lower Peaks (&lt;500m)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowerPeaks.map((mountain) => (
                  <MountainCard key={mountain.id} mountain={mountain} />
                ))}
              </div>
            </section>
          )}

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {mountains.length}
              </div>
              <div className="text-slate-300">Total Peaks</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {highPeaks.length}
              </div>
              <div className="text-slate-300">High Peaks (700m+)</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {Math.max(...mountains.map((m) => m.height || 0))}m
              </div>
              <div className="text-slate-300">Highest Peak</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-slate-400 text-sm">
          <p>Built with Next.js 14 + Supabase + Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}

// Mountain Card Component
function MountainCard({ mountain }: { mountain: any }) {
  return (
    <Link
      href={`/mountains/${mountain.slug}`}
      className="group block bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-green-500 hover:bg-slate-800/70 transition-all"
    >
      <h4 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors mb-2">
        {mountain.name}
      </h4>
      {mountain.gaelic_name && (
        <p className="text-sm text-green-400 mb-3">{mountain.gaelic_name}</p>
      )}
      <div className="flex items-center justify-between">
        {mountain.height && (
          <span className="text-slate-300">
            <strong>{mountain.height}m</strong>
          </span>
        )}
        <span className="text-green-400 text-sm group-hover:translate-x-1 transition-transform inline-block">
          View →
        </span>
      </div>
      {mountain.region && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-400 capitalize">{mountain.region}</p>
        </div>
      )}
    </Link>
  );
}
