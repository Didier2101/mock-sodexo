import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Alerts from './views/Alerts';
import PrivateRoute from './components/PrivateRoute';
import AppShell from './components/AppShell';

export default function App() {
  return (
    <Routes>
      {/* ── RUTAS PÚBLICAS ─────────────────────────────── */}
      <Route path="/login" element={<Login />} />

      {/* ── RUTAS PRIVADAS (requieren sesión) ──────────── */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          {/* Redirige la raíz al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Cualquier ruta desconocida → login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}