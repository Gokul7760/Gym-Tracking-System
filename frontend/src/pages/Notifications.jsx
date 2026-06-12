import React from 'react';
import { FaBell, FaInfoCircle, FaCalendarTimes, FaCheckCircle } from 'react-icons/fa';

const Notifications = () => {
  const alerts = [
    {
      id: 1,
      type: 'payment',
      title: 'Payment Received',
      desc: 'Monthly membership payment of ₹1,799 successfully recorded for Priya Nair.',
      time: '5 mins ago',
      icon: <FaCheckCircle className="text-green-500 text-lg" />,
      bg: 'bg-green-500/5 border-green-500/10'
    },
    {
      id: 2,
      type: 'expiry',
      title: 'Membership Expiring Soon',
      desc: 'Karthik R\'s Premium membership tier is expiring in 3 days. Send renewal reminder.',
      time: '1 day ago',
      icon: <FaCalendarTimes className="text-amber-500 text-lg" />,
      bg: 'bg-amber-500/5 border-amber-500/10'
    },
    {
      id: 3,
      type: 'registration',
      title: 'New Member Onboarded',
      desc: 'Arjun Sharma registered using Member login. Basic plan selected.',
      time: '2 hours ago',
      icon: <FaInfoCircle className="text-blue-500 text-lg" />,
      bg: 'bg-blue-500/5 border-blue-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold font-outfit uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
          <FaBell className="text-red-500" /> Notifications & Alerts
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">View real-time alerts regarding collections, expiries, and user updates.</p>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-4 border ${alert.bg} rounded-xl flex gap-4 items-start transition hover:scale-[1.005] duration-150`}
          >
            <div className="mt-0.5 shrink-0">{alert.icon}</div>
            <div className="flex-1">
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">{alert.title}</h3>
                <span className="text-[10px] text-slate-400 font-semibold">{alert.time}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{alert.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
