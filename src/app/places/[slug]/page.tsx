import { getPlaceBySlug } from '@/lib/api/places';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Accordion } from '@/components/mountain/Accordion';
import { Gallery } from '@/components/mountain/Gallery';

interface PlacePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    return { title: 'Place Not Found' };
  }

  return {
    title: place.seo_title || place.title,
    description: place.seo_description || place.content.subtitle || place.title,
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    notFound();
  }

  // Prepare accordion sections from content
  const accordionSections = place.content.sections?.map(section => ({
    title: section.title,
    content: (
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: section.content }}
      />
    ),
  })) || [];

  // Get background image URL if exists
  const backgroundImageUrl = place.content.background_image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${place.content.background_image_path}`
    : null;

  // Convert gallery images to format expected by Gallery component
  const galleryImages = place.content.gallery_images?.map((imagePath, index) => ({
    id: `gallery-${index}`,
    storage_path: imagePath,
    title: `${place.title} - Image ${index + 1}`,
    caption: null,
    photographer_credit: null,
    alt_text: `${place.title} - Image ${index + 1}`,
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Background Image */}
      {backgroundImageUrl && (
        <div className="fixed inset-0 z-0">
          <img
            src={backgroundImageUrl}
            alt={place.title}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-800/90" />
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold hover:opacity-80 transition-opacity">
              <span className="text-green-400">EXPLORE</span> the Mournes
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <Link
              href="/places"
              className="text-green-400 hover:text-green-300 text-sm mb-4 inline-block"
            >
              ← All Places
            </Link>
            <h2 className="text-5xl md:text-6xl font-bold mb-4">{place.title}</h2>
            {place.content.subtitle && (
              <p className="text-xl text-slate-300 mt-4">
                {place.content.subtitle}
              </p>
            )}
          </div>

          {/* Accordion Sections */}
          {accordionSections.length > 0 && (
            <Accordion sections={accordionSections} className="mb-12" />
          )}

          {/* Image Gallery */}
          {galleryImages.length > 0 && (
            <div className="mb-12">
              <Gallery images={galleryImages} />
            </div>
          )}

          {/* Back Link */}
          <div className="mt-12 text-center">
            <Link
              href="/places"
              className="inline-block bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              ← View All Places
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-slate-400 text-sm">
          <p>Built with Next.js 14 + Supabase + Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
