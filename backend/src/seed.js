const db = require('./database');
const bcrypt = require('bcryptjs');

console.log('Seeding database...');

// Clear existing data
db.exec('DELETE FROM Marketplace_Inventory');
db.exec('DELETE FROM OEM_Specs');
db.exec('DELETE FROM Users');

// Seed Users
const hashedPassword = bcrypt.hashSync('password123', 10);
const insertUser = db.prepare('INSERT INTO Users (email, password, name, role) VALUES (?, ?, ?, ?)');

const users = [
  ['dealer1@buyc.com', hashedPassword, 'Rajesh Motors', 'dealer'],
  ['dealer2@buyc.com', hashedPassword, 'AutoWorld Delhi', 'dealer'],
  ['dealer3@buyc.com', hashedPassword, 'CarBazaar Mumbai', 'dealer'],
  ['buyer1@buyc.com', hashedPassword, 'Amit Kumar', 'buyer'],
];

const insertManyUsers = db.transaction((users) => {
  for (const u of users) insertUser.run(...u);
});
insertManyUsers(users);
console.log('Users seeded.');

// Seed OEM_Specs
const insertOEM = db.prepare(`
  INSERT INTO OEM_Specs (model_name, year, list_price, available_colors, mileage, power_bhp, max_speed, manufacturer)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const oemSpecs = [
  ['City', 2015, 1200000, 'White, Silver, Grey, Red', 17.4, 117, 195, 'Honda'],
  ['City', 2020, 1550000, 'Platinum White, Lunar Silver, Modern Steel, Radiant Red', 17.8, 119, 195, 'Honda'],
  ['City', 2023, 1800000, 'Platinum White, Meteoroid Grey, Golden Brown, Radiant Red', 18.4, 121, 200, 'Honda'],
  ['Swift', 2018, 550000, 'Pearl Arctic White, Fire Red, Magma Grey, Silky Silver', 21.2, 82, 170, 'Maruti'],
  ['Swift', 2022, 650000, 'Solid Fire Red, Pearl Arctic White, Magma Grey, Sizzling Red', 23.2, 89, 175, 'Maruti'],
  ['Baleno', 2020, 700000, 'Nexa Blue, Pearl Arctic White, Luxe Beige, Splendid Silver', 22.3, 83, 180, 'Maruti'],
  ['Baleno', 2023, 800000, 'Celestial Blue, Arctic White, Grandeur Grey, Opulent Red', 22.9, 89, 180, 'Maruti'],
  ['3 Series', 2019, 4500000, 'Alpine White, Black Sapphire, Melbourne Red, Mineral Grey', 16.8, 258, 250, 'BMW'],
  ['3 Series', 2022, 5200000, 'Alpine White, Black Sapphire, Portimao Blue, Brooklyn Grey', 17.5, 258, 250, 'BMW'],
  ['5 Series', 2021, 6500000, 'Alpine White, Carbon Black, Phytonic Blue, Sophisto Grey', 15.4, 248, 250, 'BMW'],
  ['A4', 2020, 4800000, 'Ibis White, Mythos Black, Navarra Blue, Manhattan Grey', 17.4, 190, 241, 'Audi'],
  ['A4', 2023, 5500000, 'Glacier White, Mythos Black, Navarra Blue, District Green', 18.1, 190, 241, 'Audi'],
  ['A6', 2021, 6200000, 'Glacier White, Firmament Blue, Mythos Black, Floret Silver', 14.1, 245, 250, 'Audi'],
  ['Creta', 2020, 1100000, 'Polar White, Phantom Black, Typhoon Silver, Lava Orange', 16.8, 113, 175, 'Hyundai'],
  ['Creta', 2023, 1400000, 'Atlas White, Abyss Black, Titan Grey, Fiery Red', 17.0, 158, 185, 'Hyundai'],
  ['i20', 2021, 750000, 'Polar White, Typhoon Silver, Starry Night, Fiery Red', 20.3, 100, 180, 'Hyundai'],
  ['Fortuner', 2020, 3500000, 'Super White, Attitude Black, Phantom Brown, Grey Metallic', 10.1, 201, 180, 'Toyota'],
  ['Fortuner', 2023, 4200000, 'Platinum White, Attitude Black, Avant Garde Bronze, Sparkling Black', 10.1, 201, 180, 'Toyota'],
  ['Innova Crysta', 2021, 2200000, 'Super White, Avant Garde Bronze, Garnet Red, Grey Metallic', 11.3, 148, 180, 'Toyota'],
  ['Thar', 2022, 1500000, 'Rocky Beige, Aqua Marine, Napoli Black, Galaxy Grey', 15.2, 150, 155, 'Mahindra'],
];

const insertManyOEM = db.transaction((specs) => {
  for (const s of specs) insertOEM.run(...s);
});
insertManyOEM(oemSpecs);
console.log('OEM Specs seeded.');

// Seed Marketplace_Inventory
const insertInventory = db.prepare(`
  INSERT INTO Marketplace_Inventory 
  (dealer_id, oem_spec_id, title, description, image_url, kms_on_odometer, major_scratches, original_paint, accidents_reported, previous_buyers, registration_place, price)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const inventory = [
  [1, 1, 'Honda City 2015 - Well Maintained', 
   'Single owner vehicle. Regular service at authorized Honda center. All documents clear. Insurance valid till 2025. New tyres installed recently.',
   null, 45000, 'No', 'Yes', 0, 1, 'Delhi', 650000],
  [1, 4, 'Maruti Swift 2018 - Excellent Condition',
   'Company maintained vehicle. Driven only on highways. AC cooling excellent. Music system upgraded. Alloy wheels added.',
   null, 32000, 'Minor', 'Yes', 0, 1, 'Delhi', 420000],
  [1, 8, 'BMW 3 Series 2019 - Luxury at Best Price',
   'Showroom condition. Full service history available. Extended warranty active. Premium Harman Kardon sound system. Sunroof working perfectly.',
   null, 28000, 'No', 'Yes', 0, 1, 'Gurgaon', 3200000],
  [2, 14, 'Hyundai Creta 2020 - Top Model',
   'Panoramic sunroof. Ventilated seats. BOSE sound system. 360 degree camera. All features working perfectly.',
   null, 22000, 'No', 'Yes', 0, 1, 'Delhi', 950000],
  [2, 17, 'Toyota Fortuner 2020 - Beast on Road',
   'Army officer owned. Immaculate condition. All terrain tyres. Bullbar installed. Underbody coating done. Perfect for long drives.',
   null, 55000, 'No', 'Yes', 0, 1, 'Chandigarh', 3100000],
  [2, 6, 'Maruti Baleno 2020 - Premium Hatchback',
   'Doctor owned. Parked in covered garage. Ceramic coating done. SmartPlay infotainment. LED projector headlamps.',
   null, 18000, 'No', 'Yes', 0, 1, 'Noida', 580000],
  [3, 11, 'Audi A4 2020 - German Engineering',
   'Virtual cockpit display. Matrix LED headlights. Quattro AWD. Bang & Olufsen sound. All service records available.',
   null, 35000, 'No', 'Yes', 0, 2, 'Mumbai', 3500000],
  [3, 20, 'Mahindra Thar 2022 - Adventure Ready',
   'Hard top convertible. Off-road tyres. Snorkel installed. LED light bar. Perfect weekend vehicle. Barely used.',
   null, 12000, 'No', 'Yes', 0, 1, 'Pune', 1350000],
  [3, 19, 'Toyota Innova Crysta 2021 - Family Car',
   'Captain seats. Rear AC vents. Touchscreen infotainment. Reverse camera. Perfect family vehicle. Well maintained.',
   null, 40000, 'No', 'Yes', 0, 1, 'Mumbai', 1800000],
  [1, 2, 'Honda City 2020 - Latest Shape',
   'CVT automatic transmission. Honda Sensing suite. Lane watch camera. Wireless charging. Apple CarPlay enabled.',
   null, 15000, 'No', 'Yes', 0, 1, 'Delhi', 1200000],
];

const insertManyInventory = db.transaction((items) => {
  for (const i of items) insertInventory.run(...i);
});
insertManyInventory(inventory);
console.log('Marketplace Inventory seeded.');

console.log('Database seeding complete!');
process.exit(0);
