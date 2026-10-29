# Pixora AI — Intelligent Visual File Organizer

> *"Every memory, beautifully organized."*
> 
> Turn thousands of scattered photos and visual files into a searchable, beautifully organized visual library with AI.

---

## 🌸 Product Overview

**Pixora AI** transforms disordered camera rolls, downloads, invoices, and screenshots into a structured, searchable visual workspace. Built with a signature **Pink + Purple + White** design palette, it delivers a creative gallery experience rather than an enterprise admin dashboard.

### Core Capabilities
- **Visual Photo Mosaic**: Responsive masonry and justified grids supporting mixed aspect ratios, high-performance lazy loading, full-screen lightbox viewer with zoom controls, and a detailed EXIF / AI inspector drawer.
- **8-Stage AI Organization Engine**:
  1. *Scan*: Reads file inventory, dimensions, and SHA-256 byte hashes.
  2. *Analyze*: Extracts visual subjects, color palettes, and EXIF camera parameters.
  3. *Classify*: Assigns primary and secondary categories (Nature, Travel, People, Food, Documents, Screenshots, Products, Events).
  4. *Group*: Clusters photos into thematic smart albums (e.g., *Alpine & Wilderness*, *Wanderlust Chronicles*).
  5. *Detect Duplicates*: Finds exact content hash duplicates and perceptual similarities (series shots, cropped variants).
  6. *Review*: Presents a reversible, non-destructive proposal for user confirmation.
  7. *Organize*: Applies virtual album assignments and enriched search tags.
  8. *Report*: Logs activity and calculates library statistics.
- **Natural Language Search**: Query photos using terms like *"photos from my last trip"*, *"sunset pictures"*, *"coffee & breakfast"*, or *"screenshots containing receipts"*.
- **Duplicate Review**: Side-by-side comparison of file sizes, resolutions, and timestamps with keeper selection and explicit deletion confirmation.
- **Dual Mode Operation**: Seamlessly operates in **Local Demo Mode** (using client state & IndexedDB with preloaded high-resolution photos) or **Supabase Cloud Mode** (using PostgreSQL database, Row Level Security, and Supabase Storage).

---

## 🎨 Color System & Design Identity

- **White**: `#FFFFFF` (Dominant clean surface)
- **Main Background**: `#FCFAFF` (Warm luminous canvas)
- **Soft Lavender**: `#F5EEFF` (Subtle card fills & active states)
- **Lavender Border**: `#E9DDF7` (Delicate structural lines)
- **Light Pink**: `#FFF0F7` (Sparkle badge backgrounds & tag highlights)
- **Primary Purple**: `#9333EA` (Key calls to action & icons)
- **Deep Purple**: `#6D28D9` (Headings & active badges)
- **Bright Pink**: `#EC4899` (Brand accents & AI shimmer gradients)
- **Rose Pink**: `#F472B6` (Secondary glow elements)
- **Main Text**: `#241735` (High-contrast typography)
- **Secondary Text**: `#7A6A88` (Readable captions)
- **Muted Text**: `#A398AF` (Timestamps & metadata)

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript (Strict typing)
- **Styling**: Tailwind CSS v4 & custom glassmorphism utilities
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL 17 with Row Level Security policies)
- **Object Storage**: Supabase Storage (`photos` bucket)
- **AI Processing**: Provider-independent interface (Google Gemini API ready + built-in smart rule engine fallback)
- **Testing**: Vitest automated test suite

---

## 🚀 Getting Started & Deployment Guide

Follow these 10 steps to run the application locally or deploy to Vercel:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure the following variables are defined:
```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://izczqhevfwmggjggckre.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_GRSnB_ITm-tHNvNx-ACIyQ_KbEEx12p
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_GRSnB_ITm-tHNvNx-ACIyQ_KbEEx12p

# Local/Production App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Direct Database Connection String (for migrations)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.izczqhevfwmggjggckre.supabase.co:5432/postgres

# Optional Server AI Provider Key (Google Gemini)
GEMINI_API_KEY=
```

### 3. Create or Link Your Supabase Project
If linking to an existing Supabase project:
```bash
npx supabase link --project-ref izczqhevfwmggjggckre
```

### 4. Run Database Migrations
Migrations are stored in `supabase/migrations/20261029000000_initial_schema.sql`. You can execute them directly:
```bash
node scripts/migrate.mjs
```
This provisions:
- `profiles`
- `photos` (with content hash, EXIF metadata, AI caption & categories)
- `albums` & `album_photos` (virtual non-destructive links)
- `photo_tags`
- `favorites`
- `organization_jobs`
- `activity_log`
- Row Level Security (RLS) policies and performance indexes

### 5. Storage Setup
The migration script automatically initializes the public `photos` storage bucket with appropriate access policies.

### 6. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Run Automated Tests
```bash
npm run test
```
Runs the Vitest test suite verifying metadata classification, hash duplicate detection, perceptual similarity grouping, and non-destructive album deletion.

### 8. Validate the Production Build
```bash
npm run build
```
Generates the optimized static and server-rendered production bundle.

### 9. Push to GitHub
```bash
git add .
git commit -m "feat: complete Pixora AI visual organizer application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pixora-ai.git
git push -u origin main
```

### 10. Deploy on Vercel
1. Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your `pixora-ai` repository.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `GEMINI_API_KEY` (optional)
4. Click **Deploy**. Vercel will automatically build and publish your app.

---

## 🔒 Safety and Non-Destructive Design

Pixora AI is designed with strict data preservation rules:
- **Never deletes files automatically**: All AI proposals require explicit user review and confirmation before applying virtual tags or albums.
- **Virtual Albums**: Deleting an album never deletes its underlying photos.
- **Duplicate Review**: Both copies are displayed side-by-side with file size, resolution, and date; users explicitly choose which copy to keep.
- **Activity History**: Every upload, favorite, organization job, and album assignment is recorded in the activity log.

---

## 📄 License
MIT License. Created for the Pixora AI Visual Workspace.
