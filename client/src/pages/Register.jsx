import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Eye, EyeOff, Lock, User, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { score: 0, text: 'Empty', color: 'bg-slate-700' };
    if (p.length < 6) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (p.length < 10) return { score: 2, text: 'Medium', color: 'bg-amber-500' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[500px] glass-card rounded-[32px] p-8 sm:p-10 shadow-[0_0_80px_-20px_rgba(79,70,229,0.3)] relative z-10"
      >
        {/* Glowing top border accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, rotate: 10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 via-indigo-600 to-amber-500 p-0.5 mb-5 shadow-xl shadow-emerald-500/30"
          >
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">Join the premium AI intelligence platform</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 group-focus-within:text-emerald-400 transition-colors">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full glass-input rounded-2xl px-4 py-3 text-sm placeholder-slate-500"
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 group-focus-within:text-emerald-400 transition-colors">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full glass-input rounded-2xl px-4 py-3 text-sm placeholder-slate-500"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 group-focus-within:text-emerald-400 transition-colors">Username</label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-4 top-3.5 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe2026"
                className="w-full glass-input rounded-2xl pl-12 pr-4 py-3.5 text-sm placeholder-slate-500"
                required
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 group-focus-within:text-emerald-400 transition-colors">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-3.5 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@university.edu"
                className="w-full glass-input rounded-2xl pl-12 pr-4 py-3.5 text-sm placeholder-slate-500"
                required
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 group-focus-within:text-emerald-400 transition-colors">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-3.5 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full glass-input rounded-2xl pl-12 pr-12 py-3.5 text-sm placeholder-slate-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3 flex items-center gap-2 px-1">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full ${strength.score >= 1 ? strength.color : 'transparent'} flex-1 transition-all`} />
                  <div className={`h-full ${strength.score >= 2 ? strength.color : 'transparent'} flex-1 transition-all`} />
                  <div className={`h-full ${strength.score >= 3 ? strength.color : 'transparent'} flex-1 transition-all`} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{strength.text}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 py-4 px-4 rounded-2xl glass-button !bg-[linear-gradient(135deg,rgba(16,185,129,0.8)_0%,rgba(5,150,105,0.8)_100%)] hover:!bg-[linear-gradient(135deg,rgba(16,185,129,1)_0%,rgba(5,150,105,1)_100%)] !shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:!shadow-[0_6px_20px_rgba(16,185,129,0.4)] text-white font-bold text-sm flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Complete Registration
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-white hover:text-emerald-400 transition-colors ml-1">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
