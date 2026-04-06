import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">BUYC Corp</Link>
      <div className="navbar-links">
        <Link to="/">Marketplace</Link>
        <Link to="/oem-specs">OEM Specs</Link>
        {user ? (
          <>
            <Link to="/my-inventory">My Inventory</Link>
            <Link to="/add-car">+ Add Car</Link>
            <span className="navbar-user">Hi, {user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
