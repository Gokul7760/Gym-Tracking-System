import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaDumbbell, FaLock, FaEnvelope, FaSpinner } from 'react-icons/fa';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setErrorMsg('');
    setIsSubmitting(true);
    const result = await login(data.email, data.password);
    setIsSubmitting(false);
    
    if (result.success) {
      navigate('/');
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleAutofill = (email, password) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-2xl relative z-10">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-3">
            <FaDumbbell className="text-red-500 text-3xl animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight font-outfit uppercase">FITZONE PRO</h2>
          <p className="text-xs text-slate-400">Gym Management Portal</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email field */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <FaEnvelope className="text-sm" />
              </span>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="admin@fitzone.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            {errors.email && <span className="text-[10px] text-red-500 mt-1 block">{errors.email.message}</span>}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <FaLock className="text-sm" />
              </span>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            {errors.password && <span className="text-[10px] text-red-500 mt-1 block">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 mt-6"
          >
            {isSubmitting ? <FaSpinner className="animate-spin text-lg" /> : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Quickfill */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3">Autofill Demo Roles</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAutofill('admin@fitzone.com', 'admin123')}
              className="bg-slate-950/80 border border-slate-800/60 hover:bg-slate-800 hover:text-white px-2.5 py-1.5 rounded-md text-[10px] text-slate-400 font-semibold transition"
            >
              Admin
            </button>
            <button
              onClick={() => handleAutofill('trainer@fitzone.com', 'trainer123')}
              className="bg-slate-950/80 border border-slate-800/60 hover:bg-slate-800 hover:text-white px-2.5 py-1.5 rounded-md text-[10px] text-slate-400 font-semibold transition"
            >
              Trainer
            </button>
            <button
              onClick={() => handleAutofill('member@fitzone.com', 'member123')}
              className="bg-slate-950/80 border border-slate-800/60 hover:bg-slate-800 hover:text-white px-2.5 py-1.5 rounded-md text-[10px] text-slate-400 font-semibold transition"
            >
              Member
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-red-500 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
