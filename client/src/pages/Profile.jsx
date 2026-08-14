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
    <div className="flex min-h-screen bg-[#FFFFFF] dark:bg-[#020617] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Personal Space" />

        <main className="flex-1 p-6 md:px-8 md:py-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-colors">
                  <User className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white dark:border-[#020617] flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {user?.name || 'Student Explorer'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center md:justify-start gap-2">
                  {user?.email || 'email@example.com'}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Profile Details Panel */}
              <div className="bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  Academic Profile
                </h2>

                {profileMsg && (
                  <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Branch</label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">CGPA</label>
                      <input
                        type="number"
                        step="0.1"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Skills (comma separated)</label>
                    <textarea
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      rows="2"
                      className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Target Companies</label>
                    <textarea
                      value={targetCompanies}
                      onChange={(e) => setTargetCompanies(e.target.value)}
                      rows="2"
                      className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2 mt-4"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Security Panel */}
              <div className="bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  Security
                </h2>

                {pwdMsg && (
                  <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {pwdMsg}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#020617] text-slate-900 dark:text-slate-100 font-semibold text-sm transition-colors mt-4"
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
