import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { LandingLoginPage } from './pages/LandingLoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { RoomsPage } from './pages/RoomsPage';
import { VisitorsPage } from './pages/VisitorsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { HostelStructurePage } from './pages/HostelStructurePage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { DsaVisualizerPage } from './pages/DsaVisualizerPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500 font-mono">
            Initializing Smart Hostel DSA System...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication & Landing Page */}
          <Route path="/login" element={<LandingLoginPage />} />

          {/* Protected Application Layout */}
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
            <Route path="students" element={<StudentsPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="visitors" element={<VisitorsPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="hostel-structure" element={<HostelStructurePage />} />
            <Route path="facilities" element={<FacilitiesPage />} />
            <Route path="dsa-visualizer" element={<DsaVisualizerPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
