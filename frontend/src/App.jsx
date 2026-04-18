import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './modules/core/contexts/AuthContext';
import NotificationPanel from './modules/core/contexts/NotificationPanel';
import FacilitiesDashboard from './modules/facilities/components/FacilitiesDashboard';
import ResourceDetailPage from './modules/facilities/components/ResourceDetailPage';
import BookingsDashboard from './modules/bookings/components/BookingsDashboard';
import IncidentsDashboard from './modules/incidents/components/IncidentsDashboard';
import TicketDetailPage from './modules/incidents/components/TicketDetailPage';

import LoginPage from './modules/core/components/auth/LoginPage';
import RegisterPage from './modules/core/components/auth/RegisterPage';
import ForgotPasswordPage from './modules/core/components/auth/ForgotPasswordPage';
import MockGoogleLogin from './modules/core/components/auth/MockGoogleLogin';
import ProtectedRoute from './modules/core/components/auth/ProtectedRoute';
import HomePage from './modules/core/components/public/HomePage';
import UserManagementPage from './modules/core/components/admin/UserManagementPage';
const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="bg-sliit-blue shadow-md border-b-4 border-sliit-orange px-6 py-3 flex justify-between items-center text-white relative z-50">
      <div className="font-extrabold text-2xl tracking-tight flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <span className="text-sliit-orange">SLIIT</span> Courseweb Hub
      </div>
      <div className="flex items-center space-x-6">
        <Link to="/resources" className="text-sm font-bold text-slate-200 hover:text-white transition-colors">Catalogue</Link>
        {currentUser ? (
          <>
            <span className="text-slate-200 font-medium hidden sm:inline-block">Hello, {currentUser.name}</span>
            <span className="bg-sliit-navy text-sliit-orange border border-sliit-orange text-xs px-2 py-1 rounded-full font-bold shadow-sm">{currentUser.role}</span>
            <NotificationPanel />
            <button onClick={() => { logout(); navigate('/login'); }} className="px-4 py-1.5 bg-white text-sliit-blue font-bold rounded hover:bg-slate-100 transition-colors shadow">Logout</button>
          </>
        ) : (
          <button onClick={() => navigate('/login')} className="px-5 py-2 bg-sliit-orange text-white font-bold rounded hover:bg-orange-600 transition-all shadow-md">Sign In</button>
        )}
      </div>
    </nav>
  );
};

