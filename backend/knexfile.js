module.exports = {
  module: 'commonjs',
  directory: './migrations',
  extension: 'js',
  seeds: {
    directory: './seeds',
    extension: 'js',
  },
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10,
  },
  useNullAsDefault: true,
};
