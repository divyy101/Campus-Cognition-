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
    <div className="flex min-h-screen bg-cyan-50/40 dark:bg-[#071118] font-sans text-slate-900 dark:text-cyan-50 transition-colors duration-500 relative overflow-hidden">
      
      {/* Abstract Grid Motif */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-400/10 dark:bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar title="Student Insights" />

        <main className="flex-1 p-6 md:px-8 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6 bg-white/80 dark:bg-[#0C1721]/80 p-6 rounded-[20px] border border-cyan-100 dark:border-cyan-900/40 shadow-sm backdrop-blur-xl">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold tracking-widest uppercase mb-3 border border-cyan-200 dark:border-cyan-800/50 shadow-sm">
                  <Activity className="w-3 h-3" />
                  Analytics
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cyan-50 leading-tight">
                  Activity Intelligence
                </h1>
                <p className="text-sm text-cyan-900/70 dark:text-cyan-200/60 mt-1 max-w-xl font-medium">
                  Track your learning progress, saved opportunities, and platform engagement.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition-colors">
                  Export Data
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/90 dark:bg-[#0C1721]/90 p-6 rounded-[16px] border border-cyan-100 dark:border-cyan-900/40 shadow-sm flex flex-col justify-between backdrop-blur-xl hover:shadow-md transition-shadow">
                <span className="text-[10px] font-bold text-slate-500 dark:text-cyan-300/60 uppercase tracking-widest mb-3">Total Actions</span>
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{activities.length || '0'}</span>
              </div>
              <div className="bg-white/90 dark:bg-[#0C1721]/90 p-6 rounded-[16px] border border-cyan-100 dark:border-cyan-900/40 shadow-sm flex flex-col justify-between backdrop-blur-xl hover:shadow-md transition-shadow">
                <span className="text-[10px] font-bold text-slate-500 dark:text-cyan-300/60 uppercase tracking-widest mb-3">Saved Opportunities</span>
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {activities.filter(a => a.type === 'SAVE' || a.type?.includes('SAVED')).length || '0'}
                </span>
              </div>
              <div className="bg-white/90 dark:bg-[#0C1721]/90 p-6 rounded-[16px] border border-cyan-100 dark:border-cyan-900/40 shadow-sm flex flex-col justify-between backdrop-blur-xl hover:shadow-md transition-shadow">
                <span className="text-[10px] font-bold text-slate-500 dark:text-cyan-300/60 uppercase tracking-widest mb-3">Study Sessions</span>
                <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                  {activities.filter(a => a.type === 'STUDY').length || '0'}
                </span>
              </div>
              <div className="bg-white/90 dark:bg-[#0C1721]/90 p-6 rounded-[16px] border border-cyan-100 dark:border-cyan-900/40 shadow-sm flex flex-col justify-between backdrop-blur-xl hover:shadow-md transition-shadow">
                <span className="text-[10px] font-bold text-slate-500 dark:text-cyan-300/60 uppercase tracking-widest mb-3">Active Streak</span>
                <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 flex items-baseline gap-1">
                  12 <span className="text-sm font-semibold text-cyan-700/60 dark:text-cyan-400/60">Days</span>
                </span>
              </div>
            </div>

            {/* Main Log Area */}
            <div className="bg-white/90 dark:bg-[#0C1721]/90 rounded-[20px] border border-cyan-100 dark:border-cyan-900/40 shadow-sm overflow-hidden backdrop-blur-xl">
              <div className="px-6 py-5 border-b border-cyan-100 dark:border-cyan-900/40 bg-cyan-50/50 dark:bg-[#0C1721]">
                <h2 className="text-sm font-bold text-slate-900 dark:text-cyan-50 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Recent Activity Trail
                </h2>
              </div>

              {loading ? (
                <div className="p-12 text-center flex flex-col items-center justify-center min-h-[200px]">
                  <div className="w-8 h-8 border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mb-4" />
                  <p className="text-xs text-slate-500 dark:text-cyan-200/60 font-medium">Fetching analytics data...</p>
                </div>
              ) : activities.length > 0 ? (
                <div className="divide-y divide-cyan-50 dark:divide-cyan-900/30">
                  {activities.map((act, i) => (
                    <div 
                      key={i} 
                      className="p-5 hover:bg-cyan-50/50 dark:hover:bg-[#11202D] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start sm:items-center gap-5">
                        <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-[#071118] border border-cyan-200 dark:border-cyan-800/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black text-xs shrink-0 group-hover:border-cyan-400 dark:group-hover:border-cyan-500 transition-colors shadow-sm">
                          {act.type ? act.type.substring(0, 2) : 'AC'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{act.type}</span>
                            <span className="w-1 h-1 rounded-full bg-cyan-300 dark:bg-cyan-700" />
                            <span className="text-[11px] font-medium text-slate-500 dark:text-cyan-200/60 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(act.timestamp).toLocaleString(undefined, { 
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800 dark:text-cyan-50">{act.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-[#071118] border border-cyan-100 dark:border-cyan-800/60 flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-cyan-400 dark:text-cyan-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-cyan-50 mb-1">No activity logged</h3>
                  <p className="text-xs text-slate-500 dark:text-cyan-200/60">Your actions across the platform will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActivityLog;
