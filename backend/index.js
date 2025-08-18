const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// サンプルAPI
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on ${PORT}`));
