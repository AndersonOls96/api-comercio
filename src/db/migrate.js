import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './db.js';

try {
  await migrate(db, {
    migrationsFolder: fileURLToPath(new URL('./migrations/', import.meta.url)),
  });
  console.log('Migrations aplicadas.');
} finally {
  await pool.end();
}
