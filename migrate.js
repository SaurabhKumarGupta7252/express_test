import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './src/db/index.js';

try {
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Database migrations applied.');
} finally {
  await pool.end();
}
