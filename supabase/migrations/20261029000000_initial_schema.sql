-- Migration: 20261029000000_initial_schema.sql
-- Pixora AI Database Schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PHOTOS
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  width INT,
  height INT,
  captured_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  content_hash TEXT,
  ai_caption TEXT,
  ai_category TEXT,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ALBUMS
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL,
  category TEXT,
  is_smart BOOLEAN DEFAULT false,
  smart_rule JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. ALBUM_PHOTOS
CREATE TABLE IF NOT EXISTS public.album_photos (
  album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (album_id, photo_id)
);

-- 5. PHOTO_TAGS
CREATE TABLE IF NOT EXISTS public.photo_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'ai',
  confidence REAL NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_id, photo_id)
);

-- 7. ORGANIZATION_JOBS
CREATE TABLE IF NOT EXISTS public.organization_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_items INT NOT NULL DEFAULT 0,
  processed_items INT NOT NULL DEFAULT 0,
  failed_items INT NOT NULL DEFAULT 0,
  summary JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 8. ACTIVITY_LOG
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_photos_owner ON public.photos(owner_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded ON public.photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_captured ON public.photos(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_hash ON public.photos(content_hash);
CREATE INDEX IF NOT EXISTS idx_photos_category ON public.photos(ai_category);

CREATE INDEX IF NOT EXISTS idx_albums_owner ON public.albums(owner_id);
CREATE INDEX IF NOT EXISTS idx_album_photos_album ON public.album_photos(album_id);
CREATE INDEX IF NOT EXISTS idx_album_photos_photo ON public.album_photos(photo_id);

CREATE INDEX IF NOT EXISTS idx_photo_tags_photo ON public.photo_tags(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_tags_tag ON public.photo_tags(tag);

CREATE INDEX IF NOT EXISTS idx_favorites_owner ON public.favorites(owner_id);
CREATE INDEX IF NOT EXISTS idx_activity_owner ON public.activity_log(owner_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- POLICIES: Users can select/insert/update/delete their own rows or when owner_id IS NULL (for guest/demo fallback)
DO $$
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

  -- Photos
  DROP POLICY IF EXISTS "Users can view own photos" ON public.photos;
  CREATE POLICY "Users can view own photos" ON public.photos FOR SELECT USING (auth.uid() = owner_id OR owner_id IS NULL);
  DROP POLICY IF EXISTS "Users can insert photos" ON public.photos;
  CREATE POLICY "Users can insert photos" ON public.photos FOR INSERT WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);
  DROP POLICY IF EXISTS "Users can update own photos" ON public.photos;
  CREATE POLICY "Users can update own photos" ON public.photos FOR UPDATE USING (auth.uid() = owner_id OR owner_id IS NULL);
  DROP POLICY IF EXISTS "Users can delete own photos" ON public.photos;
  CREATE POLICY "Users can delete own photos" ON public.photos FOR DELETE USING (auth.uid() = owner_id OR owner_id IS NULL);

  -- Albums
  DROP POLICY IF EXISTS "Users can view own albums" ON public.albums;
  CREATE POLICY "Users can view own albums" ON public.albums FOR SELECT USING (auth.uid() = owner_id OR owner_id IS NULL);
  DROP POLICY IF EXISTS "Users can insert albums" ON public.albums;
  CREATE POLICY "Users can insert albums" ON public.albums FOR INSERT WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);
  DROP POLICY IF EXISTS "Users can update own albums" ON public.albums;
  CREATE POLICY "Users can update own albums" ON public.albums FOR UPDATE USING (auth.uid() = owner_id OR owner_id IS NULL);
  DROP POLICY IF EXISTS "Users can delete own albums" ON public.albums;
  CREATE POLICY "Users can delete own albums" ON public.albums FOR DELETE USING (auth.uid() = owner_id OR owner_id IS NULL);

  -- Album Photos
  DROP POLICY IF EXISTS "Users can view album photos" ON public.album_photos;
  CREATE POLICY "Users can view album photos" ON public.album_photos FOR ALL USING (true);

  -- Photo Tags
  DROP POLICY IF EXISTS "Users can view photo tags" ON public.photo_tags;
  CREATE POLICY "Users can view photo tags" ON public.photo_tags FOR ALL USING (true);

  -- Favorites
  DROP POLICY IF EXISTS "Users can view favorites" ON public.favorites;
  CREATE POLICY "Users can view favorites" ON public.favorites FOR ALL USING (auth.uid() = owner_id OR owner_id IS NULL);

  -- Organization Jobs
  DROP POLICY IF EXISTS "Users can manage own jobs" ON public.organization_jobs;
  CREATE POLICY "Users can manage own jobs" ON public.organization_jobs FOR ALL USING (auth.uid() = owner_id OR owner_id IS NULL);

  -- Activity Log
  DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_log;
  CREATE POLICY "Users can view own activity" ON public.activity_log FOR ALL USING (auth.uid() = owner_id OR owner_id IS NULL);
END $$;

