const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:eJjJplyhHrsYWyTqeOauZwunjRPMFUFv@tramway.proxy.rlwy.net:39592/railway',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()')
  .then(res => console.log(res.rows))
  .catch(err => console.error(err));
