import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function Marketplace() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    color: '',
    min_mileage: '',
    max_mileage: '',
    sort: '',
  });

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params[key] = val;
      });
      const res = await api.get('/inventory', { params });
      setCars(res.data);
    } catch (err) {
      console.error('Failed to fetch cars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchCars();
  };

  const clearFilters = () => {
    setFilters({ min_price: '', max_price: '', color: '', min_mileage: '', max_mileage: '', sort: '' });
    setTimeout(fetchCars, 0);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Second-Hand Car Marketplace</h1>
      </div>

      <form className="filters-bar" onSubmit={applyFilters}>
        <div className="filter-group">
          <label>Min Price (₹)</label>
          <input
            type="number"
            value={filters.min_price}
            onChange={(e) => handleFilterChange('min_price', e.target.value)}
            placeholder="e.g. 500000"
          />
        </div>
        <div className="filter-group">
          <label>Max Price (₹)</label>
          <input
            type="number"
            value={filters.max_price}
            onChange={(e) => handleFilterChange('max_price', e.target.value)}
            placeholder="e.g. 2000000"
          />
        </div>
        <div className="filter-group">
          <label>Color</label>
          <input
            type="text"
            value={filters.color}
            onChange={(e) => handleFilterChange('color', e.target.value)}
            placeholder="e.g. White"
          />
        </div>
        <div className="filter-group">
          <label>Min Mileage (km/l)</label>
          <input
            type="number"
            value={filters.min_mileage}
            onChange={(e) => handleFilterChange('min_mileage', e.target.value)}
            placeholder="e.g. 15"
          />
        </div>
        <div className="filter-group">
          <label>Max Mileage (km/l)</label>
          <input
            type="number"
            value={filters.max_mileage}
            onChange={(e) => handleFilterChange('max_mileage', e.target.value)}
            placeholder="e.g. 25"
          />
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
            <option value="">Latest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="mileage">Best Mileage</option>
          </select>
        </div>
        <div className="filter-group" style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', alignSelf: 'flex-end' }}>
          <button type="submit" className="btn btn-primary btn-sm">Apply</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
        </div>
      </form>

      {loading ? (
        <div className="loading">Loading cars...</div>
      ) : cars.length === 0 ? (
        <div className="empty-state">
          <h3>No cars found</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="cars-grid">
          {cars.map((car) => (
            <Link to={`/car/${car.id}`} key={car.id} className="car-card">
              <div className="car-card-image">
                {car.image_url ? (
                  <img src={car.image_url} alt={car.title} />
                ) : (
                  '🚗'
                )}
                <span className="car-card-badge">{car.year} {car.manufacturer}</span>
              </div>
              <div className="car-card-body">
                <div className="car-card-title">{car.title}</div>
                <div className="car-card-meta">
                  <span>📍 {car.registration_place}</span>
                  <span>🛣️ {car.kms_on_odometer.toLocaleString()} km</span>
                  <span>⛽ {car.mileage} km/l</span>
                  <span>⚡ {car.power_bhp} BHP</span>
                </div>
                <div className="car-card-price">{formatPrice(car.price)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
