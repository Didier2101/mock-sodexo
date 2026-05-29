import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Rutas privadas: solo accesibles si el usuario está autenticado.
 * Si no hay sesión, redirige al login.
 */
export default function PrivateRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
