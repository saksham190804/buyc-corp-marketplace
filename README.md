# BUYC Corp - Second Hand Car Marketplace

A full-stack web application for a second-hand car marketplace where dealers list their inventory and buyers browse and purchase cars.

## Tech Stack

- **Frontend:** React 18 + Vite + React Router
- **Backend:** Node.js + Express
- **Database:** SQLite (via better-sqlite3)
- **Auth:** JWT-based authentication with bcrypt password hashing

## Database Schema

### Users
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| email | TEXT | Unique email |
| password | TEXT | Bcrypt hashed |
| name | TEXT | User/dealership name |
| role | TEXT | 'dealer' or 'buyer' |

### OEM_Specs
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| model_name | TEXT | Model name (City, Swift, etc.) |
| year | INTEGER | Year of model |
| list_price | REAL | OEM list price (INR) |
| available_colors | TEXT | Comma-separated colors |
| mileage | REAL | Mileage in km/l |
| power_bhp | REAL | Power in BHP |
| max_speed | REAL | Max speed in km/h |
| manufacturer | TEXT | OEM name (Honda, Maruti, etc.) |

### Marketplace_Inventory
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| dealer_id | INTEGER | FK → Users |
| oem_spec_id | INTEGER | FK → OEM_Specs |
| title | TEXT | Listing title |
| description | TEXT | 5 bullet-point description |
| image_url | TEXT | Car image URL |
| kms_on_odometer | INTEGER | Kilometers driven |
| major_scratches | TEXT | Yes/No/Minor |
| original_paint | TEXT | Yes/No/Partial |
| accidents_reported | INTEGER | Number of accidents |
| previous_buyers | INTEGER | Number of previous owners |
| registration_place | TEXT | City of registration |
| price | REAL | Asking price (INR) |

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### OEM Specs
- `GET /api/oem` - List all OEM specs (supports `?model=`, `?year=`, `?manufacturer=` filters)
- `GET /api/oem/count` - Get total number of OEM models
- `GET /api/oem/search?q=Honda City 2015` - Search OEM specs
- `GET /api/oem/:id` - Get single OEM spec

### Marketplace Inventory
- `GET /api/inventory` - List all cars (supports `?min_price=`, `?max_price=`, `?color=`, `?min_mileage=`, `?max_mileage=`, `?sort=` filters)
- `GET /api/inventory/my` - Get dealer's own inventory (auth required)
- `GET /api/inventory/:id` - Get single car details
- `POST /api/inventory` - Add new car listing (auth required)
- `PUT /api/inventory/:id` - Update car listing (auth required, owner only)
- `DELETE /api/inventory/:id` - Delete car listing (auth required, owner only)
- `DELETE /api/inventory` - Bulk delete (auth required, body: `{ ids: [1,2,3] }`)

## Setup & Run

### Prerequisites
- Node.js 18+

### Install & Start

```bash
# Install backend dependencies
cd backend
npm install

# Seed the database with dummy data
npm run seed

# Start the backend server (port 5000)
npm start
```

```bash
# In a new terminal - Install frontend dependencies
cd frontend
npm install

# Start the frontend dev server (port 3000)
npm run dev
```

### Demo Credentials
| Email | Password | Role |
|-------|----------|------|
| dealer1@buyc.com | password123 | Dealer |
| dealer2@buyc.com | password123 | Dealer |
| dealer3@buyc.com | password123 | Dealer |
| buyer1@buyc.com | password123 | Buyer |

## Features

### Phase I - Frontend (React)
- Signup and Login with JWT authentication
- Dealer can add second-hand car details with image, title, and 5-point description
- Filters on Price, Colors, and Mileage
- Dealer inventory management: view all listings, edit, delete single or bulk delete

### Phase II - Database Design
- Three normalized tables: Users, OEM_Specs, Marketplace_Inventory
- Foreign key relationships between tables
- Seeded with 20 OEM specs across 6 manufacturers and 10 inventory listings

### Phase III - APIs
- API to query number of OEM models: `GET /api/oem/count`
- API to search OEM specs: `GET /api/oem/search?q=Honda City 2015`
- Full CRUD for inventory management
- Filter and sort support on marketplace listings
