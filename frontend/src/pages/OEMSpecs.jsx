import { useState, useEffect } from 'react';
import api from '../api';

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function OEMSpecs() {
  const [specs, setSpecs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/oem'),
      api.get('/oem/count'),
    ]).then(([specsRes, countRes]) => {
      setSpecs(specsRes.data);
      setTotalCount(countRes.data.count);
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        const res = await api.get('/oem/search', { params: { q: searchQuery } });
        setSpecs(res.data);
      } else {
        const res = await api.get('/oem');
        setSpecs(res.data);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = async () => {
    setSearchQuery('');
    setLoading(true);
    try {
      const res = await api.get('/oem');
      setSpecs(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>OEM Specifications</h1>
        <span style={{ color: '#777', fontSize: '1rem' }}>
          Total Models: <strong style={{ color: '#e94560' }}>{totalCount}</strong>
        </span>
      </div>

      <div className="oem-search">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search OEM specs (e.g. Honda City 2015)"
            style={{
              flex: 1,
              padding: '0.7rem 1rem',
              border: '1.5px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.95rem',
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Search</button>
          {searchQuery && (
            <button type="button" className="btn btn-secondary" onClick={clearSearch}>Clear</button>
          )}
        </form>

        {loading ? (
          <div className="loading">Loading OEM specs...</div>
        ) : specs.length === 0 ? (
          <div className="empty-state">
            <h3>No specs found</h3>
            <p>Try a different search query.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="oem-table">
              <thead>
                <tr>
                  <th>Manufacturer</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>List Price</th>
                  <th>Colors</th>
                  <th>Mileage (km/l)</th>
                  <th>Power (BHP)</th>
                  <th>Max Speed (km/h)</th>
                </tr>
              </thead>
              <tbody>
                {specs.map((spec) => (
                  <tr key={spec.id}>
                    <td style={{ fontWeight: 500 }}>{spec.manufacturer}</td>
                    <td>{spec.model_name}</td>
                    <td>{spec.year}</td>
                    <td style={{ fontWeight: 600, color: '#e94560' }}>{formatPrice(spec.list_price)}</td>
                    <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>{spec.available_colors}</td>
                    <td>{spec.mileage}</td>
                    <td>{spec.power_bhp}</td>
                    <td>{spec.max_speed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
