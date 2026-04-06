const express = require('express');
const db = require('../database');

const router = express.Router();

// GET /api/oem/count - Get total number of OEM models
router.get('/count', (req, res) => {
  const result = db.prepare('SELECT COUNT(*) as count FROM OEM_Specs').get();
  res.json({ count: result.count });
});

// GET /api/oem - List all OEM specs with optional search
router.get('/', (req, res) => {
  const { model, year, manufacturer } = req.query;

  let query = 'SELECT * FROM OEM_Specs WHERE 1=1';
  const params = [];

  if (model) {
    query += ' AND model_name LIKE ?';
    params.push(`%${model}%`);
  }
  if (year) {
    query += ' AND year = ?';
    params.push(parseInt(year));
  }
  if (manufacturer) {
    query += ' AND manufacturer LIKE ?';
    params.push(`%${manufacturer}%`);
  }

  query += ' ORDER BY manufacturer, model_name, year';
  const specs = db.prepare(query).all(...params);
  res.json(specs);
});

// GET /api/oem/search?q=Honda City 2015 - Search OEM specs
router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Search query (q) is required' });
  }

  // Parse search query to extract manufacturer, model, year
  const parts = q.trim().split(/\s+/);
  let query = 'SELECT * FROM OEM_Specs WHERE 1=1';
  const params = [];

  for (const part of parts) {
    if (/^\d{4}$/.test(part)) {
      query += ' AND year = ?';
      params.push(parseInt(part));
    } else {
      query += ' AND (model_name LIKE ? OR manufacturer LIKE ?)';
      params.push(`%${part}%`, `%${part}%`);
    }
  }

  const specs = db.prepare(query).all(...params);
  res.json(specs);
});

// GET /api/oem/:id - Get single OEM spec
router.get('/:id', (req, res) => {
  const spec = db.prepare('SELECT * FROM OEM_Specs WHERE id = ?').get(req.params.id);
  if (!spec) {
    return res.status(404).json({ error: 'OEM spec not found' });
  }
  res.json(spec);
});

module.exports = router;
