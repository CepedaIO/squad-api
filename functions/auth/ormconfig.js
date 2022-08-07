const { join } = require('path');

module.exports = {
  type: 'postgres',
  debug: process.env.NODE_ENV !== 'production',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'superuser',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'event-matcher',
  entities: [
    join(__dirname, '**', '**.{ts,js}'),
  ],
  synchronize: true
};
