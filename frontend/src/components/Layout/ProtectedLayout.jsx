import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { FaDumbbell } from 'react-icons/fa';

const ProtectedLayout = () => {
  const { user, loading, simulatedRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100">
        <FaDumbbell className="text-5xl text-red-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-outfit uppercase tracking-widest animate-pulse">Loading FitZone Pro...</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  const roleRoutes = {
    Admin: ['/', '/analytics', '/payments', '/notifications', '/settings'],
    Trainer: ['/', '/members', '/workouts', '/notifications', '/settings'],
    Member: ['/', '/memberships', '/trainers', '/attendance', '/notifications', '/settings']
  };

  const allowedRoutes = roleRoutes[simulatedRole] || ['/', '/notifications', '/settings'];

  if (!allowedRoutes.includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-inter transition-colors duration-200">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
