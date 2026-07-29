/* =============================================================================
   CommerceOS — Auth Test Page (Development Only)
   =============================================================================
   Allows manual testing of the full auth flow: login → /me → refresh → logout.
   Accessible at /test-auth when running locally.
   ============================================================================= */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { tokenStore } from '../api/axios';

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading, error, logout } = useAuth();
  const [meResult, setMeResult] = useState<string>('');
  const [refreshResult, setRefreshResult] = useState<string>('');
  const [logoutResult, setLogoutResult] = useState<string>('');

  async function testLogin() {
    try {
      const res = await api.post('/auth/login', { email: 'admin@commerceos.com', password: 'admin123' });
      tokenStore.setTokens(res.data);
      window.location.reload();
    } catch (err) {
      setMeResult('LOGIN ERROR: ' + String(err));
    }
  }

  async function testGetMe() {
    try {
      const res = await api.get('/auth/me');
      setMeResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setMeResult('ERROR: ' + String(err));
    }
  }

  async function testRefresh() {
    try {
      const rt = tokenStore.getRefreshToken();
      if (!rt) {
        setRefreshResult('ERROR: No refresh token available');
        return;
      }
      const res = await api.post('/auth/refresh', { refreshToken: rt });
      setRefreshResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setRefreshResult('ERROR: ' + String(err));
    }
  }

  async function testLogout() {
    await logout();
    setLogoutResult('Logged out successfully');
  }

  return (
    <div className="page-container">
      <h1 className="text-2xl font-semibold mb-4">Auth API Test Panel</h1>

      {/* Auth State */}
      <div className="card mb-4">
        <h2 className="text-lg font-semibold mb-2">Current Auth State</h2>
        <div className="space-y-1 text-sm">
          <p><span className="text-slate-500">Authenticated:</span> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          <p><span className="text-slate-500">Loading:</span> {isLoading ? '⏳' : '✅'}</p>
          <p><span className="text-slate-500">Error:</span> {error ?? 'None'}</p>
          <p><span className="text-slate-500">User:</span> {user ? user.email : 'Not logged in'}</p>
          <p><span className="text-slate-500">Access Token:</span> {tokenStore.getAccessToken()?.substring(0, 50)}...</p>
          <p><span className="text-slate-500">Refresh Token:</span> {tokenStore.getRefreshToken()?.substring(0, 50)}...</p>
        </div>
      </div>

      {/* Test Actions */}
      <div className="card mb-4">
        <h2 className="text-lg font-semibold mb-3">Test Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={testLogin} className="btn-primary">Test Login (admin)</button>
          <button onClick={testGetMe} className="btn-secondary">Test GET /auth/me</button>
          <button onClick={testRefresh} className="btn-secondary">Test POST /auth/refresh</button>
          <button onClick={testLogout} className="btn-destructive">Test Logout</button>
        </div>

        {meResult && (
          <div className="mt-3">
            <p className="text-sm font-medium text-slate-700 mb-1">GET /auth/me result:</p>
            <pre className="text-xs bg-slate-50 p-3 rounded-md overflow-auto max-h-40">{meResult}</pre>
          </div>
        )}
        {refreshResult && (
          <div className="mt-3">
            <p className="text-sm font-medium text-slate-700 mb-1">POST /auth/refresh result:</p>
            <pre className="text-xs bg-slate-50 p-3 rounded-md overflow-auto max-h-40">{refreshResult}</pre>
          </div>
        )}
        {logoutResult && (
          <div className="mt-3">
            <p className="text-sm font-medium text-slate-700 mb-1">Logout result:</p>
            <pre className="text-xs bg-slate-50 p-3 rounded-md overflow-auto max-h-40">{logoutResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
