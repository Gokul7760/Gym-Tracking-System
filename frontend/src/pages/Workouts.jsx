import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useForm } from 'react-hook-form';
import { FaPlus, FaTrash, FaEdit, FaSpinner, FaTimes, FaDumbbell, FaClock, FaRedo } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Workouts = () => {
  const { simulatedRole } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/workouts/');
      setWorkouts(res.data);
    } catch (err) {
      console.error("Error fetching workouts", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const membersRes = await API.get('/members', { params: { size: 100 } });
      const trainersRes = await API.get('/trainers');
      setMembers(membersRes.data.items);
      setTrainers(trainersRes.data);
    } catch (err) {
      console.error("Error fetching dropdowns", err);
    }
  };

  useEffect(() => {
    fetchWorkouts();
    fetchDropdownData();
  }, []);

  const openAddModal = () => {
    setEditingWorkout(null);
    reset({
      member_id: members[0]?.id || '',
      trainer_id: trainers[0]?.id || '',
      workout_name: '',
      exercise: '',
      sets: 3,
      reps: 10,
      duration: 30
    });
    setIsModalOpen(true);
  };

  const openEditModal = (w) => {
    setEditingWorkout(w);
    reset({
      member_id: w.member_id,
      trainer_id: w.trainer_id || '',
      workout_name: w.workout_name,
      exercise: w.exercise,
      sets: w.sets,
      reps: w.reps,
      duration: w.duration
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        member_id: parseInt(data.member_id),
        trainer_id: data.trainer_id ? parseInt(data.trainer_id) : null,
        sets: parseInt(data.sets),
        reps: parseInt(data.reps),
        duration: parseInt(data.duration)
      };

      if (editingWorkout) {
        await API.put(`/workouts/${editingWorkout.id}`, payload);
      } else {
        await API.post('/workouts/', payload);
      }
      setIsModalOpen(false);
      fetchWorkouts();
    } catch (err) {
      console.error("Error saving workout", err);
      alert(err.response?.data?.detail || "Failed to save workout details.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this workout?")) {
      try {
        await API.delete(`/workouts/${id}`);
        fetchWorkouts();
      } catch (err) {
        console.error("Error deleting workout", err);
        alert("Failed to delete workout.");
      }
    }
  };

  const isStaff = simulatedRole === 'Admin' || simulatedRole === 'Trainer';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-outfit uppercase tracking-wider text-slate-800 dark:text-white">Workout Programs</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Design member exercises, configure sets, reps, and track durations.</p>
        </div>

        {isStaff && (
          <button
            onClick={openAddModal}
            className="bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition shadow-lg shadow-red-500/10 flex items-center gap-2"
          >
            <FaPlus /> Assign Workout
          </button>
        )}
      </div>

      {/* Workouts Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <FaSpinner className="text-3xl text-red-500 animate-spin mr-2" />
          <span className="text-slate-500 dark:text-slate-400 font-semibold">Updating workout plans...</span>
        </div>
      ) : workouts.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500">
          <FaDumbbell className="text-4xl text-slate-200 mb-2 animate-bounce" />
          <span className="text-sm font-medium">No workout plans assigned yet.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workouts.map((w) => (
            <div key={w.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-56 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>

              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base font-outfit uppercase">{w.workout_name}</h3>
                    <p className="text-xs text-red-500 font-bold uppercase mt-0.5">{w.exercise}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">Assigned To</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{w.member_name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <FaRedo className="text-slate-400" /> Sets: <strong className="text-slate-800 dark:text-white">{w.sets}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <FaDumbbell className="text-slate-400" /> Reps: <strong className="text-slate-800 dark:text-white">{w.reps}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <FaClock className="text-slate-400" /> Time: <strong className="text-slate-800 dark:text-white">{w.duration}m</strong>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex justify-between items-center shrink-0">
                <span className="text-[10px] text-slate-400">Coach: <strong className="text-slate-600 dark:text-slate-300">{w.trainer_name}</strong></span>
                {isStaff && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(w)}
                      className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition text-xs"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition text-xs"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
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
                {editingWorkout ? 'Edit Workout Plan' : 'Assign Workout Program'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gym Member</label>
                  <select
                    {...register('member_id', { required: true })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Trainer Coach</label>
                  <select
                    {...register('trainer_id')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">-- None Assigned --</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Workout Routine Name</label>
                <input
                  type="text"
                  {...register('workout_name', { required: true })}
                  placeholder="e.g. Cardio Blitz, Strength Building"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Exercise</label>
                <input
                  type="text"
                  {...register('exercise', { required: true })}
                  placeholder="e.g. Bench Press, Treadmill Run"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sets</label>
                  <input
                    type="number"
                    {...register('sets', { required: true, min: 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Reps</label>
                  <input
                    type="number"
                    {...register('reps', { required: true, min: 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Time (Min)</label>
                  <input
                    type="number"
                    {...register('duration', { required: true, min: 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
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
                  Assign Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workouts;
