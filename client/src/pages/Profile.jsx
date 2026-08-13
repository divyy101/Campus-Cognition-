import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { 
  User, 
  Lock, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Target,
  Briefcase,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();

  const [branch, setBranch] = useState(user?.branch || 'CSE');
  const [cgpa, setCgpa] = useState(user?.cgpa || 8.0);
  const [skills, setSkills] = useState((user?.skills || []).join(', '));
  const [targetCompanies, setTargetCompanies] = useState((user?.targetCompanies || []).join(', '));
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setError('');

    try {
      const res = await api.put('/users/profile', {
        branch,
        cgpa: parseFloat(cgpa),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        targetCompanies: targetCompanies.split(',').map(c => c.trim()).filter(Boolean)
      });

      if (res.data.success) {
        setUser(res.data.user);
        setProfileMsg('Profile updated successfully!');
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setError('');

    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (res.data.success) {
        setPwdMsg('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPwdMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed.');
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent text-slate-100 font-sans selection:bg-rose-500/30">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="User Profile & Intelligence Settings" />

        <main className="flex-1 p-6 md:px-8 md:py-6 space-y-8 overflow-y-auto">
          {/* Header Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[32px] glass-card p-8 border border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none translate-y-1/3" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              {/* Large Avatar */}
              <div className="relative group shrink-0">
                <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-rose-500/20 to-amber-500/20 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-xl group-hover:border-rose-500/50 transition-colors">
                  <User className="w-16 h-16 text-rose-300 opacity-80" />
                </div>
                <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center backdrop-blur-md shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Premium Member
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  {user?.name || 'Student Explorer'}
                </h1>
                <p className="text-slate-400 mt-2 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {user?.email || 'email@example.com'}
                </p>
              </div>

              {/* Stats overview */}
              <div className="flex gap-4 w-full md:w-auto">
                <div className="flex-1 md:flex-none glass-card p-4 rounded-2xl border border-white/5 text-center min-w-[120px]">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Profile Match</p>
                  <p className="text-2xl font-black text-rose-400">94%</p>
                </div>
              </div>
            </div>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Academic & Skill Profile */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-[32px] p-8 border border-white/5 space-y-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />
              
              <h2 className="text-lg font-bold text-white flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <GraduationCap className="w-5 h-5" />
                </div>
                Academic & Skill Intelligence
              </h2>

              {profileMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 relative z-10"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {profileMsg}
                </motion.div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Academic Branch</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full glass-input rounded-2xl px-4 py-3.5 text-xs focus:ring-2 focus:ring-rose-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cumulative CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="w-full glass-input rounded-2xl px-4 py-3.5 text-xs focus:ring-2 focus:ring-rose-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-rose-400" />
                    Technical Skills (Comma separated)
                  </label>
                  <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Python, Java, React, Data Structures"
                    rows="2"
                    className="w-full glass-input rounded-2xl px-4 py-3.5 text-xs resize-none focus:ring-2 focus:ring-rose-500/20 transition-all custom-scrollbar leading-relaxed"
                  />
                  {/* Skill Chips Preview */}
                  {skills && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {skills.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10 uppercase tracking-wider">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-rose-400" />
                    Target MNC Companies
                  </label>
                  <textarea
                    value={targetCompanies}
                    onChange={(e) => setTargetCompanies(e.target.value)}
                    placeholder="NVIDIA, Google, Microsoft"
                    rows="2"
                    className="w-full glass-input rounded-2xl px-4 py-3.5 text-xs resize-none focus:ring-2 focus:ring-rose-500/20 transition-all custom-scrollbar leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all flex items-center justify-center gap-2 group"
                >
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Save AI Profile Profile
                </button>
              </form>
            </motion.div>

            {/* Change Password */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-[32px] p-8 border border-white/5 space-y-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
              
              <h2 className="text-lg font-bold text-white flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                Security & Authentication
              </h2>

              {pwdMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 relative z-10"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {pwdMsg}
                </motion.div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-2xl px-4 py-3.5 text-xs tracking-widest focus:ring-2 focus:ring-amber-500/20 transition-all font-mono placeholder:font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Secure Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-2xl px-4 py-3.5 text-xs tracking-widest focus:ring-2 focus:ring-amber-500/20 transition-all font-mono placeholder:font-sans"
                    required
                  />
                  {/* Password Strength Mock */}
                  <div className="flex gap-1.5 mt-3">
                    <div className={`h-1 flex-1 rounded-full ${newPassword.length > 0 ? 'bg-rose-500' : 'bg-white/10'}`} />
                    <div className={`h-1 flex-1 rounded-full ${newPassword.length > 5 ? 'bg-amber-500' : 'bg-white/10'}`} />
                    <div className={`h-1 flex-1 rounded-full ${newPassword.length > 8 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 group mt-8"
                >
                  <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Rotate Password
                </button>
              </form>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
