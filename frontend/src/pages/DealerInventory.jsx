import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function DealerInventory() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/my');
      setCars(res.data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === cars.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(cars.map((c) => c.id)));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      setCars((prev) => prev.filter((c) => c.id !== id));
      selected.delete(id);
      setSelected(new Set(selected));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await api.delete('/inventory', { data: { ids: Array.from(selected) } });
      setCars((prev) => prev.filter((c) => !selected.has(c.id)));
      setSelected(new Set());
      setShowDeleteModal(false);
    } catch (err) {
      alert('Failed to delete selected items');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Inventory</h1>
        <Link to="/add-car" className="btn btn-primary">+ Add New Car</Link>
      </div>

      {selected.size > 0 && (
        <div className="bulk-actions">
          <span>{selected.size} selected</span>
          <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteModal(true)}>
            Delete Selected
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setSelected(new Set())}>
            Clear Selection
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading inventory...</div>
      ) : cars.length === 0 ? (
        <div className="empty-state">
          <h3>No cars in your inventory</h3>
          <p>Start by adding your first car listing.</p>
          <Link to="/add-car" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            + Add Car
          </Link>
        </div>
      ) : (
        <div className="inventory-table">
          <table>
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selected.size === cars.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Car</th>
                <th>Model</th>
                <th>Year</th>
                <th>KMs</th>
                <th>Price</th>
                <th>Registration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(car.id)}
                      onChange={() => toggleSelect(car.id)}
                    />
                  </td>
                  <td style={{ fontWeight: 500 }}>{car.title}</td>
                  <td>{car.manufacturer} {car.model_name}</td>
                  <td>{car.year}</td>
                  <td>{car.kms_on_odometer.toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: '#e94560' }}>{formatPrice(car.price)}</td>
                  <td>{car.registration_place}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/car/${car.id}`)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/edit-car/${car.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(car.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Bulk Delete</h3>
            <p>Are you sure you want to delete {selected.size} listing(s)? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleBulkDelete}>Delete All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
