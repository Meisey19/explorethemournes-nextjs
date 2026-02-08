import Link from 'next/link';
import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact | Explore the Mournes',
  description: 'Get in touch with us about the Mourne Mountains, submit photos, report corrections, or ask questions.',
};

export default function ContactPage() {
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
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <Link
              href="/"
              className="text-green-400 hover:text-green-300 text-sm mb-4 inline-block"
            >
              ← Back to Home
            </Link>
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Contact Us</h2>
            <p className="text-xl text-slate-300">
              Have questions about the Mourne Mountains? Want to share your photos? Get in touch!
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700 mb-8">
            <h3 className="text-xl font-bold mb-4">How can we help?</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>Questions about specific mountains or hiking routes</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>Submit your mountain photography for the gallery</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>Report corrections or suggest updates to mountain information</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>General enquiries about the website or Mournes area</span>
              </li>
            </ul>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700">
            <ContactForm />
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
