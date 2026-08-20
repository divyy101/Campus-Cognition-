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

  const [branch, setBranch] = useState(user?.branch || '');
  const [cgpa, setCgpa] = useState(user?.cgpa || '');
  const [skills, setSkills] = useState((user?.skills || []).join(', '));
  const [targetCompanies, setTargetCompanies] = useState((user?.targetCompanies || []).join(', '));

  React.useEffect(() => {
    if (user) {
      setBranch(user.branch || '');
      setCgpa(user.cgpa || '');
      setSkills((user.skills || []).join(', '));
      setTargetCompanies((user.targetCompanies || []).join(', '));
    }
  }, [user]);
  
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
    <div className="flex min-h-[100dvh] bg-[var(--bg)]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Navbar title="Personal Space" />

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-4xl mx-auto w-full space-y-10 pb-24">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full bg-[var(--accent-soft)] flex items-center justify-center border-4 border-[var(--surface)] shadow-md">
                <User className="w-10 h-10 text-[var(--accent)]" />
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--success)] border-2 border-[var(--surface)] flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="cc-h1 mb-1">
                {user?.name || 'Student Explorer'}
              </h1>
              <p className="cc-body text-[var(--text-secondary)]">
                {user?.email || 'email@example.com'}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-[var(--danger-soft)] border border-[var(--danger)]/30 text-[var(--danger)] text-sm flex items-center gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Profile Details Panel */}
            <div className="cc-card p-6 sm:p-8">
              
              <h2 className="cc-h3 mb-6 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[var(--accent)]" />
                Academic Profile
              </h2>

              {profileMsg && (
                <div className="mb-6 p-3 rounded-xl bg-[var(--success-soft)] border border-[var(--success)]/30 text-[var(--success)] text-xs flex items-center gap-2 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {profileMsg}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">Branch</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="cc-input w-full px-4 py-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="cc-input w-full px-4 py-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">Skills (comma separated)</label>
                  <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    rows="2"
                    className="cc-input w-full px-4 py-3 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">Target Companies</label>
                  <textarea
                    value={targetCompanies}
                    onChange={(e) => setTargetCompanies(e.target.value)}
                    rows="2"
                    className="cc-input w-full px-4 py-3 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="cc-btn w-full py-3 mt-4"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </form>
            </div>

            {/* Security Panel */}
            <div className="cc-card p-6 sm:p-8">
              
              <h2 className="cc-h3 mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[var(--text-secondary)]" />
                Security
              </h2>

              {pwdMsg && (
                <div className="mb-6 p-3 rounded-xl bg-[var(--success-soft)] border border-[var(--success)]/30 text-[var(--success)] text-xs flex items-center gap-2 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {pwdMsg}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="cc-input w-full px-4 py-2.5 tracking-widest font-mono"
                      required
                    />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="cc-input w-full px-4 py-2.5 tracking-widest font-mono"
                      required
                    />
                </div>

                <button
                  type="submit"
                  className="cc-btn-secondary w-full py-3 mt-4"
                >
                  Change Password
                </button>
              </form>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
