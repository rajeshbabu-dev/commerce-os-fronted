/* =============================================================================
   CommerceOS — App Root
   =============================================================================
   React Router setup with:
   - /login — public login page
   - / — redirects to /dashboard
   - /dashboard — protected dashboard
   - All other routes are protected and wrapped in the sidebar layout
   ============================================================================= */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';
import Layout from './components/Layout';
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
import AnalyticsPage from './pages/AnalyticsPage';
import EventLogPage from './pages/EventLogPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="inventory" element={<InventoryListPage />} />
            <Route path="suppliers" element={<SupplierListPage />} />
            <Route path="recommendations" element={<RecommendationListPage />} />
            <Route path="purchase-orders" element={<PurchaseOrderListPage />} />
            <Route path="purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
            <Route path="approvals" element={<ApprovalQueuePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="analytics/events" element={<EventLogPage />} />
            <Route path="admin/users" element={<AdminUserManagementPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
