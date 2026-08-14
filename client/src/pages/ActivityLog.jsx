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
    <div className="flex min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Student Insights" />

        <main className="flex-1 p-6 md:px-8 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-3 border border-blue-200 dark:border-blue-800/50">
                  <Activity className="w-3 h-3" />
                  Analytics
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Activity Intelligence
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  Track your learning progress, saved opportunities, and platform engagement.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs shadow-sm">
                  Export Data
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-[#18181B] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Actions</span>
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-500">{activities.length || '0'}</span>
              </div>
              <div className="bg-white dark:bg-[#18181B] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Saved Opportunities</span>
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {activities.filter(a => a.type === 'SAVE' || a.type?.includes('SAVED')).length || '0'}
                </span>
              </div>
              <div className="bg-white dark:bg-[#18181B] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Study Sessions</span>
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {activities.filter(a => a.type === 'STUDY').length || '0'}
                </span>
              </div>
              <div className="bg-white dark:bg-[#18181B] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Active Streak</span>
                <span className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 flex items-baseline gap-1">
                  12 <span className="text-sm font-semibold text-slate-400">Days</span>
                </span>
              </div>
            </div>

            {/* Main Log Area */}
            <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#18181B]">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                  Recent Activity Trail
                </h2>
              </div>

              {loading ? (
                <div className="p-12 text-center flex flex-col items-center justify-center min-h-[200px]">
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                  <p className="text-xs text-slate-500 font-medium">Fetching analytics data...</p>
                </div>
              ) : activities.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {activities.map((act, i) => (
                    <div 
                      key={i} 
                      className="p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#09090B] border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-colors">
                          {act.type ? act.type.substring(0, 2) : 'AC'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{act.type}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(act.timestamp).toLocaleString(undefined, { 
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-800 dark:text-slate-200">{act.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-[#09090B] border border-slate-100 dark:border-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No activity logged</h3>
                  <p className="text-xs text-slate-500">Your actions across the platform will appear here.</p>
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
