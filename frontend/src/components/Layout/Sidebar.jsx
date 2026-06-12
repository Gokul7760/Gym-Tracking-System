import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaDumbbell, 
  FaUsers, 
  FaUserTie, 
  FaIdCard, 
  FaCalendarCheck, 
  FaRunning, 
  FaCreditCard, 
  FaChartBar, 
  FaBell, 
  FaCog
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

const Sidebar = () => {
  const { simulatedRole } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <MdDashboard /> },
    { name: 'Members', path: '/members', icon: <FaUsers /> },
    { name: 'Trainers', path: '/trainers', icon: <FaUserTie /> },
    { name: 'Memberships', path: '/memberships', icon: <FaIdCard /> },
    { name: 'Attendance', path: '/attendance', icon: <FaCalendarCheck /> },
    { name: 'Workouts', path: '/workouts', icon: <FaRunning /> },
    { name: 'Payments', path: '/payments', icon: <FaCreditCard /> },
    { name: 'Analytics', path: '/analytics', icon: <FaChartBar /> },
    { name: 'Notifications', path: '/notifications', icon: <FaBell /> },
    { name: 'Settings', path: '/settings', icon: <FaCog /> },
  ];

  const roleRoutes = {
    Admin: ['/', '/analytics', '/payments', '/notifications', '/settings'],
    Trainer: ['/', '/members', '/workouts', '/notifications', '/settings'],
    Member: ['/', '/memberships', '/trainers', '/attendance', '/notifications', '/settings']
  };

  const allowedNavItems = navItems.filter(item => 
    (roleRoutes[simulatedRole] || ['/', '/notifications', '/settings']).includes(item.path)
  );

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 p-4 transition-all duration-300 shrink-0">
      <div>
        {/* Header / Logo */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
          <FaDumbbell className="text-red-500 text-3xl animate-pulse" />
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white font-outfit">FITZONE PRO</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Gym Management</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="text-[10px] font-semibold text-slate-500 px-3 uppercase tracking-wider mb-2">Navigation</p>
          {allowedNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

    </aside>
  );
};

export default Sidebar;
