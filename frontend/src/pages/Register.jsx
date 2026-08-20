import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Mail } from 'lucide-react';
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
    if (!p) return { score: 0, text: 'Empty', color: 'bg-[var(--border-strong)]' };
    if (p.length < 6) return { score: 1, text: 'Weak', color: 'bg-[var(--danger)]' };
    if (p.length < 10) return { score: 2, text: 'Medium', color: 'bg-[var(--warning)]' };
    return { score: 3, text: 'Strong', color: 'bg-[var(--success)]' };
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
        <div className="mb-6 p-4 rounded-xl bg-[var(--danger-soft)] border border-[var(--danger)]/30 text-[var(--danger)] text-sm font-semibold flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">First Name</label>
            <div className="relative group">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="cc-input w-full h-12 px-4"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Last Name</label>
            <div className="relative group">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="cc-input w-full h-12 px-4"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Username</label>
          <div className="relative group">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe2026"
              className="cc-input w-full h-12 pl-4 pr-10"
              required
            />
            <User className="w-5 h-5 text-[var(--text-muted)] absolute right-4 top-1/2 -translate-y-1/2 group-focus-within:text-[var(--accent)] transition-colors" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Email Address</label>
          <div className="relative group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@university.edu"
              className="cc-input w-full h-12 pl-4 pr-10"
              required
            />
            <Mail className="w-5 h-5 text-[var(--text-muted)] absolute right-4 top-1/2 -translate-y-1/2 group-focus-within:text-[var(--accent)] transition-colors" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Password</label>
          <div className="relative group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="cc-input w-full h-12 pl-4 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2 flex items-center gap-2 px-1">
              <div className="flex-1 h-1 bg-[var(--surface-sunken)] rounded-full overflow-hidden flex gap-1">
                <div className={`h-full ${strength.score >= 1 ? strength.color : 'transparent'} flex-1 transition-colors`} />
                <div className={`h-full ${strength.score >= 2 ? strength.color : 'transparent'} flex-1 transition-colors`} />
                <div className={`h-full ${strength.score >= 3 ? strength.color : 'transparent'} flex-1 transition-colors`} />
              </div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{strength.text}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="cc-btn w-full h-12 flex justify-center items-center gap-2 mt-6"
        >
          {loading ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.4s]" />
            </div>
          ) : 'Initialize Account'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-[var(--text-secondary)] font-semibold">
          By signing up, you agree to our{' '}
          <Link to="/terms" className="text-[var(--text-primary)] hover:underline transition-colors">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-[var(--text-primary)] hover:underline transition-colors">Privacy Policy</Link>.
        </p>
      </div>

    </AuthLayout>
  );
};

export default Register;
