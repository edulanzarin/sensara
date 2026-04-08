import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { Home } from './features/companion/Home';
import { Dashboard } from './features/companion/Dashboard';
import { Profile } from './features/account/Profile';
import { CompanionProfile } from './features/companion/CompanionProfile';
import { useAuth } from './core/context/AuthContext';
import { Search } from './features/search/Search';
import { Plans } from './features/plans/Plans';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { Favorites } from './features/favorites/Favorites';
import type { JSX } from 'react';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
          <Route path="companions/:id" element={<CompanionProfile />} />
          <Route
            path="dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        <Route path="search" element={<Search />} />
        <Route path="plans" element={<Plans />} />
        <Route
          path="admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route path="favorites" element={<Favorites />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}