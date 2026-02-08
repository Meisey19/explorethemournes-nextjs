import Link from 'next/link';
import { getAllActivities } from '@/lib/api/activities';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activities | Explore the Mournes',
  description: 'Discover hiking, fell running, triathlons, and other outdoor activities in the Mourne Mountains.',
};

export default async function ActivitiesPage() {
  const activities = await getAllActivities();

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
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Activities</h2>
            <p className="text-xl text-slate-300">
              Explore hiking, fell running, triathlons, and other outdoor activities in the Mournes.
            </p>
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={`/activities/${activity.slug}`}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-green-500 hover:bg-slate-800/70 transition-all"
              >
                <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors mb-2">
                  {activity.title}
                </h3>
                {activity.content.subtitle && (
                  <p className="text-sm text-slate-300 mb-3">
                    {activity.content.subtitle}
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
