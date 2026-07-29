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
import TestAuthPage from './pages/TestAuthPage';

// Placeholder pages for future tickets
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="page-container">
      <div className="card text-center py-16">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-500">
          This module is coming soon.
        </p>
      </div>
    </div>
  );
}

function InventoryPage() {
  return <PlaceholderPage title="Inventory Management" />;
}
function SuppliersPage() {
  return <PlaceholderPage title="Supplier Management" />;
}
function RecommendationsPage() {
  return <PlaceholderPage title="Purchase Recommendations" />;
}
function PurchaseOrdersPage() {
  return <PlaceholderPage title="Purchase Orders" />;
}
function ApprovalsPage() {
  return <PlaceholderPage title="Approval Queue" />;
}
function AnalyticsPage() {
  return <PlaceholderPage title="Analytics Dashboard" />;
}

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
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="admin/users" element={<AdminUserManagementPage />} />
            <Route path="test-auth" element={<TestAuthPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
