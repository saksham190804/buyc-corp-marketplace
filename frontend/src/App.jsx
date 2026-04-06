import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Marketplace from './pages/Marketplace';
import CarDetail from './pages/CarDetail';
import DealerInventory from './pages/DealerInventory';
import AddCar from './pages/AddCar';
import EditCar from './pages/EditCar';
import OEMSpecs from './pages/OEMSpecs';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Marketplace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/car/:id" element={<CarDetail />} />
        <Route path="/oem-specs" element={<OEMSpecs />} />
        <Route
          path="/my-inventory"
          element={
            <ProtectedRoute>
              <DealerInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-car"
          element={
            <ProtectedRoute>
              <AddCar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-car/:id"
          element={
            <ProtectedRoute>
              <EditCar />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
