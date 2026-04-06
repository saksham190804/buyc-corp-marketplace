const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

// Auto-seed if database is empty
const count = db.prepare('SELECT COUNT(*) as c FROM OEM_Specs').get();
if (count.c === 0) {
  console.log('Empty database detected, seeding...');
  require('./seed');
}

const authRoutes = require('./routes/auth');
const oemRoutes = require('./routes/oem');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/oem', oemRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`BUYC API server running on port ${PORT}`);
});
