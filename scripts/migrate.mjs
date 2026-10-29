import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;
const encodedPassword = encodeURIComponent('VnbPass@2026#HMm');
const client = new Client({
  connectionString: `postgresql://postgres:${encodedPassword}@db.izczqhevfwmggjggckre.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  try {
    await client.connect();
    console.log('Connected to database. Running schema migration...');

    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/20261029000000_initial_schema.sql'), 'utf-8');
    await client.query(schemaSql);
    console.log('Schema migration completed successfully!');

    // Check storage bucket
    try {
      await client.query(`
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('photos', 'photos', true)
        ON CONFLICT (id) DO UPDATE SET public = true;
      `);
      console.log('Storage bucket "photos" ensured!');
      
      // Storage policies
      await client.query(`
        DO $$
        BEGIN
          DROP POLICY IF EXISTS "Public photos access" ON storage.objects;
          CREATE POLICY "Public photos access" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
          
          DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
          CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
          
          DROP POLICY IF EXISTS "Users can update their photos" ON storage.objects;
          CREATE POLICY "Users can update their photos" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');
          
          DROP POLICY IF EXISTS "Users can delete their photos" ON storage.objects;
          CREATE POLICY "Users can delete their photos" ON storage.objects FOR DELETE USING (bucket_id = 'photos');
        END $$;
      `);
      console.log('Storage policies configured!');
    } catch (storageErr) {
      console.warn('Storage bucket query notice (can be configured via Supabase dashboard if schema isolated):', storageErr.message);
    }

    const check = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('Tables created in public schema:', check.rows.map(r => r.table_name));

    await client.end();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigrations();

