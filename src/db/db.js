import 'dotenv/config';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('Defina DATABASE_URL para conectar ao PostgreSQL.');
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (error) => {
  console.error('Erro em conexão ociosa com o PostgreSQL', error.code ?? error.name);
});

export const db = drizzle(pool);
