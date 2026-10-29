import pg from 'pg';
const { Client } = pg;

const encodedPassword = encodeURIComponent('VnbPass@2026#HMm');
// Try direct pooler / direct connection
const connectionString = `postgresql://postgres:${encodedPassword}@db.izczqhevfwmggjggckre.supabase.co:5432/postgres`;

console.log('Testing connection to Supabase DB...');
const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 8000,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT version();');
    console.log('Version:', res.rows[0].version);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.message);
  }
}

run();

