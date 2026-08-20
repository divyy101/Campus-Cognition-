import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { Activity, Clock, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/cinematic/CinematicComponents';

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
    <div className="flex min-h-[100dvh] bg-[var(--bg)]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Navbar title="Student Insights" />

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full space-y-8 pb-24">
          
          {/* Header Section */}
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 bg-[var(--surface)] p-6 sm:p-8 lg:p-10 rounded-3xl border border-[var(--border)] shadow-sm dark:bg-[#050b14] dark:border-[var(--accent)]/20">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-bold tracking-widest uppercase mb-4 border border-[var(--border)] shadow-sm">
                <Activity className="w-3.5 h-3.5" />
                Activity Intelligence
              </div>
              <h1 className="cc-display mb-4 text-3xl sm:text-4xl">
                Activity Intelligence
              </h1>
              <p className="cc-body text-[var(--text-secondary)] mb-8 text-lg max-w-xl">
                Everything Campus Cognition has learned and processed.
              </p>
              
              <button className="cc-btn-secondary px-6 py-3 text-sm font-semibold">
                Export Data
              </button>
            </div>
            
            <div className="w-full lg:w-[35%] xl:w-[30%] relative rounded-2xl overflow-hidden border border-[var(--border-strong)] shadow-md dark:shadow-[0_0_40px_-15px_var(--accent)] shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10 pointer-events-none" />
              <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] z-10 pointer-events-none" />
              <img 
                src="https://media.istockphoto.com/id/1904226409/video/3d-neon-sphere-made-of-flowing-digital-particles-on-black-background-abstract-concept-of.jpg?s=640x640&k=20&c=6sVg5UKRAuBSYdPWHN_7y1ZC-0ast-6_J1Zj64dnxmI=" 
                alt="Digital Particle Sphere" 
                className="w-full h-[180px] lg:h-[260px] object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="cc-card p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Total Actions</span>
              <span className="text-3xl font-bold text-[var(--text-primary)]">{activities.length || '0'}</span>
            </div>
            <div className="cc-card p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Saved Opportunities</span>
              <span className="text-3xl font-bold text-[var(--accent)]">
                {activities.filter(a => a.type === 'SAVE' || a.type?.includes('SAVED')).length || '0'}
              </span>
            </div>
            <div className="cc-card p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Study Sessions</span>
              <span className="text-3xl font-bold text-[var(--success)]">
                {activities.filter(a => a.type === 'STUDY').length || '0'}
              </span>
            </div>
            <div className="cc-card p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Active Streak</span>
              <span className="text-3xl font-bold text-[var(--warning)] flex items-baseline gap-1">
                12 <span className="text-sm font-semibold opacity-80">Days</span>
              </span>
            </div>
          </div>

          {/* Main Log Area */}
          <div className="cc-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-sunken)]">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                Recent Activity Trail
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-8 h-8 border-2 border-[var(--border-strong)] border-t-[var(--accent)] rounded-full animate-spin mb-4" />
                <p className="cc-caption text-[var(--text-secondary)]">Fetching analytics data...</p>
              </div>
            ) : activities.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {activities.map((act, i) => (
                  <div 
                    key={i} 
                    className="p-5 hover:bg-[var(--surface-sunken)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-5">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-[var(--border)]">
                        {act.type ? act.type.substring(0, 2) : 'AC'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">{act.type}</span>
                          <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
                          <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(act.timestamp).toLocaleString(undefined, { 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-primary)] font-medium">{act.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--surface-sunken)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-6 h-6 text-[var(--text-muted)]" />
                </div>
                <h3 className="cc-h3 mb-1 text-[var(--text-primary)]">No activity logged</h3>
                <p className="cc-caption">Your actions across the platform will appear here.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActivityLog;
