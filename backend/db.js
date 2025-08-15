const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'db',
    database: process.env.POSTGRES_DB || 'milkpop_calendar',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: 5432
});

module.exports = pool;
