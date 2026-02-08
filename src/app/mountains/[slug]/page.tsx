import { getMountainBySlug } from '@/lib/api/mountains';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Accordion } from '@/components/mountain/Accordion';
import { Gallery } from '@/components/mountain/Gallery';
import { InteractiveMap } from '@/components/mountain/InteractiveMap';

interface MountainPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: MountainPageProps): Promise<Metadata> {
  const { slug } = await params;
  const mountain = await getMountainBySlug(slug);

  if (!mountain) {
    return {
      title: 'Mountain Not Found',
    };
  }

  return {
    title: `${mountain.name} | ${mountain.gaelic_name || 'Explore the Mournes'}`,
    description: mountain.meaning || mountain.views || `Discover ${mountain.name} in the Mourne Mountains`,
  };
}

export default async function MountainPage({ params }: MountainPageProps) {
  const { slug } = await params;
  const mountain = await getMountainBySlug(slug);

  if (!mountain) {
    notFound();
  }

  // Prepare accordion sections
  const accordionSections = [
    {
      title: 'Profile',
      defaultOpen: true,
      content: (
        <div className="space-y-4">
          {mountain.height && (
            <div>
              <strong className="text-green-400">Height:</strong> {mountain.height}m
            </div>
          )}
          {mountain.terrain && (
            <div>
              <strong className="text-green-400">Terrain:</strong> {mountain.terrain}
            </div>
          )}
          {mountain.views && (
            <div>
              <strong className="text-green-400">Views:</strong> {mountain.views}
            </div>
          )}
          {mountain.region && (
            <div>
              <strong className="text-green-400">Region:</strong> {mountain.region}
            </div>
          )}
        </div>
      ),
    },
    ...(mountain.photographer_credit
      ? [
          {
            title: 'Photograph',
            content: (
              <div className="text-slate-300 italic">{mountain.photographer_credit}</div>
            ),
          },
        ]
      : []),
    ...(mountain.starting_points.length > 0
      ? [
          {
            title: 'Where can I start from?',
            content: (
              <div className="space-y-4">
                {mountain.starting_points.map((point, index) => (
                  <div key={point.id} className="pb-4 border-b border-slate-700 last:border-0">
                    <h4 className="font-semibold text-lg text-white mb-2">
                      {point.name}
                    </h4>
                    {point.description && (
                      <p className="text-slate-300 mb-2">{point.description}</p>
                    )}
                    {point.difficulty && (
                      <p className="text-sm text-slate-400">
                        <strong>Difficulty:</strong> {point.difficulty}
                      </p>
                    )}
                    {point.google_maps_url && (
                      <a
                        href={point.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-green-400 hover:text-green-300 text-sm underline"
                      >
                        View in Google Maps →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ),
          },
        ]
      : []),
  ];

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
        <div className="max-w-5xl mx-auto">
          {/* Mountain Header */}
          <div className="mb-8">
            <Link
              href="/mountains"
              className="text-green-400 hover:text-green-300 text-sm mb-4 inline-block"
            >
              ← All Mountains
            </Link>
            <h2 className="text-5xl md:text-6xl font-bold mb-4">{mountain.name}</h2>
            {mountain.gaelic_name && (
              <p className="text-2xl md:text-3xl text-green-400 mb-2">
                {mountain.gaelic_name}
                {mountain.meaning && (
                  <span className="text-slate-300 ml-2">— {mountain.meaning}</span>
                )}
              </p>
            )}
            {mountain.height && (
              <p className="text-xl text-slate-400 mt-4">
                Elevation: <span className="text-white font-semibold">{mountain.height}m</span>
              </p>
            )}
          </div>

          {/* Accordion Sections */}
          <Accordion sections={accordionSections} className="mb-12" />

          {/* Image Gallery */}
          {mountain.images.length > 0 && (
            <div className="mb-12">
              <Gallery images={mountain.images} />
            </div>
          )}

          {/* Interactive Map */}
          {mountain.starting_points.length > 0 && (
            <div className="mb-12">
              <InteractiveMap startingPoints={mountain.starting_points} />
            </div>
          )}

          {/* Back Link */}
          <div className="mt-12 text-center">
            <Link
              href="/mountains"
              className="inline-block bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              ← View All Mountains
            </Link>
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
