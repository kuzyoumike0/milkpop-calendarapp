const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:eJjJplyhHrsYWyTqeOauZwunjRPMFUFv@tramway.proxy.rlwy.net:39592/railway'
});

module.exports = pool;
