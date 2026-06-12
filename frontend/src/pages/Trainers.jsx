import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useForm } from 'react-hook-form';
import { FaPlus, FaSearch, FaTrash, FaEdit, FaSpinner, FaTimes, FaUserTie } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Trainers = () => {
  const { simulatedRole } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/trainers');
      setTrainers(res.data);
    } catch (err) {
      console.error("Error fetching trainers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const openAddModal = () => {
    setEditingTrainer(null);
    reset({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      salary: '',
      experience: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (trainer) => {
    setEditingTrainer(trainer);
    reset({
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone || '',
      specialization: trainer.specialization || '',
      salary: trainer.salary || '',
      experience: trainer.experience || '',
      status: trainer.status
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingTrainer) {
        await API.put(`/trainers/${editingTrainer.id}`, data);
      } else {
        await API.post('/trainers/', data);
      }
      setIsModalOpen(false);
      fetchTrainers();
    } catch (err) {
      console.error("Error saving trainer", err);
      alert(err.response?.data?.detail || "Failed to save trainer details.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this trainer?")) {
      try {
        await API.delete(`/trainers/${id}`);
        fetchTrainers();
      } catch (err) {
        console.error("Error deleting trainer", err);
        alert("Only Administrators can delete trainer records.");
      }
    }
  };

  const isAdmin = simulatedRole === 'Admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-outfit uppercase tracking-wider text-slate-800 dark:text-white">Trainers Team</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">View and manage gym trainers, qualifications, and payroll details.</p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition shadow-lg shadow-red-500/10 flex items-center gap-2"
          >
            <FaPlus /> Add Trainer
          </button>
        )}
      </div>

      {/* Trainers Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <FaSpinner className="text-3xl text-red-500 animate-spin mr-2" />
          <span className="text-slate-500 dark:text-slate-400 font-semibold">Loading trainers...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <div key={trainer.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 relative overflow-hidden flex flex-col justify-between h-64">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                      <FaUserTie className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-base">{trainer.name}</h3>
                      <span className="text-xs text-slate-400 font-medium block">{trainer.specialization || 'General Instructor'}</span>
                    </div>
                  </div>

                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    trainer.status === 'Active' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  }`}>
                    {trainer.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <p><strong className="text-slate-700 dark:text-slate-300">Email:</strong> {trainer.email}</p>
                  <p><strong className="text-slate-700 dark:text-slate-300">Phone:</strong> {trainer.phone || 'N/A'}</p>
                  <p><strong className="text-slate-700 dark:text-slate-300">Experience:</strong> {trainer.experience || 0} years</p>
                  {isAdmin && <p><strong className="text-slate-700 dark:text-slate-300">Salary:</strong> ₹{parseFloat(trainer.salary || 0).toLocaleString()}</p>}
                </div>
              </div>

              {isAdmin && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 flex justify-end gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(trainer)}
                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                    title="Edit Profile"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(trainer.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                    title="Remove Trainer"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg dark:text-white font-outfit uppercase">
                {editingTrainer ? 'Edit Trainer profile' : 'Add New Trainer'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  {...register('name', { required: true })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  {...register('email', { required: true })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    {...register('phone')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Specialization</label>
                  <input
                    type="text"
                    {...register('specialization')}
                    placeholder="e.g. Yoga, Strength"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    {...register('salary')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Experience (Years)</label>
                  <input
                    type="number"
                    {...register('experience')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  Save Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainers;
