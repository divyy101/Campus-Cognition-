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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative overflow-hidden"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar title="Personal Space" />

        <main className="flex-1 p-6 md:px-8 md:py-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group shrink-0 z-10">
                <div className="w-24 h-24 rounded-full bg-[var(--accent)]/10 border-2 border-[var(--accent)]/30 flex items-center justify-center overflow-hidden transition-colors shadow-[0_0_20px_var(--glow)]">
                  <User className="w-10 h-10 text-[var(--accent)]" />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--accent-secondary)] border-2 border-[var(--surface)] flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {user?.name || 'Student Explorer'}
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center justify-center md:justify-start gap-2">
                  {user?.email || 'email@example.com'}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] text-sm flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Profile Details Panel */}
              <div className="semantic-card p-6 sm:p-8 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)]/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform group-hover:scale-110" />
                
                <h2 className="text-base font-bold mb-6 flex items-center gap-2 relative z-10">
                  <GraduationCap className="w-5 h-5 text-[var(--accent)]" />
                  Academic Profile
                </h2>

                {profileMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] text-xs flex items-center gap-2 shadow-sm relative z-10">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-5 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Branch</label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="semantic-input w-full px-4 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">CGPA</label>
                      <input
                        type="number"
                        step="0.1"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="semantic-input w-full px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Skills (comma separated)</label>
                    <textarea
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      rows="2"
                      className="semantic-input w-full px-4 py-3 text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Target Companies</label>
                    <textarea
                      value={targetCompanies}
                      onChange={(e) => setTargetCompanies(e.target.value)}
                      rows="2"
                      className="semantic-input w-full px-4 py-3 text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="semantic-btn w-full py-3 flex items-center justify-center gap-2 mt-4"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Security Panel */}
              <div className="semantic-card p-6 sm:p-8 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--accent-secondary)]/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/3 pointer-events-none transition-transform group-hover:scale-110" />
                
                <h2 className="text-base font-bold mb-6 flex items-center gap-2 relative z-10">
                  <Lock className="w-5 h-5 text-[var(--accent-secondary)]" />
                  Security
                </h2>

                {pwdMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] text-xs flex items-center gap-2 shadow-sm relative z-10">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {pwdMsg}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-5 relative z-10">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="semantic-input w-full px-4 py-2.5 text-sm tracking-widest font-mono"
                        required
                      />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="semantic-input w-full px-4 py-2.5 text-sm tracking-widest font-mono"
                        required
                      />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl border-2 border-[var(--accent-secondary)]/50 hover:bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] font-bold text-sm transition-colors mt-4"
                  >
                    Change Password
                  </button>
                </form>
              </div>

            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default Profile;
