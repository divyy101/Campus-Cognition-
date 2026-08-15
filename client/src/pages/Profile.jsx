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
    <div className="flex min-h-screen bg-[#F8F9FE] dark:bg-[#090B14] font-sans text-slate-900 dark:text-[#E2E8F0] transition-colors duration-500 relative overflow-hidden">
      
      {/* Profile Aurora Motif */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #8b5cf6 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/10 dark:bg-pink-600/15 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar title="Personal Space" />

        <main className="flex-1 p-6 md:px-8 md:py-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group shrink-0 z-10">
                <div className="w-24 h-24 rounded-full bg-pink-50 dark:bg-[#111424] border-2 border-pink-200 dark:border-pink-900/50 flex items-center justify-center overflow-hidden transition-colors shadow-[0_0_20px_rgba(236,72,153,0.15)]">
                  <User className="w-10 h-10 text-pink-400 dark:text-pink-500" />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-500 border-2 border-white dark:border-[#090B14] flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {user?.name || 'Student Explorer'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-indigo-200/70 mt-1 flex items-center justify-center md:justify-start gap-2">
                  {user?.email || 'email@example.com'}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Profile Details Panel */}
              <div className="bg-white/90 dark:bg-[#111424]/90 rounded-[24px] p-6 sm:p-8 border border-indigo-50 dark:border-indigo-900/40 shadow-sm relative overflow-hidden backdrop-blur-xl z-10 hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-48 h-48 bg-pink-50 dark:bg-pink-900/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 relative z-10">
                  <GraduationCap className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                  Academic Profile
                </h2>

                {profileMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 shadow-sm relative z-10">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-5 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-indigo-200/70 mb-1.5">Branch</label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-[#F8F9FE] dark:bg-[#090B14] border border-indigo-50 dark:border-indigo-900/30 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-pink-400 dark:focus:border-pink-500 transition-colors shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-indigo-200/70 mb-1.5">CGPA</label>
                      <input
                        type="number"
                        step="0.1"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="w-full bg-[#F8F9FE] dark:bg-[#090B14] border border-indigo-50 dark:border-indigo-900/30 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-pink-400 dark:focus:border-pink-500 transition-colors shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-indigo-200/70 mb-1.5">Skills (comma separated)</label>
                    <textarea
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      rows="2"
                      className="w-full bg-[#F8F9FE] dark:bg-[#090B14] border border-indigo-50 dark:border-indigo-900/30 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-pink-400 dark:focus:border-pink-500 transition-colors resize-none shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-indigo-200/70 mb-1.5">Target Companies</label>
                    <textarea
                      value={targetCompanies}
                      onChange={(e) => setTargetCompanies(e.target.value)}
                      rows="2"
                      className="w-full bg-[#F8F9FE] dark:bg-[#090B14] border border-indigo-50 dark:border-indigo-900/30 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-pink-400 dark:focus:border-pink-500 transition-colors resize-none shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 mt-4 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Security Panel */}
              <div className="bg-white/90 dark:bg-[#111424]/90 rounded-[24px] p-6 sm:p-8 border border-indigo-50 dark:border-indigo-900/40 shadow-sm relative overflow-hidden backdrop-blur-xl z-10 hover:shadow-md transition-shadow">
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
                
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 relative z-10">
                  <Lock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  Security
                </h2>

                {pwdMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 shadow-sm relative z-10">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {pwdMsg}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-5 relative z-10">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-indigo-200/70 mb-1.5">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-[#F8F9FE] dark:bg-[#090B14] border border-indigo-50 dark:border-indigo-900/30 rounded-xl px-4 py-2.5 text-sm tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors font-mono shadow-inner"
                        required
                      />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-indigo-200/70 mb-1.5">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#F8F9FE] dark:bg-[#090B14] border border-indigo-50 dark:border-indigo-900/30 rounded-xl px-4 py-2.5 text-sm tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors font-mono shadow-inner"
                        required
                      />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold text-sm transition-colors mt-4"
                  >
                    Change Password
                  </button>
                </form>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
