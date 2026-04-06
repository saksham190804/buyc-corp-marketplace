const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'dealer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS OEM_Specs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name TEXT NOT NULL,
    year INTEGER NOT NULL,
    list_price REAL NOT NULL,
    available_colors TEXT NOT NULL,
    mileage REAL NOT NULL,
    power_bhp REAL NOT NULL,
    max_speed REAL NOT NULL,
    manufacturer TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Marketplace_Inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dealer_id INTEGER NOT NULL,
    oem_spec_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    kms_on_odometer INTEGER NOT NULL,
    major_scratches TEXT DEFAULT 'No',
    original_paint TEXT DEFAULT 'Yes',
    accidents_reported INTEGER DEFAULT 0,
    previous_buyers INTEGER DEFAULT 0,
    registration_place TEXT NOT NULL,
    price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dealer_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (oem_spec_id) REFERENCES OEM_Specs(id)
  );
`);

module.exports = db;
