import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useForm } from 'react-hook-form';
import { FaPlus, FaTrash, FaEdit, FaSpinner, FaTimes, FaIdCard } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Memberships = () => {
  const { simulatedRole } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await API.get('/memberships');
      setPlans(res.data);
    } catch (err) {
      console.error("Error fetching plans", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openAddModal = () => {
    setEditingPlan(null);
    reset({
      plan_name: '',
      price: '',
      duration: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    reset({
      plan_name: plan.plan_name,
      price: plan.price,
      duration: plan.duration,
      description: plan.description || ''
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingPlan) {
        await API.put(`/memberships/${editingPlan.id}`, data);
      } else {
        await API.post('/memberships/', data);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error("Error saving plan", err);
      alert(err.response?.data?.detail || "Failed to save plan details.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this membership plan?")) {
      try {
        await API.delete(`/memberships/${id}`);
        fetchPlans();
      } catch (err) {
        console.error("Error deleting plan", err);
        alert("Only Administrators can modify or delete memberships.");
      }
    }
  };

  const isAdmin = simulatedRole === 'Admin';

  const cardColors = [
    { border: 'border-red-500/20', glow: 'shadow-red-500/5', bg: 'from-red-500/5 to-amber-500/5', text: 'text-red-500' },
    { border: 'border-blue-500/20', glow: 'shadow-blue-500/5', bg: 'from-blue-500/5 to-indigo-500/5', text: 'text-blue-500' },
    { border: 'border-green-500/20', glow: 'shadow-green-500/5', bg: 'from-green-500/5 to-emerald-500/5', text: 'text-green-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-outfit uppercase tracking-wider text-slate-800 dark:text-white">Membership Plans</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure pricing models, validity duration, and plan descriptions.</p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition shadow-lg shadow-red-500/10 flex items-center gap-2"
          >
            <FaPlus /> Create Plan
          </button>
        )}
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <FaSpinner className="text-3xl text-red-500 animate-spin mr-2" />
          <span className="text-slate-500 dark:text-slate-400 font-semibold">Loading membership tiers...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const styles = cardColors[i % cardColors.length];
            return (
              <div 
                key={plan.id} 
                className={`bg-white dark:bg-slate-900 border ${styles.border} rounded-2xl shadow-sm ${styles.glow} p-6 flex flex-col justify-between h-72 relative overflow-hidden`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${styles.text}`}>
                        <FaIdCard className="text-lg" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 dark:text-white text-lg font-outfit uppercase">{plan.plan_name}</h3>
                        <span className="text-xs text-slate-400 font-medium">Tier {i + 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-3xl font-black text-slate-800 dark:text-white font-outfit">
                      ₹{parseFloat(plan.price).toLocaleString()}
                      <span className="text-xs font-normal text-slate-400"> / {plan.duration} {plan.duration === 1 ? 'Month' : 'Months'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                      {plan.description || 'No description provided for this membership tier.'}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex justify-end gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                      title="Edit Plan"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                      title="Delete Plan"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg dark:text-white font-outfit uppercase">
                {editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Plan Name</label>
                <input
                  type="text"
                  {...register('plan_name', { required: true })}
                  placeholder="e.g. Basic, Premium, Elite"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    {...register('price', { required: true, min: 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Duration (Months)</label>
                  <input
                    type="number"
                    {...register('duration', { required: true, min: 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Describe what's included in this tier..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
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
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Memberships;
