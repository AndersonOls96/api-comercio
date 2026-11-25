import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/model/*.model.js',
  out: './src/db/migrations',
});
