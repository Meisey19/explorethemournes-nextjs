# ExploreTheMournes - Modern Next.js PWA

A modern, mobile-first Progressive Web App for exploring the Mourne Mountains in Northern Ireland.

## 🚀 Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Maps:** Mapbox GL JS
- **Images:** yet-another-react-lightbox
- **UI Components:** Headless UI + Heroicons
- **PWA:** Service Workers with offline support

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 20.9.0 or higher** (your current version is 20.1.0 - consider upgrading)
- **npm** or **yarn** package manager
- A **Supabase** account (free tier available)
- A **Mapbox** account (free tier available)
- Optional: **Resend** account for contact form emails

## 🛠️ Setup Instructions

### 1. Supabase Project Setup

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize (takes ~2 minutes)
3. Go to **Project Settings > API** and copy:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - `service_role` key (SUPABASE_SERVICE_KEY) - keep this secret!

4. Go to **SQL Editor** and run the `supabase-schema.sql` file to create all tables

5. Go to **Storage** and create three buckets:
   - `mountain-images` (public, 10MB file size limit)
   - `backgrounds` (public, 20MB file size limit)
   - `gpx-files` (public, 5MB file size limit)

### 2. Mapbox Setup

1. Go to [https://mapbox.com](https://mapbox.com) and create a free account
2. Go to **Account > Access Tokens**
3. Copy your default public token or create a new one
4. Paste it as `NEXT_PUBLIC_MAPBOX_TOKEN` in your `.env.local`

### 3. Environment Variables

Create a `.env.local` file in the project root (copy from `.env.local.example`):

```bash
cp .env.local.example .env.local
```

Then fill in your actual values from the steps above.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
explorethemournes-nextjs/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   └── types/                 # TypeScript types
├── scripts/                   # Migration scripts
├── supabase-schema.sql        # Database schema
└── .env.local                 # Environment variables (create this!)
```

## 🔄 Next Steps

1. **Set up Supabase** - Create project and run schema
2. **Configure environment variables** - Copy `.env.local.example` to `.env.local`
3. **Run migration scripts** - Import content from old site (coming next)
4. **Build components** - Create mountain pages, navigation, etc.

## 📖 Full Documentation

See the complete documentation and implementation plan at:
`C:\\Users\\miche\\.claude\\plans\\scalable-wobbling-sloth.md`

---

**Original Site:** `c:\\inetpub\\explorethemournes`
**New Project:** `C:\\Users\\miche\\explorethemournes-nextjs`

Built with ❤️ using Next.js, Supabase, and modern web technologies.
