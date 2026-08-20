/* =============================================================================
   CommerceOS — App Root
   =============================================================================
   React Router setup with:
   - /landing (or unauthenticated /) — public landing page
   - /login — public login page
   - /signup — public sign up page
   - /home — protected authenticated home
   - /dashboard — protected operational dashboard
   - All other domain routes are protected and wrapped in AppShell Layout
   ============================================================================= */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import InventoryListPage from './pages/InventoryListPage';
import SupplierListPage from './pages/SupplierListPage';
import RecommendationListPage from './pages/RecommendationListPage';
import PurchaseOrderListPage from './pages/PurchaseOrderListPage';
import PurchaseOrderDetailPage from './pages/PurchaseOrderDetailPage';
import ApprovalQueuePage from './pages/ApprovalQueuePage';
import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';
import EventLogPage from './pages/EventLogPage';

function RootRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public entrypoint */}
          <Route path="/" element={<RootRoute />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected routes wrapped in AppShell */}
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/home" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryListPage />} />
            <Route path="/suppliers" element={<SupplierListPage />} />
            <Route path="/recommendations" element={<RecommendationListPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
            <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
            <Route path="/approvals" element={<ApprovalQueuePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/analytics/events" element={<EventLogPage />} />
            <Route path="/admin/users" element={<AdminUserManagementPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
