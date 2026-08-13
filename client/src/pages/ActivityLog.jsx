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
    <div className="flex min-h-screen bg-transparent text-slate-100 font-sans selection:bg-teal-500/30">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Activity History & Audit Log" />

        <main className="flex-1 p-6 md:px-8 md:py-6 space-y-8 overflow-y-auto relative">
          {/* Header Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[32px] glass-card p-8 border border-white/5 shadow-2xl relative overflow-hidden mb-8"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none translate-y-1/3" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Live Timeline
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Activity Intelligence Log
              </h1>
              <p className="text-slate-400 mt-2 text-sm font-medium">
                Track your AI interactions, saved opportunities, and platform engagement.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-[32px] p-8 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none" />
            
            <h2 className="text-lg font-bold text-white mb-8 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <Activity className="w-5 h-5" />
              </div>
              User Actions & AI Interaction Timeline
            </h2>

            {loading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center min-h-[200px] relative z-10">
                <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mb-4" />
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading audit trail...</p>
              </div>
            ) : activities.length > 0 ? (
              <div className="relative z-10">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-teal-500/50 via-cyan-500/20 to-transparent hidden sm:block" />
                
                <div className="space-y-6">
                  {activities.map((act, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative flex items-start gap-6 group"
                    >
                      {/* Timeline Dot */}
                      <div className="hidden sm:flex mt-1.5 w-14 justify-end relative z-10 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-teal-500 border-[3px] border-[#090D16] shadow-[0_0_10px_rgba(20,184,166,0.5)] group-hover:scale-150 transition-transform" />
                      </div>
                      
                      {/* Activity Card */}
                      <div className="flex-1 p-5 rounded-[24px] glass-card border border-white/5 hover:bg-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-black text-sm shrink-0 shadow-inner group-hover:bg-teal-500/20 transition-colors">
                            {act.type ? act.type.charAt(0) : 'A'}
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{act.type}</span>
                            <p className="text-sm text-slate-200 mt-1 font-medium leading-relaxed">{act.description}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg bg-black/20 self-start sm:self-auto">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(act.timestamp).toLocaleString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest relative z-10">
                No activity logged yet.
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ActivityLog;
