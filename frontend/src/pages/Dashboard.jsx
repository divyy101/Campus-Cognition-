import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  BookOpen, 
  Code2, 
  ArrowRight, 
  Clock, 
  ExternalLink,
  Target
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative z-10"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar title="Command Center" />

        <main className="flex-1 p-6 md:px-8 md:py-6 space-y-6 overflow-y-auto">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-[40px] font-extrabold tracking-tight leading-tight">
                Good morning, Student.
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl font-medium">
                Here's what needs your attention today. You have {stats.studyStreak} days of momentum.
              </p>
            </div>
            
            {/* Quick action / Next Action */}
            {nextAction && (
              <Link
                to={nextAction.target || '/study'}
                className="group flex items-center gap-4 bg-[var(--accent)] hover:brightness-110 text-white px-6 py-4 rounded-[20px] transition-all shadow-glow hover:-translate-y-0.5"
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">Recommended Action</div>
                  <div className="text-sm font-bold mt-0.5">{nextAction.title}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors backdrop-blur-md">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}
          </div>

          {/* Top Row: Study Progress & Focus */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Study Progress Card */}
            <div className="semantic-card p-6 sm:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)]/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform group-hover:scale-110" />
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold">Study Progress</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="p-4 rounded-[16px] bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Current Streak</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[var(--accent)]">{stats.studyStreak}</span>
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">days</span>
                  </div>
                </div>
                <div className="p-4 rounded-[16px] bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Total Sessions</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[var(--text-primary)]">{stats.studyCount}</span>
                  </div>
                </div>
              </div>

              {recentSessions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[var(--border)] relative z-10">
                  <div className="text-xs font-semibold text-[var(--text-secondary)] mb-3">Recent Topic</div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[var(--text-primary)]">{recentSessions[0].title}</span>
                    <Link to="/study" className="text-xs font-bold text-[var(--accent)] hover:underline">Continue</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Today's Focus (Code Lab) */}
            <div className="semantic-card p-6 sm:p-8 relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--accent-secondary)]/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/3 pointer-events-none transition-transform group-hover:scale-110" />
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)] flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold">Code Lab Activity</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="p-4 rounded-[16px] bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Code Reviews</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[var(--accent-secondary)]">{stats.codeReviewCount}</span>
                  </div>
                </div>
              </div>

              {codeHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[var(--border)] relative z-10">
                  <div className="text-xs font-semibold text-[var(--text-secondary)] mb-3">Latest Review</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)] uppercase">
                        {codeHistory[0].language}
                      </span>
                      <span className="font-medium text-[var(--text-primary)] text-sm truncate max-w-[150px]">
                        {codeHistory[0].explanation || 'Completed'}
                      </span>
                    </div>
                    <Link to="/code-lab" className="text-xs font-bold text-[var(--accent-secondary)] hover:underline">View Lab</Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Middle Row: Opportunities & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Opportunities (Takes up 2 columns) */}
            <div className="lg:col-span-2 semantic-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold">Recommended Opportunities</h2>
                </div>
                <Link to="/internships" className="text-sm font-semibold text-[var(--accent)] hover:underline">
                  View all radar
                </Link>
              </div>

              <div className="space-y-4">
                {recommendedOpps.slice(0, 3).map((opp, idx) => (
                  <div key={idx} className="group flex items-center justify-between p-4 rounded-[16px] bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold group-hover:text-[var(--accent)] transition-colors">{opp.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border)]">{opp.company}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-medium text-[var(--accent)]">{opp.matchScore}% Match</span>
                        <span className="text-xs text-[var(--text-secondary)]">• {opp.deadline}</span>
                      </div>
                    </div>
                    <a
                      href={opp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
                {recommendedOpps.length === 0 && (
                  <div className="p-8 text-center text-sm text-[var(--text-secondary)]">Loading radar insights...</div>
                )}
              </div>
            </div>

            {/* Activity Log (Takes 1 column) */}
            <div className="semantic-card p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold">Recent Activity</h2>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {activities.slice(0, 5).map((act, idx) => (
                  <div key={idx} className="relative pl-6 before:absolute before:left-[11px] before:top-6 before:bottom-[-24px] before:w-px before:bg-[var(--border-strong)] last:before:hidden">
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[var(--surface)] border-2 border-[var(--border-strong)] flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-secondary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{act.description}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="text-center text-sm text-[var(--text-secondary)] py-4">No recent activity</div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default Dashboard;
