import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useForm } from 'react-hook-form';
import { FaSpinner, FaCalendarCheck, FaClock, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { simulatedRole } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateVal, setDateVal] = useState(new Date().toISOString().split('T')[0]);
  
  // Monthly report states
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyLogs, setMonthlyLogs] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchDailyAttendance = async () => {
    setLoading(true);
    try {
      const res = await API.get('/attendance/', {
        params: { date_val: dateVal }
      });
      setAttendanceList(res.data);
    } catch (err) {
      console.error("Error fetching attendance", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await API.get('/members', { params: { size: 100 } });
      setMembers(res.data.items);
      if (res.data.items.length > 0) {
        setSelectedMember(res.data.items[0].id);
      }
    } catch (err) {
      console.error("Error fetching members", err);
    }
  };

  useEffect(() => {
    fetchDailyAttendance();
  }, [dateVal]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMonthlyReport = async () => {
    if (!selectedMember) return;
    setLoadingMonthly(true);
    try {
      const res = await API.get('/attendance/monthly', {
        params: {
          member_id: selectedMember,
          month: selectedMonth,
          year: selectedYear
        }
      });
      setMonthlyLogs(res.data);
    } catch (err) {
      console.error("Error fetching monthly report", err);
    } finally {
      setLoadingMonthly(false);
    }
  };

  const onMark = async (data) => {
    try {
      const now = new Date();
      const checkInStr = data.status === 'Present' || data.status === 'Late' 
        ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`
        : null;
        
      await API.post('/attendance/', {
        member_id: parseInt(data.member_id),
        date: dateVal,
        check_in: checkInStr,
        check_out: null,
        status: data.status
      });
      fetchDailyAttendance();
      reset();
    } catch (err) {
      console.error("Error marking attendance", err);
      alert(err.response?.data?.detail || "Failed to mark attendance.");
    }
  };

  const isStaff = simulatedRole === 'Admin' || simulatedRole === 'Trainer';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold font-outfit uppercase tracking-wider text-slate-800 dark:text-white">Attendance Logs</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Track daily check-ins, record check-outs, and review member logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Mark Attendance & Roster */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mark Attendance Card */}
          {isStaff && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaCalendarCheck className="text-red-500" /> Mark Daily Attendance
              </h3>
              <form onSubmit={handleSubmit(onMark)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Member</label>
                  <select
                    {...register('member_id', { required: true })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    {...register('status', { required: true })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition shadow-lg shadow-red-500/10 flex justify-center items-center gap-2 h-10"
                >
                  <FaCheck /> Confirm Mark
                </button>
              </form>
            </div>
          )}

          {/* Roster Logs list */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Attendance Roster</h3>
              <input
                type="date"
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <FaSpinner className="text-3xl text-red-500 animate-spin mr-2" />
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Updating roster...</span>
              </div>
            ) : attendanceList.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <FaExclamationTriangle className="text-2xl mb-2 text-slate-300" />
                <span className="text-xs">No check-in logs registered for this date.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase pb-3 bg-slate-50/50 dark:bg-slate-800/10">
                      <th className="p-3">Member</th>
                      <th className="p-3">Check In</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
                    {attendanceList.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition">
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{log.member_name}</td>
                        <td className="p-3 text-slate-500 text-xs flex items-center gap-1.5 py-4">
                          <FaClock className="text-slate-400" /> {log.check_in || '--:--'}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                            log.status === 'Present' 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                              : log.status === 'Late' 
                              ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' 
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Monthly Report Lookup */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">Monthly member logs</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Member</label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2020, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            <button
              onClick={fetchMonthlyReport}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg text-sm font-semibold uppercase transition h-10 flex justify-center items-center"
            >
              Get Log Report
            </button>
          </div>

          {/* Monthly Logs Display */}
          {loadingMonthly ? (
            <div className="py-6 flex items-center justify-center">
              <FaSpinner className="text-xl text-slate-600 animate-spin mr-2" />
              <span className="text-xs text-slate-500 font-semibold">Generating report...</span>
            </div>
          ) : monthlyLogs.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {monthlyLogs.map((log) => (
                <div key={log.id} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      {new Date(log.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-slate-400 mt-0.5 block">{log.check_in ? `In: ${log.check_in}` : 'No time logged'}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    log.status === 'Present' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : log.status === 'Late' 
                      ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
              Select variables above and click Get Log Report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
