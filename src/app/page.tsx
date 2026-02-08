import Link from "next/link";
import { getAllMountains } from '@/lib/api/mountains';

export default async function Home() {
  const allMountains = await getAllMountains();

  // Get featured mountains (highest peaks)
  const featuredMountains = allMountains
    .sort((a, b) => (b.height || 0) - (a.height || 0))
    .slice(0, 6);

  const totalMountains = allMountains.length;
  const highestPeak = Math.max(...allMountains.map(m => m.height || 0));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold">
                <span className="text-green-400">EXPLORE</span> the Mournes
              </h1>
              <p className="text-slate-400 mt-1 text-sm">Northern Ireland's highest peaks</p>
            </div>
            <nav className="flex gap-4 items-center">
              <Link
                href="/mountains"
                className="text-slate-300 hover:text-green-400 px-3 py-2 rounded-lg transition-colors"
              >
                Mountains
              </Link>
              <Link
                href="/activities"
                className="text-slate-300 hover:text-green-400 px-3 py-2 rounded-lg transition-colors"
              >
                Activities
              </Link>
              <Link
                href="/places"
                className="text-slate-300 hover:text-green-400 px-3 py-2 rounded-lg transition-colors"
              >
                Places
              </Link>
              <Link
                href="/contact"
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Text */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Discover the <span className="text-green-400">Mourne Mountains</span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Explore Northern Ireland's highest peaks with detailed guides, interactive maps,
              photo galleries, and hiking information for all {totalMountains} mountains.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/mountains"
                className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                Browse All Peaks
                <span>→</span>
              </Link>
              <Link
                href="/mountains/slieve-donard"
                className="bg-slate-700 hover:bg-slate-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105"
              >
                View Slieve Donard
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">{totalMountains}</div>
              <div className="text-slate-300">Mountain Peaks</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">{highestPeak}m</div>
              <div className="text-slate-300">Highest Summit</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">89</div>
              <div className="text-slate-300">Photo Gallery</div>
            </div>
          </div>

          {/* Featured Mountains */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold">Highest Peaks</h3>
              <Link
                href="/mountains"
                className="text-green-400 hover:text-green-300 font-semibold"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMountains.map((mountain) => (
                <Link
                  key={mountain.id}
                  href={`/mountains/${mountain.slug}`}
                  className="group bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-green-500 hover:bg-slate-800/70 transition-all"
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
                      Explore →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-4">📸</div>
              <h4 className="text-xl font-bold mb-2">Photo Galleries</h4>
              <p className="text-slate-400">
                Browse stunning mountain photography with full-screen lightbox viewing
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-4">🗺️</div>
              <h4 className="text-xl font-bold mb-2">Interactive Maps</h4>
              <p className="text-slate-400">
                Find starting points and plan your route with detailed terrain maps
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-4">⛰️</div>
              <h4 className="text-xl font-bold mb-2">Detailed Guides</h4>
              <p className="text-slate-400">
                Learn about terrain, views, and access points for every peak
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-slate-400">Built with Next.js 14 + Supabase + Tailwind CSS</p>
              <p className="text-slate-500 text-sm mt-1">
                Modernizing the classic ExploreTheMournes website
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/mountains" className="text-slate-400 hover:text-green-400 transition-colors">
                Mountains
              </Link>
              <Link href="/activities" className="text-slate-400 hover:text-green-400 transition-colors">
                Activities
              </Link>
              <Link href="/places" className="text-slate-400 hover:text-green-400 transition-colors">
                Places
              </Link>
              <Link href="/contact" className="text-slate-400 hover:text-green-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
