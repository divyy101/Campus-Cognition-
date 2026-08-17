import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { Activity, Clock, Sparkles } from 'lucide-react';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.get('/activity');
        if (res.data.success) {
          setActivities(res.data.activities || []);
        }
      } catch (err) {
        console.error('Failed to fetch activity log:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

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
        <Navbar title="Student Insights" />

        <main className="flex-1 p-6 md:px-8 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6 semantic-card p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)]/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform group-hover:scale-110" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold tracking-widest uppercase mb-3 border border-[var(--accent)]/30 shadow-sm">
                  <Activity className="w-3 h-3" />
                  Analytics
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                  Activity Intelligence
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl font-medium">
                  Track your learning progress, saved opportunities, and platform engagement.
                </p>
              </div>
              
              <div className="flex items-center gap-2 relative z-10">
                <button className="semantic-btn px-5 py-2.5 text-xs font-bold">
                  Export Data
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="semantic-card p-6 flex flex-col justify-between hover:border-[var(--accent)] transition-colors">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3">Total Actions</span>
                <span className="text-3xl font-extrabold text-[var(--accent-secondary)]">{activities.length || '0'}</span>
              </div>
              <div className="semantic-card p-6 flex flex-col justify-between hover:border-[var(--accent)] transition-colors">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3">Saved Opportunities</span>
                <span className="text-3xl font-extrabold text-[var(--accent)]">
                  {activities.filter(a => a.type === 'SAVE' || a.type?.includes('SAVED')).length || '0'}
                </span>
              </div>
              <div className="semantic-card p-6 flex flex-col justify-between hover:border-[var(--accent)] transition-colors">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3">Study Sessions</span>
                <span className="text-3xl font-extrabold text-[var(--accent-secondary)]">
                  {activities.filter(a => a.type === 'STUDY').length || '0'}
                </span>
              </div>
              <div className="semantic-card p-6 flex flex-col justify-between hover:border-[var(--accent)] transition-colors">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3">Active Streak</span>
                <span className="text-3xl font-extrabold text-[var(--accent)] flex items-baseline gap-1">
                  12 <span className="text-sm font-semibold opacity-60">Days</span>
                </span>
              </div>
            </div>

            {/* Main Log Area */}
            <div className="semantic-card overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                  Recent Activity Trail
                </h2>
              </div>

              {loading ? (
                <div className="p-12 text-center flex flex-col items-center justify-center min-h-[200px]">
                  <div className="w-8 h-8 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin mb-4" />
                  <p className="text-xs text-[var(--text-secondary)] font-medium">Fetching analytics data...</p>
                </div>
              ) : activities.length > 0 ? (
                <div className="divide-y divide-[var(--border)]">
                  {activities.map((act, i) => (
                    <div 
                      key={i} 
                      className="p-5 hover:bg-[var(--surface-elevated)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start sm:items-center gap-5">
                        <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center font-black text-xs shrink-0 group-hover:border-[var(--accent)]/60 transition-colors shadow-sm">
                          {act.type ? act.type.substring(0, 2) : 'AC'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-black text-[var(--accent-secondary)] uppercase tracking-widest">{act.type}</span>
                            <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
                            <span className="text-[11px] font-medium text-[var(--text-secondary)] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(act.timestamp).toLocaleString(undefined, { 
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{act.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <h3 className="text-sm font-bold mb-1">No activity logged</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Your actions across the platform will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default ActivityLog;
