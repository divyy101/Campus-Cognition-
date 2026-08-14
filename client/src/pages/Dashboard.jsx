import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  Flame, 
  BookOpen, 
  Code2, 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Target,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = data?.stats || { studyStreak: 7, studyCount: 4, codeReviewCount: 12, appliedOpportunities: 3 };
  const nextAction = data?.nextBestAction;
  const recentSessions = data?.recentSessions || [];
  const codeHistory = data?.recentCodeHistory || [];
  const recommendedOpps = data?.recommendedOpportunities || [];
  const activities = data?.activities || [];

  return (
    <div className="flex min-h-screen bg-[#F6F7FB] dark:bg-[#080B18] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Command Center" />

        <main className="flex-1 p-6 md:px-8 md:py-6 space-y-6 overflow-y-auto">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-[40px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Good morning, Student.
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
                Here's what needs your attention today. You have {stats.studyStreak} days of momentum.
              </p>
            </div>
            
            {/* Quick action / Next Action */}
            {nextAction && (
              <Link
                to={nextAction.target || '/study'}
                className="group flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl transition-all shadow-[0_8px_30px_rgba(79,70,229,0.2)]"
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Recommended Action</div>
                  <div className="text-sm font-bold mt-0.5">{nextAction.title}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}
          </div>

          {/* Top Row: Study Progress & Focus */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Study Progress Card */}
            <div className="bg-white dark:bg-[#11162A] rounded-[24px] p-6 sm:p-8 border border-slate-200 dark:border-indigo-900/30 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Study Progress</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-white/5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Current Streak</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.studyStreak}</span>
                    <span className="text-xs font-semibold text-slate-400">days</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-white/5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Sessions</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.studyCount}</span>
                  </div>
                </div>
              </div>

              {recentSessions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 relative z-10">
                  <div className="text-xs font-semibold text-slate-500 mb-3">Recent Topic</div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{recentSessions[0].title}</span>
                    <Link to="/study" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Continue</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Today's Focus (Code Lab) */}
            <div className="bg-white dark:bg-[#11162A] rounded-[24px] p-6 sm:p-8 border border-slate-200 dark:border-indigo-900/30 shadow-sm relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-50 dark:bg-cyan-900/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Code Lab Activity</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-white/5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Code Reviews</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{stats.codeReviewCount}</span>
                  </div>
                </div>
              </div>

              {codeHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 relative z-10">
                  <div className="text-xs font-semibold text-slate-500 mb-3">Latest Review</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 uppercase">
                        {codeHistory[0].language}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-sm truncate max-w-[150px]">
                        {codeHistory[0].explanation || 'Completed'}
                      </span>
                    </div>
                    <Link to="/code-lab" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">View Lab</Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Middle Row: Opportunities & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Opportunities (Takes up 2 columns) */}
            <div className="lg:col-span-2 bg-white dark:bg-[#11162A] rounded-[24px] p-6 sm:p-8 border border-slate-200 dark:border-indigo-900/30 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recommended Opportunities</h2>
                </div>
                <Link to="/internships" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  View all radar
                </Link>
              </div>

              <div className="space-y-4">
                {recommendedOpps.slice(0, 3).map((opp, idx) => (
                  <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-white/5 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{opp.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">{opp.company}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{opp.matchScore}% Match</span>
                        <span className="text-xs text-slate-500">• {opp.deadline}</span>
                      </div>
                    </div>
                    <a
                      href={opp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white dark:bg-[#11162A] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
                {recommendedOpps.length === 0 && (
                  <div className="p-8 text-center text-sm text-slate-500">Loading radar insights...</div>
                )}
              </div>
            </div>

            {/* Activity Log (Takes 1 column) */}
            <div className="bg-white dark:bg-[#11162A] rounded-[24px] p-6 sm:p-8 border border-slate-200 dark:border-indigo-900/30 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {activities.slice(0, 5).map((act, idx) => (
                  <div key={idx} className="relative pl-6 before:absolute before:left-[11px] before:top-6 before:bottom-[-24px] before:w-px before:bg-slate-200 dark:before:bg-white/10 last:before:hidden">
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-200 dark:border-white/10 flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{act.description}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="text-center text-sm text-slate-500 py-4">No recent activity</div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
