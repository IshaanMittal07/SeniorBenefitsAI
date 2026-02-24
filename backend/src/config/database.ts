import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10'),
  },
  migrations: {
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
});

export default db;
