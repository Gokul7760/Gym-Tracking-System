import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaCog, FaServer, FaUserLock, FaSun, FaMoon } from 'react-icons/fa';

const Settings = () => {
  const { user, simulatedRole } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold font-outfit uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
          <FaCog className="text-red-500" /> Portal Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage system connections, profile configurations, and interface options.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FaServer className="text-blue-500" /> Database & API Sync
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">FastAPI Endpoints:</span>
              <span className="font-mono text-emerald-500 font-bold">CONNECTED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Base URL:</span>
              <span className="font-mono text-slate-500">{import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">MySQL Session:</span>
              <span className="font-mono text-emerald-500 font-bold">READY (Fallback Enabled)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">API Version:</span>
              <span className="font-mono text-slate-500">v1.0.0 (REST JSON)</span>
            </div>
          </div>
        </div>

        {/* User profile configuration */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FaUserLock className="text-red-500" /> Session & Roles
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Active User Email:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{user?.email || 'Not logged in'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Assigned Database Role:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">{user?.role || 'Guest'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Simulated Control Level:</span>
              <span className="font-bold text-red-500 uppercase">{simulatedRole}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
