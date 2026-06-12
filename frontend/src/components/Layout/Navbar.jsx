import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBell, FaSearch, FaSun, FaMoon, FaSignOutAlt, FaUser } from 'react-icons/fa';

const Navbar = () => {
  const { user, simulatedRole, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const notifications = [
    { id: 1, text: "Payment of ₹1,799 received from Priya Nair", time: "5 mins ago" },
    { id: 2, text: "New member Arjun Sharma registered", time: "2 hours ago" },
    { id: 3, text: "Karthik R's membership is expiring in 3 days", time: "1 day ago" }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Trainer': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Member': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between transition-colors duration-200 shrink-0">
      {/* Search Bar */}
      <div className="relative w-64">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <FaSearch className="text-sm" />
        </span>
        <input
          type="text"
          placeholder="Search members, activities..."
          className="w-full pl-9 pr-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
        />
      </div>

      {/* Action Items */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Dark Mode"
        >
          {darkMode ? <FaSun className="text-amber-500 text-lg" /> : <FaMoon className="text-slate-600 text-lg" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <FaBell className="text-lg" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-2">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <span className="font-semibold text-sm dark:text-white">Notifications</span>
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">3 New</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-50 dark:border-slate-700/30 last:border-b-0 cursor-pointer">
                    <p className="text-xs text-slate-700 dark:text-slate-200">{n.text}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card & Role Badge */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right">
            <span className="text-sm font-semibold block text-slate-800 dark:text-slate-200">
              {user?.email ? user.email.split('@')[0] : 'User'}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getRoleColor(simulatedRole)}`}>
              {simulatedRole}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-md shadow-red-500/10">
            <FaUser className="text-sm" />
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          title="Logout"
        >
          <FaSignOutAlt className="text-lg" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
