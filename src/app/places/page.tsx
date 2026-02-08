import Link from 'next/link';
import { getAllPlaces } from '@/lib/api/places';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Places of Interest | Explore the Mournes',
  description: 'Discover the Mourne Wall, Silent Valley, Game of Thrones locations, and other places of interest in the Mourne Mountains.',
};

export default async function PlacesPage() {
  const places = await getAllPlaces();

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
            <Link
              href="/"
              className="text-green-400 hover:text-green-300 text-sm mb-4 inline-block"
            >
              ← Back to Home
            </Link>
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Places of Interest</h2>
            <p className="text-xl text-slate-300">
              Explore the Mourne Wall, Silent Valley, Game of Thrones filming locations, and other notable sites.
            </p>
          </div>

          {/* Places Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <Link
                key={place.id}
                href={`/places/${place.slug}`}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-green-500 hover:bg-slate-800/70 transition-all"
              >
                <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors mb-2">
                  {place.title}
                </h3>
                {place.content.subtitle && (
                  <p className="text-sm text-slate-300 mb-3">
                    {place.content.subtitle}
                  </p>
                )}
                <span className="text-green-400 text-sm group-hover:translate-x-1 transition-transform inline-block">
                  Learn more →
                </span>
              </Link>
            ))}
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
