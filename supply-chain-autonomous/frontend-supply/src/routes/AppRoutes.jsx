import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';

// Pages
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ControlTowerPage } from '../pages/ControlTowerPage';
import { DisruptionsPage } from '../pages/DisruptionsPage';
import { SimulationPage } from '../pages/SimulationPage';
import { SuppliersPage } from '../pages/SuppliersPage';
import { InventoryPage } from '../pages/InventoryPage';
import { OrdersPage } from '../pages/OrdersPage';
import { TrackingPage } from '../pages/TrackingPage';
import { AIAgentPage } from '../pages/AIAgentPage';
import { DecisionsPage } from '../pages/DecisionsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { AuditLogPage } from '../pages/AuditLogPage';
import { SettingsPage } from '../pages/SettingsPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#070b14', color: '#06b6d4' }}>
        Authenticating Control Tower Session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="control-tower" element={<ControlTowerPage />} />
        <Route path="disruptions" element={<DisruptionsPage />} />
        <Route path="simulation" element={<SimulationPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="shipments" element={<TrackingPage />} />
        <Route path="ai-agent" element={<AIAgentPage />} />
        <Route path="decisions" element={<DecisionsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
