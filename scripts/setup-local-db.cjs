require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Create .env from .env.example first.');
  }

  const migrationPath = path.join(process.cwd(), 'prisma', 'migrations', '000001_init', 'migration.sql');
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration not found: ${migrationPath}`);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const existing = await client.query(
    "select count(*)::int as count from information_schema.tables where table_schema = 'public' and table_name in ('User', 'Wallet')"
  );

  if (Number(existing.rows[0].count) >= 2) {
    console.log('Local database schema already exists.');
    await client.end();
    return;
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');
  await client.query(sql);
  console.log('Local database schema created.');
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
