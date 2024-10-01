// api/routes/data.js


const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM your_table');
    res.json(result.rows);
  } catch (err) {
    console.error('Database connection error', err); // Log the error details
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
