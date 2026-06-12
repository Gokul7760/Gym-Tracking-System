import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  FaUsers, FaRupeeSign, FaUserClock, FaTimesCircle, FaDumbbell, 
  FaCalendarCheck, FaRunning, FaLock, FaUser
} from 'react-icons/fa';

const Dashboard = () => {
  const { simulatedRole } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await API.get('/dashboard');
        setData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [simulatedRole]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <FaDumbbell className="text-4xl text-red-500 animate-spin mr-3" />
        <span className="text-slate-600 dark:text-slate-400 font-semibold">Loading stats...</span>
      </div>
    );
  }

  const PIE_COLORS = ['#EF4444', '#3B82F6', '#10B981']; // Red, Blue, Green

  // ================= ADMIN DASHBOARD =================
  const renderAdminDashboard = () => {
    const cards = data?.cards || {
      total_members: 1248,
      total_members_change: "+12%",
      monthly_revenue: "₹4.2 Lakhs",
      monthly_revenue_change: "+8.5%",
      active_trainers: 18,
      expiring_memberships: 47
    };

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Total Members */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Members</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1 font-outfit">{cards.total_members.toLocaleString()}</h3>
              <span className="text-xs font-bold text-green-500 mt-1 block">{cards.total_members_change} this month</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <FaUsers className="text-2xl" />
            </div>
          </div>

          {/* Card 2: Monthly Revenue */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Monthly Revenue</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1 font-outfit">{cards.monthly_revenue}</h3>
              <span className="text-xs font-bold text-red-500 mt-1 block">{cards.monthly_revenue_change} this month</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <FaRupeeSign className="text-2xl" />
            </div>
          </div>

          {/* Card 3: Active Trainers */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Active Trainers</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1 font-outfit">{cards.active_trainers}</h3>
              <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">3 slots open</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <FaUserClock className="text-2xl" />
            </div>
          </div>

          {/* Card 4: Expiring Memberships */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Expiring Soon</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1 font-outfit">{cards.expiring_memberships}</h3>
              <span className="text-xs font-bold text-amber-500 mt-1 block">Needs renewal</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <FaTimesCircle className="text-2xl" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue Analytics Bar Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">Monthly Revenue (₹ Lakhs)</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.revenue_chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(239, 68, 68, 0.05)' }} />
                  <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Membership Mix Doughnut Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">Membership Mix</h4>
            <div className="h-64 relative flex flex-col justify-center items-center">
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={data?.membership_mix}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data?.membership_mix?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    verticalAlign="bottom" 
                    iconType="circle" 
                    formatter={(value, entry) => {
                      const percentage = entry.payload.value;
                      return <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{value} {percentage}%</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Members */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">Recent Members</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                    <th className="pb-3">Name</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40 text-sm">
                  {data?.recent_members?.map((member, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                      <td className="py-3.5 font-medium text-slate-800 dark:text-slate-200">{member.name}</td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                          member.status === 'New' 
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                            : member.status === 'Active' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Plan Utilization */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">Plan Utilization</h4>
            <div className="space-y-6">
              {data?.plan_utilization?.map((plan, i) => {
                // Find highest member count for progress calculation (max of Basic, Premium, Elite)
                const maxMembers = Math.max(...(data.plan_utilization.map(p => p.members)));
                const pct = maxMembers > 0 ? (plan.members / maxMembers) * 100 : 0;
                
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{plan.name}</span>
                      <span className="font-bold">{plan.members} members</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${pct}%`,
                          backgroundColor: plan.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ================= TRAINER DASHBOARD =================
  const renderTrainerDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow-xl">
          <h2 className="text-2xl font-bold font-outfit uppercase">Trainer Control Board</h2>
          <p className="text-blue-100 text-sm mt-1">Manage assigned member workouts, record check-ins, and keep track of daily exercise schedules.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trainer Quick stats */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between col-span-1">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Assigned Clients</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1 font-outfit">12</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <FaUsers className="text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between col-span-1">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Active Programs Today</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1 font-outfit">4</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <FaDumbbell className="text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between col-span-1">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Completed Sessions</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1 font-outfit">8 / 12</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <FaCalendarCheck className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workout Schedule */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaRunning className="text-red-500" /> Active Workout Routines
            </h3>
            <div className="space-y-4">
              <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer">
                <span className="text-xs font-bold text-blue-500 uppercase">Rahul Sharma Assigned</span>
                <h4 className="font-semibold text-sm text-slate-800 dark:text-white mt-1">Bench Press Routine (Push Day)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Assigned to: Arjun Sharma</p>
                <div className="flex gap-4 mt-2 text-xs font-semibold text-slate-400">
                  <span>Sets: 4</span>
                  <span>Reps: 10</span>
                  <span>Duration: 45 min</span>
                </div>
              </div>
              <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer">
                <span className="text-xs font-bold text-green-500 uppercase">Strength hypertrohpy</span>
                <h4 className="font-semibold text-sm text-slate-800 dark:text-white mt-1">Barbell Squats Routine</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Assigned to: Priya Nair</p>
                <div className="flex gap-4 mt-2 text-xs font-semibold text-slate-400">
                  <span>Sets: 4</span>
                  <span>Reps: 8</span>
                  <span>Duration: 50 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Members Check-in list */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaCalendarCheck className="text-blue-500" /> Member check-in logs
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              <div className="py-3 flex justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Arjun Sharma</span>
                  <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-full font-bold ml-2 uppercase">Basic</span>
                </div>
                <span className="text-xs text-slate-400">Checked In 07:30 AM</span>
              </div>
              <div className="py-3 flex justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Priya Nair</span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-full font-bold ml-2 uppercase">Premium</span>
                </div>
                <span className="text-xs text-slate-400">Checked In 08:15 AM</span>
              </div>
              <div className="py-3 flex justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Karthik R</span>
                  <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-full font-bold ml-2 uppercase">Elite</span>
                </div>
                <span className="text-xs text-red-500 font-medium">Late Check In 06:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ================= MEMBER DASHBOARD =================
  const renderMemberDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-tr from-red-600 to-amber-600 p-6 rounded-2xl text-white shadow-xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-outfit uppercase">FitZone Member Portal</h2>
            <p className="text-red-100 text-sm mt-1">Welcome back! Review your training plan, check-in history, and active membership card details.</p>
          </div>
          <FaDumbbell className="text-5xl text-white/20 hidden md:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Membership Card details */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-1 flex flex-col justify-between h-56 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Premium Member</span>
                <span className="text-xs bg-green-500/10 text-green-500 font-bold border border-green-500/20 px-2 py-0.5 rounded-full">ACTIVE</span>
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white mt-4 font-outfit uppercase">member@fitzone.com</h3>
              <p className="text-xs text-slate-400 mt-1">Joining Date: {new Date().toLocaleDateString}</p>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex justify-between items-center text-xs">
              <span className="text-slate-400">Monthly renewal due in 24 days</span>
              <span className="font-bold text-slate-800 dark:text-white">₹1,799 / mo</span>
            </div>
          </div>

          {/* Assigned Workouts */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2 h-56 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">Assigned training schedule</h4>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <h5 className="font-bold text-slate-800 dark:text-white text-sm">Bench Press (Push Day Routine)</h5>
                <p className="text-xs text-slate-500 mt-1">Instructor: Rahul Sharma</p>
                <div className="flex gap-6 mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded">Sets: 4</span>
                  <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded">Reps: 10</span>
                  <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded">Duration: 45 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Check in Logs history */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Your Recent check-in Logs</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Check In</th>
                  <th className="pb-3">Check Out</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40 text-sm">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                  <td className="py-3 font-medium text-slate-800 dark:text-slate-200">Today</td>
                  <td className="py-3 text-slate-500">07:30 AM</td>
                  <td className="py-3 text-slate-500">08:45 AM</td>
                  <td className="py-3 text-right"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-green-500/10 text-green-500 border-green-500/20 uppercase">Present</span></td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                  <td className="py-3 font-medium text-slate-800 dark:text-slate-200">Yesterday</td>
                  <td className="py-3 text-slate-500">07:40 AM</td>
                  <td className="py-3 text-slate-500">08:40 AM</td>
                  <td className="py-3 text-right"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-green-500/10 text-green-500 border-green-500/20 uppercase">Present</span></td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                  <td className="py-3 font-medium text-slate-800 dark:text-slate-200">3 days ago</td>
                  <td className="py-3 text-slate-500">-</td>
                  <td className="py-3 text-slate-500">-</td>
                  <td className="py-3 text-right"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-500/10 text-red-500 border-red-500/20 uppercase">Absent</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render appropriate dashboard view based on simulated role
  switch (simulatedRole) {
    case 'Admin':
      return renderAdminDashboard();
    case 'Trainer':
      return renderTrainerDashboard();
    case 'Member':
      return renderMemberDashboard();
    default:
      return renderAdminDashboard();
  }
};

export default Dashboard;
