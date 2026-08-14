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
    <div className="flex min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-indigo-900/20 text-slate-100 font-sans selection:bg-indigo-500/30">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Student Intelligence Dashboard" />

        <main className="flex-1 p-6 md:px-8 md:py-6 space-y-6 overflow-y-auto">
          {/* Header Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-[32px] glass-card p-8 sm:p-10 border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Inner Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[10px] font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                >
                  <Sparkles className="w-3 h-3" />
                  Campus Intelligence Hub
                </motion.div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Student</span>
                </h1>
                <p className="text-slate-400 text-sm mt-3 max-w-xl leading-relaxed">
                  Track your study momentum, review your code efficiency, and discover top MNC internships matching your exact skill profile.
                </p>
              </div>

              {/* Study Streak Badge */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 bg-black/20 p-5 rounded-3xl border border-white/5 backdrop-blur-md shadow-xl"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                  <Flame className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-white">{stats.studyStreak}</span>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Days</span>
                  </div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mt-1">Study Streak</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Syllabus Roadmaps', value: stats.studyCount, icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
              { label: 'Code Lab Reviews', value: stats.codeReviewCount, icon: Code2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { label: 'Opportunities Saved', value: stats.appliedOpportunities, icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { label: 'Target Match Score', value: '88%', icon: Target, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
            ].map((metric, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="glass-card p-5 rounded-[24px] border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-all cursor-default group"
              >
                <div className={`w-12 h-12 rounded-2xl ${metric.bg} ${metric.color} flex items-center justify-center border ${metric.border} group-hover:scale-110 transition-transform`}>
                  <metric.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-white tracking-tight">{metric.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{metric.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recommended Next Action Banner */}
          {nextAction && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-[24px] glass-card border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">AI Recommendation</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{nextAction.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{nextAction.description}</p>
                </div>
              </div>

              <Link
                to={nextAction.target || '/study'}
                className="px-6 py-3 rounded-2xl glass-button text-white font-bold text-xs flex items-center gap-2 shrink-0 relative z-10 group"
              >
                Take Action
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}

          {/* Main Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Internship & Career Pulse */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-[32px] p-6 sm:p-8 border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Live MNC Matches</h2>
                  </div>
                  <Link to="/internships" className="text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-full transition-colors">
                    Explore All
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {recommendedOpps.length > 0 ? (
                    recommendedOpps.map((opp, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/5 transition-all flex items-center justify-between gap-4 group">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-sm text-white">{opp.title}</h4>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">{opp.company}</span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">{opp.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Match: {opp.matchScore}%</span>
                            <span className="text-[10px] text-slate-500 font-medium">• {opp.deadline}</span>
                          </div>
                        </div>

                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shrink-0 border border-white/5"
                        >
                          <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 font-medium">Loading live MNC internship recommendations...</div>
                  )}
                </div>
              </div>

              {/* Code Lab Activity */}
              <div className="glass-card rounded-[32px] p-6 sm:p-8 border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Recent Code Reviews</h2>
                  </div>
                  <Link to="/code-lab" className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-full transition-colors">
                    Open Lab
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {codeHistory.length > 0 ? (
                    codeHistory.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-emerald-400 uppercase tracking-wider shadow-inner">
                            {item.language}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-200 line-clamp-1">{item.explanation || 'Code Review completed'}</p>
                            <p className="text-[10px] font-medium text-slate-500 mt-0.5">O({item.timeComplexity}) Time • O({item.spaceComplexity}) Space</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-1 rounded-lg shrink-0">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 font-medium">No code reviews yet. Submit code in Code Lab for instant AI review!</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Activity Timeline & Study Sessions */}
            <div className="space-y-6">
              <div className="glass-card rounded-[32px] p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight">Study Sessions</h2>
                </div>

                <div className="space-y-3">
                  {recentSessions.length > 0 ? (
                    recentSessions.map((session, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-black/20 border border-white/5 group hover:bg-white/5 transition-colors cursor-pointer">
                        <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">{session.title}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">Scope: {session.scope}</p>
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">{session.importantTopics?.length || 0} Topics</span>
                          <span className="text-[10px] text-slate-500 font-medium">{new Date(session.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500 font-medium">No active study sessions.</div>
                  )}
                </div>
              </div>

              {/* Activity Log */}
              <div className="glass-card rounded-[32px] p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight">Timeline</h2>
                </div>

                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {activities.map((act, idx) => (
                    <div key={idx} className="flex items-start gap-3 group">
                      <div className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-amber-400 mt-1.5 shrink-0 transition-colors shadow-[0_0_8px_rgba(251,191,36,0)] group-hover:shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                      <div>
                        <p className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors leading-relaxed">{act.description}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{new Date(act.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-center text-xs text-slate-500 font-medium py-4">No recent activity</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
