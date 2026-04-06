import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [oemSpecs, setOemSpecs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    oem_spec_id: '',
    title: '',
    description: '',
    image_url: '',
    kms_on_odometer: '',
    major_scratches: 'No',
    original_paint: 'Yes',
    accidents_reported: 0,
    previous_buyers: 0,
    registration_place: '',
    price: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('/oem'),
      api.get(`/inventory/${id}`),
    ]).then(([oemRes, carRes]) => {
      setOemSpecs(oemRes.data);
      const car = carRes.data;
      setForm({
        oem_spec_id: car.oem_spec_id,
        title: car.title,
        description: car.description,
        image_url: car.image_url || '',
        kms_on_odometer: car.kms_on_odometer,
        major_scratches: car.major_scratches,
        original_paint: car.original_paint,
        accidents_reported: car.accidents_reported,
        previous_buyers: car.previous_buyers,
        registration_place: car.registration_place,
        price: car.price,
      });
    }).catch(() => {
      setError('Failed to load car details');
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await api.put(`/inventory/${id}`, {
        ...form,
        oem_spec_id: parseInt(form.oem_spec_id),
        kms_on_odometer: parseInt(form.kms_on_odometer),
        accidents_reported: parseInt(form.accidents_reported),
        previous_buyers: parseInt(form.previous_buyers),
        price: parseFloat(form.price),
      });
      navigate('/my-inventory');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update car');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <span className="back-link" onClick={() => navigate(-1)}>← Back</span>
      <div className="add-car-form">
        <h2>Edit Car Listing</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select OEM Model *</label>
            <select
              value={form.oem_spec_id}
              onChange={(e) => handleChange('oem_spec_id', e.target.value)}
              required
            >
              <option value="">-- Select a model --</option>
              {oemSpecs.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.manufacturer} {spec.model_name} {spec.year} - ₹{spec.list_price.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Listing Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label>Image URL (optional)</label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>KMs on Odometer *</label>
              <input
                type="number"
                value={form.kms_on_odometer}
                onChange={(e) => handleChange('kms_on_odometer', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Major Scratches</label>
              <select value={form.major_scratches} onChange={(e) => handleChange('major_scratches', e.target.value)}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="Minor">Minor</option>
              </select>
            </div>
            <div className="form-group">
              <label>Original Paint</label>
              <select value={form.original_paint} onChange={(e) => handleChange('original_paint', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Accidents Reported</label>
              <input
                type="number"
                value={form.accidents_reported}
                onChange={(e) => handleChange('accidents_reported', e.target.value)}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Previous Buyers</label>
              <input
                type="number"
                value={form.previous_buyers}
                onChange={(e) => handleChange('previous_buyers', e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Registration Place *</label>
            <input
              type="text"
              value={form.registration_place}
              onChange={(e) => handleChange('registration_place', e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Update Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
