const express = require('express');
const db = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/inventory - List all inventory with filters (public)
router.get('/', (req, res) => {
  const { min_price, max_price, color, min_mileage, max_mileage, sort } = req.query;

  let query = `
    SELECT mi.*, os.model_name, os.year, os.list_price, os.available_colors,
           os.mileage, os.power_bhp, os.max_speed, os.manufacturer,
           u.name as dealer_name
    FROM Marketplace_Inventory mi
    JOIN OEM_Specs os ON mi.oem_spec_id = os.id
    JOIN Users u ON mi.dealer_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (min_price) {
    query += ' AND mi.price >= ?';
    params.push(parseFloat(min_price));
  }
  if (max_price) {
    query += ' AND mi.price <= ?';
    params.push(parseFloat(max_price));
  }
  if (color) {
    query += ' AND os.available_colors LIKE ?';
    params.push(`%${color}%`);
  }
  if (min_mileage) {
    query += ' AND os.mileage >= ?';
    params.push(parseFloat(min_mileage));
  }
  if (max_mileage) {
    query += ' AND os.mileage <= ?';
    params.push(parseFloat(max_mileage));
  }

  if (sort === 'price_asc') query += ' ORDER BY mi.price ASC';
  else if (sort === 'price_desc') query += ' ORDER BY mi.price DESC';
  else if (sort === 'mileage') query += ' ORDER BY os.mileage DESC';
  else query += ' ORDER BY mi.created_at DESC';

  const items = db.prepare(query).all(...params);
  res.json(items);
});

// GET /api/inventory/my - Get dealer's own inventory (auth required)
router.get('/my', authenticate, (req, res) => {
  const items = db.prepare(`
    SELECT mi.*, os.model_name, os.year, os.list_price, os.available_colors,
           os.mileage, os.power_bhp, os.max_speed, os.manufacturer
    FROM Marketplace_Inventory mi
    JOIN OEM_Specs os ON mi.oem_spec_id = os.id
    WHERE mi.dealer_id = ?
    ORDER BY mi.created_at DESC
  `).all(req.user.id);
  res.json(items);
});

// GET /api/inventory/:id - Get single inventory item (public)
router.get('/:id', (req, res) => {
  const item = db.prepare(`
    SELECT mi.*, os.model_name, os.year, os.list_price, os.available_colors,
           os.mileage, os.power_bhp, os.max_speed, os.manufacturer,
           u.name as dealer_name
    FROM Marketplace_Inventory mi
    JOIN OEM_Specs os ON mi.oem_spec_id = os.id
    JOIN Users u ON mi.dealer_id = u.id
    WHERE mi.id = ?
  `).get(req.params.id);

  if (!item) {
    return res.status(404).json({ error: 'Inventory item not found' });
  }
  res.json(item);
});

// POST /api/inventory - Add new inventory item (auth required)
router.post('/', authenticate, (req, res) => {
  const {
    oem_spec_id, title, description, image_url,
    kms_on_odometer, major_scratches, original_paint,
    accidents_reported, previous_buyers, registration_place, price
  } = req.body;

  if (!oem_spec_id || !title || !description || !kms_on_odometer || !registration_place || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Verify OEM spec exists
  const spec = db.prepare('SELECT id FROM OEM_Specs WHERE id = ?').get(oem_spec_id);
  if (!spec) {
    return res.status(400).json({ error: 'Invalid OEM spec ID' });
  }

  const result = db.prepare(`
    INSERT INTO Marketplace_Inventory 
    (dealer_id, oem_spec_id, title, description, image_url, kms_on_odometer, 
     major_scratches, original_paint, accidents_reported, previous_buyers, 
     registration_place, price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id, oem_spec_id, title, description, image_url || null,
    kms_on_odometer, major_scratches || 'No', original_paint || 'Yes',
    accidents_reported || 0, previous_buyers || 0, registration_place, price
  );

  const item = db.prepare(`
    SELECT mi.*, os.model_name, os.year, os.manufacturer
    FROM Marketplace_Inventory mi
    JOIN OEM_Specs os ON mi.oem_spec_id = os.id
    WHERE mi.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(item);
});

// PUT /api/inventory/:id - Update inventory item (auth required, owner only)
router.put('/:id', authenticate, (req, res) => {
  const existing = db.prepare('SELECT * FROM Marketplace_Inventory WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Inventory item not found' });
  }
  if (existing.dealer_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to edit this listing' });
  }

  const {
    oem_spec_id, title, description, image_url,
    kms_on_odometer, major_scratches, original_paint,
    accidents_reported, previous_buyers, registration_place, price
  } = req.body;

  db.prepare(`
    UPDATE Marketplace_Inventory SET
      oem_spec_id = ?, title = ?, description = ?, image_url = ?,
      kms_on_odometer = ?, major_scratches = ?, original_paint = ?,
      accidents_reported = ?, previous_buyers = ?, registration_place = ?,
      price = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    oem_spec_id || existing.oem_spec_id,
    title || existing.title,
    description || existing.description,
    image_url !== undefined ? image_url : existing.image_url,
    kms_on_odometer || existing.kms_on_odometer,
    major_scratches || existing.major_scratches,
    original_paint || existing.original_paint,
    accidents_reported !== undefined ? accidents_reported : existing.accidents_reported,
    previous_buyers !== undefined ? previous_buyers : existing.previous_buyers,
    registration_place || existing.registration_place,
    price || existing.price,
    req.params.id
  );

  const updated = db.prepare(`
    SELECT mi.*, os.model_name, os.year, os.manufacturer
    FROM Marketplace_Inventory mi
    JOIN OEM_Specs os ON mi.oem_spec_id = os.id
    WHERE mi.id = ?
  `).get(req.params.id);

  res.json(updated);
});

// DELETE /api/inventory/:id - Delete inventory item (auth required, owner only)
router.delete('/:id', authenticate, (req, res) => {
  const existing = db.prepare('SELECT * FROM Marketplace_Inventory WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Inventory item not found' });
  }
  if (existing.dealer_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to delete this listing' });
  }

  db.prepare('DELETE FROM Marketplace_Inventory WHERE id = ?').run(req.params.id);
  res.json({ message: 'Listing deleted successfully' });
});

// DELETE /api/inventory - Bulk delete (auth required, owner only)
router.delete('/', authenticate, (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Array of IDs required' });
  }

  const deleteStmt = db.prepare('DELETE FROM Marketplace_Inventory WHERE id = ? AND dealer_id = ?');
  const deleteMany = db.transaction((ids) => {
    let deleted = 0;
    for (const id of ids) {
      const result = deleteStmt.run(id, req.user.id);
      deleted += result.changes;
    }
    return deleted;
  });

  const deleted = deleteMany(ids);
  res.json({ message: `${deleted} listing(s) deleted successfully`, deleted });
});

module.exports = router;
