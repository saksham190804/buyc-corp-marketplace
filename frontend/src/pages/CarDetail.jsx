import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/inventory/${id}`)
      .then((res) => setCar(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading car details...</div>;
  if (!car) return null;

  // Split description into bullet points
  const descriptionPoints = car.description
    .split('.')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <div className="page-container">
      <span className="back-link" onClick={() => navigate(-1)}>
        ← Back to listings
      </span>

      <div className="car-detail">
        <div className="car-detail-image">
          {car.image_url ? (
            <img src={car.image_url} alt={car.title} />
          ) : (
            '🚗'
          )}
        </div>

        <div className="car-detail-body">
          <div className="car-detail-title">{car.title}</div>
          <div className="car-detail-price">{formatPrice(car.price)}</div>

          <div className="car-detail-specs">
            <div className="spec-item">
              <label>Manufacturer</label>
              <span>{car.manufacturer}</span>
            </div>
            <div className="spec-item">
              <label>Model</label>
              <span>{car.model_name}</span>
            </div>
            <div className="spec-item">
              <label>Year</label>
              <span>{car.year}</span>
            </div>
            <div className="spec-item">
              <label>OEM List Price</label>
              <span>{formatPrice(car.list_price)}</span>
            </div>
            <div className="spec-item">
              <label>Mileage</label>
              <span>{car.mileage} km/l</span>
            </div>
            <div className="spec-item">
              <label>Power</label>
              <span>{car.power_bhp} BHP</span>
            </div>
            <div className="spec-item">
              <label>Max Speed</label>
              <span>{car.max_speed} km/h</span>
            </div>
            <div className="spec-item">
              <label>Available Colors</label>
              <span>{car.available_colors}</span>
            </div>
            <div className="spec-item">
              <label>KMs on Odometer</label>
              <span>{car.kms_on_odometer.toLocaleString()} km</span>
            </div>
            <div className="spec-item">
              <label>Major Scratches</label>
              <span>{car.major_scratches}</span>
            </div>
            <div className="spec-item">
              <label>Original Paint</label>
              <span>{car.original_paint}</span>
            </div>
            <div className="spec-item">
              <label>Accidents Reported</label>
              <span>{car.accidents_reported}</span>
            </div>
            <div className="spec-item">
              <label>Previous Buyers</label>
              <span>{car.previous_buyers}</span>
            </div>
            <div className="spec-item">
              <label>Registration Place</label>
              <span>{car.registration_place}</span>
            </div>
            <div className="spec-item">
              <label>Dealer</label>
              <span>{car.dealer_name}</span>
            </div>
          </div>

          <div className="car-detail-description">
            <h3>Description</h3>
            <ul>
              {descriptionPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
