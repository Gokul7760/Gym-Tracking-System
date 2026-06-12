import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useForm } from 'react-hook-form';
import { FaPlus, FaTrash, FaSpinner, FaTimes, FaRupeeSign, FaCheck, FaExclamationTriangle, FaUniversity } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Payments = () => {
  const { simulatedRole } = useAuth();
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ total_revenue: 0.0, pending_payments_count: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState('All'); // All, Paid, Pending

  const { register, handleSubmit, reset } = useForm();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/payments/', {
        params: { status: viewFilter === 'All' ? null : viewFilter }
      });
      setPayments(res.data);
      
      const statsRes = await API.get('/payments/dashboard-stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error("Error fetching payments", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await API.get('/members', { params: { size: 100 } });
      setMembers(res.data.items);
    } catch (err) {
      console.error("Error fetching members", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [viewFilter]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const openAddModal = () => {
    reset({
      member_id: members[0]?.id || '',
      amount: '',
      payment_method: 'UPI',
      payment_date: new Date().toISOString().split('T')[0],
      status: 'Paid'
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        member_id: parseInt(data.member_id),
        amount: parseFloat(data.amount)
      };
      await API.post('/payments/', payload);
      setIsModalOpen(false);
      fetchPayments();
    } catch (err) {
      console.error("Error creating payment record", err);
      alert(err.response?.data?.detail || "Failed to create payment record.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment record?")) {
      try {
        await API.delete(`/payments/${id}`);
        fetchPayments();
      } catch (err) {
        console.error("Error deleting payment", err);
        alert("Failed to delete payment record.");
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.put(`/payments/${id}`, { status });
      fetchPayments();
    } catch (err) {
      console.error("Error updating payment status", err);
    }
  };

  const isAdmin = simulatedRole === 'Admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-outfit uppercase tracking-wider text-slate-800 dark:text-white">Transaction Ledger</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Record payments, trace monthly invoice history, and manage defaults.</p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition shadow-lg shadow-red-500/10 flex items-center gap-2"
          >
            <FaPlus /> Record Payment
          </button>
        )}
      </div>

      {/* Revenue Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-tr from-emerald-600 to-teal-600 p-6 rounded-2xl text-white shadow-lg flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100 block">Total Collections</span>
            <h3 className="text-3xl font-black mt-1 font-outfit">₹{stats.total_revenue.toLocaleString()}</h3>
          </div>
          <FaRupeeSign className="text-4xl text-emerald-200/50" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">Pending Invoices</span>
            <h3 className="text-3xl font-black mt-1 font-outfit text-slate-800 dark:text-white">{stats.pending_payments_count}</h3>
          </div>
          <FaExclamationTriangle className="text-3xl text-amber-500/80" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">Accounting Status</span>
            <h3 className="text-lg font-bold mt-1 text-green-500 flex items-center gap-1.5"><FaCheck /> Books Audited</h3>
          </div>
          <FaUniversity className="text-3xl text-blue-500/80" />
        </div>
      </div>

      {/* Roster Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {['All', 'Paid', 'Pending'].map((filter) => (
            <button
              key={filter}
              onClick={() => setViewFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewFilter === filter
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger list table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <FaSpinner className="text-3xl text-red-500 animate-spin mr-2" />
          <span className="text-slate-500 dark:text-slate-400 font-semibold">Updating ledger...</span>
        </div>
      ) : payments.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500">
          <FaExclamationTriangle className="text-3xl text-slate-200 mb-2" />
          <span className="text-xs">No transaction receipts found matching criteria.</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/10">
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Member Name</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Payment Date</th>
                  <th className="p-4">Status</th>
                  {isAdmin && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition">
                    <td className="p-4 font-mono text-xs text-slate-400">#INV-00{p.id}</td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{p.member_name}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-white">₹{parseFloat(p.amount).toLocaleString()}</td>
                    <td className="p-4 text-slate-500 text-xs">{p.payment_method || 'N/A'}</td>
                    <td className="p-4 text-slate-500">{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        p.status === 'Paid' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : p.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-right space-x-2 shrink-0">
                        {p.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'Paid')}
                            className="text-xs bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white px-2 py-1 rounded transition font-bold"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition text-xs inline-block align-middle"
                          title="Delete Record"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg dark:text-white font-outfit uppercase">
                Record Payment
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Member</label>
                <select
                  {...register('member_id', { required: true })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Billing Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('amount', { required: true, min: 1 })}
                    placeholder="e.g. 1799"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Payment Method</label>
                  <select
                    {...register('payment_method')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="NetBanking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Payment Date</label>
                  <input
                    type="date"
                    {...register('payment_date', { required: true })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold uppercase transition"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
