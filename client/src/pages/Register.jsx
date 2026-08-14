import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';

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
    if (!p) return { score: 0, text: 'Empty', color: 'bg-slate-200 dark:bg-slate-800' };
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
    <AuthLayout>
      
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm font-semibold flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">First Name</label>
            <div className="relative group">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full h-14 bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Name</label>
            <div className="relative group">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full h-14 bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Username</label>
          <div className="relative group">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe2026"
              className="w-full h-14 bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              required
            />
            <User className="w-5 h-5 text-slate-400 absolute right-4 top-4.5 group-focus-within:text-blue-500 transition-colors" style={{ top: '18px' }} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
          <div className="relative group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@university.edu"
              className="w-full h-14 bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              required
            />
            <Mail className="w-5 h-5 text-slate-400 absolute right-4 top-4.5 group-focus-within:text-blue-500 transition-colors" style={{ top: '18px' }} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
          <div className="relative group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full h-14 bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-12 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
              style={{ top: '18px' }}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-3 flex items-center gap-2 px-1">
              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                <div className={`h-full ${strength.score >= 1 ? strength.color : 'transparent'} flex-1 transition-all`} />
                <div className={`h-full ${strength.score >= 2 ? strength.color : 'transparent'} flex-1 transition-all`} />
                <div className={`h-full ${strength.score >= 3 ? strength.color : 'transparent'} flex-1 transition-all`} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{strength.text}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-sm shadow-[0_8px_30px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_40px_-12px_rgba(37,99,235,0.6)] transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 mt-6"
        >
          {loading ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.4s]" />
            </div>
          ) : 'Create Account'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          By signing up, you agree to our{' '}
          <Link to="/terms" className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>.
        </p>
      </div>

    </AuthLayout>
  );
};

export default Register;