const Dashboard = () => {
  const { currentUser } = useAuth();

  const isAdmin = currentUser?.role === 'ADMIN';
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  const loadAnalytics = async () => {
    if (!isAdmin) return;
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const res = await axios.get('/api/admin/analytics/bookings');
      setAnalytics(res.data || null);
    } catch (e) {
      const msg = e.response?.data;
      setAnalyticsError(typeof msg === 'string' ? msg : 'Failed to load usage analytics.');
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAnalytics();
    } else {
      setAnalytics(null);
      setAnalyticsError('');
      setAnalyticsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const peakHoursLabel = useMemo(() => {
    const list = analytics?.peakBookingStartHours || [];
    return list.map((h) => {
      const hour = Number(h.hour);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = ((hour + 11) % 12) + 1;
      return { ...h, label: `${h12}:00 ${ampm}` };
    });
  }, [analytics]);

  const UserPanel = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Link to="/facilities" className="block outline-none">
        <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition-all border-t-4 border-sliit-navy h-full">
          <h2 className="font-bold text-xl mb-2 text-sliit-blue">Browse & Book Resources</h2>
          <p className="text-slate-500">Request access to lecture halls, meeting rooms, or equipment.</p>
        </div>
      </Link>
      <Link to="/bookings" className="block outline-none">
        <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition-all border-t-4 border-sliit-orange h-full">
          <h2 className="font-bold text-xl mb-2 text-sliit-blue">My Active Bookings</h2>
          <p className="text-slate-500">Manage and view your accepted/pending campus reservations.</p>
        </div>
      </Link>
      <Link to="/incidents" className="block outline-none md:col-span-2">
        <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition-all border-t-4 border-slate-700 h-full">
          <h2 className="font-bold text-xl mb-2 text-sliit-blue">Report an Incident</h2>
          <p className="text-slate-500">Log tickets for damaged hardware or facility maintenance requests.</p>
        </div>
      </Link>
    </div>
  );

  const AdminPanel = (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link to="/facilities" className="block outline-none">
          <div className="bg-sliit-navy text-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-bl-full opacity-5 transform translate-x-8 -translate-y-8"></div>
            <h2 className="font-bold text-xl mb-2 text-sliit-orange">Manage Catalogue</h2>
            <p className="text-slate-300 text-sm">Create brand new campus resources and modify inventory capacities dynamically.</p>
          </div>
        </Link>
        <Link to="/bookings" className="block outline-none">
          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition-all border-t-4 border-sliit-orange h-full">
            <h2 className="font-bold text-xl mb-2 text-sliit-blue">Booking Queue</h2>
            <p className="text-slate-500 text-sm">Review, approve, or reject incoming reservations requested by Students & Staff.</p>
          </div>
        </Link>
        <Link to="/incidents" className="block outline-none">
          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition-all border-t-4 border-slate-700 h-full">
            <h2 className="font-bold text-xl mb-2 text-sliit-blue">System Triage</h2>
            <p className="text-slate-500 text-sm">Assign maintenance technicians to open operational tickets facility-wide.</p>
          </div>
        </Link>
        <Link to="/admin/users" className="block outline-none md:col-span-3">
          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition-all border-t-4 border-slate-500 h-full">
            <h2 className="font-bold text-xl mb-2 text-sliit-blue">User Roles</h2>
            <p className="text-slate-500 text-sm">Review all accounts and promote or demote user roles securely.</p>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">Usage analytics</div>
            <div className="text-lg font-black text-slate-900">Top resources & peak hours</div>
          </div>
          <button
            type="button"
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={loadAnalytics}
            disabled={analyticsLoading}
          >
            Refresh
          </button>
        </div>

        {analyticsError && (
          <div className="px-6 py-4 text-sm font-bold text-rose-700 bg-rose-50 border-b border-rose-100">
            {analyticsError}
          </div>
        )}

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Approved bookings</div>
            <div className="text-3xl font-black text-slate-900">
              {analyticsLoading ? '—' : (analytics?.approvedBookingsCount ?? 0)}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Top resources</div>
            {analyticsLoading ? (
              <div className="text-sm font-bold text-slate-400">Loading…</div>
            ) : (analytics?.topResources?.length || 0) === 0 ? (
              <div className="text-sm font-bold text-slate-400">No approved bookings yet.</div>
            ) : (
              <div className="space-y-2">
                {analytics.topResources.map((r) => (
                  <div key={r.resourceId} className="flex items-center justify-between gap-4 text-sm">
                    <div className="font-bold text-slate-800 truncate">{r.resourceName || `Resource #${r.resourceId}`}</div>
                    <div className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                      {r.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Peak booking hours</div>
            {analyticsLoading ? (
              <div className="text-sm font-bold text-slate-400">Loading…</div>
            ) : (peakHoursLabel?.length || 0) === 0 ? (
              <div className="text-sm font-bold text-slate-400">No approved bookings yet.</div>
            ) : (
              <div className="space-y-2">
                {peakHoursLabel.map((h) => (
                  <div key={h.hour} className="flex items-center justify-between gap-4 text-sm">
                    <div className="font-bold text-slate-800">{h.label}</div>
                    <div className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                      {h.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const TechnicianPanel = (
    <div className="max-w-2xl mx-auto">
      <Link to="/incidents" className="block outline-none">
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-slate-700 hover:border-sliit-orange transition-colors">
          <h2 className="font-bold text-2xl mb-4 text-sliit-blue text-center">Open Service Console</h2>
          <p className="text-slate-500 text-center mb-6">Review your assigned maintenance tickets, add operational logs, and resolve ongoing hardware or structural facility incidents.</p>
          <div className="w-full py-3 bg-slate-800 text-white rounded font-bold text-center">Launch Job Queue</div>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-extrabold mb-8 text-slate-800">
        {currentUser?.role === 'ADMIN' && 'Central Command Overview'}
        {currentUser?.role === 'TECHNICIAN' && 'Technician Workflow'}
        {currentUser?.role === 'USER' && 'Campus Services Portal'}
      </h1>
      {currentUser?.role === 'ADMIN' && AdminPanel}
      {currentUser?.role === 'TECHNICIAN' && TechnicianPanel}
      {currentUser?.role === 'USER' && UserPanel}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-sliit-light font-sans text-slate-800">
          <Routes>
            {/* Direct Public Access (No Navbar wrapper needed for Home/Login/Register) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/mock-google-login" element={<MockGoogleLogin />} />
            
            {/* Application Shell with Navbar (Public and Protected) */}
            <Route element={
              <>
                <Navbar />
                <main className="max-w-7xl mx-auto py-6">
                  <Outlet />
                </main>
              </>
            }>
              {/* Public catalogue browse + resource detail */}
              <Route path="/resources" element={<FacilitiesDashboard />} />
              <Route path="/resources/:id" element={<ResourceDetailPage />} />
              
              {/* Internal Protected Application Space */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/facilities" element={<FacilitiesDashboard />} />
                <Route path="/bookings" element={<BookingsDashboard />} />
                <Route path="/incidents" element={<IncidentsDashboard />} />
                <Route path="/incidents/:id" element={<TicketDetailPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/users" element={<UserManagementPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
