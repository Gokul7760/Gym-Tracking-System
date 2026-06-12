import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useForm } from 'react-hook-form';
import { FaPlus, FaSearch, FaTrash, FaEdit, FaSpinner, FaTimes, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Members = () => {
  const { simulatedRole } = useAuth();
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/members', {
        params: { page, size: 5, search }
      });
      setMembers(res.data.items);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error("Error fetching members", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await API.get('/memberships');
      setPlans(res.data);
    } catch (err) {
      console.error("Error fetching plans", err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page, search]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    reset({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: 'Male',
      dob: '',
      address: '',
      membership_plan_id: plans[0]?.id || '',
      joining_date: new Date().toISOString().split('T')[0],
      status: 'New'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    reset({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone || '',
      gender: member.gender || 'Male',
      dob: member.dob || '',
      address: member.address || '',
      membership_plan_id: member.membership_plan_id || '',
      joining_date: member.joining_date,
      status: member.status
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingMember) {
        await API.put(`/members/${editingMember.id}`, data);
      } else {
        await API.post('/members/', data);
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (err) {
      console.error("Error saving member", err);
      alert(err.response?.data?.detail || "Failed to save member details.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await API.delete(`/members/${id}`);
        fetchMembers();
      } catch (err) {
        console.error("Error deleting member", err);
        alert("Only Administrators can delete member records.");
      }
    }
  };

  const isEditable = simulatedRole === 'Admin' || simulatedRole === 'Trainer';
  const isDeletable = simulatedRole === 'Admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-outfit uppercase tracking-wider text-slate-800 dark:text-white">Members Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">View, search, edit, and configure member status profiles.</p>
        </div>

        {isEditable && (
          <button
            onClick={openAddModal}
            className="bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition shadow-lg shadow-red-500/10 flex items-center gap-2"
          >
            <FaPlus /> Add Member
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
            <FaSearch className="text-sm" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">Page {page} of {totalPages}</span>
      </div>

      {/* Members Table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <FaSpinner className="text-3xl text-red-500 animate-spin mr-2" />
          <span className="text-slate-500 dark:text-slate-400 font-semibold">Fetching members...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/10">
                  <th className="p-4">Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Membership Plan</th>
                  <th className="p-4">Joining Date</th>
                  <th className="p-4">Status</th>
                  {isEditable && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition">
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <FaUser className="text-xs" />
                      </div>
                      <div>
                        <span className="block font-semibold">{member.first_name} {member.last_name}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 block">{member.gender}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="block text-slate-700 dark:text-slate-300">{member.email}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 block">{member.phone}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {member.membership_plan?.plan_name || 'None'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(member.joining_date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        member.status === 'New' 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                          : member.status === 'Active' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : member.status === 'Expiring' 
                          ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                          : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    {isEditable && (
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                          title="Edit Profile"
                        >
                          <FaEdit />
                        </button>
                        {isDeletable && (
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                            title="Delete Member"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/10">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 disabled:opacity-50 transition"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg dark:text-white font-outfit uppercase">
                {editingMember ? 'Edit Member Profile' : 'Register New Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">First Name</label>
                  <input
                    type="text"
                    {...register('first_name', { required: true })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input
                    type="text"
                    {...register('last_name', { required: true })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
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
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
                  <select
                    {...register('gender')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    {...register('dob')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Joining Date</label>
                  <input
                    type="date"
                    {...register('joining_date', { required: true })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Address</label>
                <textarea
                  {...register('address')}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Membership Plan</label>
                  <select
                    {...register('membership_plan_id')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.plan_name} (₹{p.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="New">New</option>
                    <option value="Active">Active</option>
                    <option value="Expiring">Expiring</option>
                    <option value="Inactive">Inactive</option>
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
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
