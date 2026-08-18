import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  BookOpen, 
  Code2, 
  ArrowRight, 
  Clock, 
  ExternalLink,
  Target,
  Sparkles,
  Activity as ActivityIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const textVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { scrollY } = useScroll();
  
  const opacity1 = useTransform(scrollY, [0, 200], [1, 0]);
  
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
  const activities = data?.activities || [];
  const recommendedOpps = data?.recommendedOpportunities || [];
  const codeHistory = data?.recentCodeHistory || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative z-10"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Navbar title="" />

        <main className="flex-1 flex flex-col pb-12">
          
          {/* --- EDITORIAL HEADER SECTION --- */}
          <motion.div 
            style={{ opacity: opacity1 }}
            className="w-full px-6 md:px-12 pt-16 pb-12 max-w-[1600px] mx-auto"
          >
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-4xl relative z-20">
              <motion.div variants={textVariant} className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <span className="text-xs font-bold tracking-[0.1em] text-[var(--text-secondary)] uppercase">Campus Cognition</span>
              </motion.div>
              
              <motion.h1 variants={textVariant} className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-4">
                Your academic intelligence,<br />
                working around you.
              </motion.h1>
              
              <motion.div variants={textVariant} className="flex items-center gap-3 mt-6">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm text-[var(--text-secondary)] font-mono uppercase tracking-widest">
                  System Online • {stats.studyStreak} Days Momentum
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* --- DASHBOARD CORE --- */}
          <div id="dashboard-core" className="px-6 md:px-12 relative z-20 space-y-8 max-w-[1600px] mx-auto w-full border-t border-[var(--border-subtle)] pt-8">
            
            {/* Priority Action */}
            {nextAction && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full"
              >
                <Link
                  to={nextAction.target || '/study'}
                  className="group flex items-center justify-between bg-[var(--surface-elevated)] border border-[var(--border-strong)] hover:border-[var(--text-primary)] px-8 py-6 rounded-[20px] transition-colors"
                >
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Priority Action</div>
                    <div className="text-xl font-bold">{nextAction.title}</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-[var(--text-secondary)] group-hover:translate-x-2 group-hover:text-[var(--text-primary)] transition-all" />
                </Link>
              </motion.div>
            )}

            {/* Top Row: Agents Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Study Agent Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[var(--surface)] border border-[var(--border-subtle)] p-8 rounded-2xl group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-4">
                    <BookOpen className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                    <div>
                      <h3 className="text-lg font-bold">Study Agent</h3>
                      <p className="text-xs text-[var(--text-secondary)] font-mono uppercase">Academic Hub</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[var(--text-secondary)]">Active</div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Momentum</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tighter">{stats.studyStreak}</span>
                      <span className="text-sm font-medium text-[var(--text-secondary)]">days</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Sessions</div>
                    <span className="text-5xl font-black tracking-tighter text-[var(--text-secondary)]">{stats.studyCount}</span>
                  </div>
                </div>
              </motion.div>

              {/* Code Agent Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-[var(--surface)] border border-[var(--border-subtle)] p-8 rounded-2xl group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-4">
                    <Code2 className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                    <div>
                      <h3 className="text-lg font-bold">Code Lab</h3>
                      <p className="text-xs text-[var(--text-secondary)] font-mono uppercase">Technical Hub</p>
                    </div>
                  </div>
                  <Link to="/code-lab" className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase">Open</Link>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Analyzed Files</div>
                    <span className="text-5xl font-black tracking-tighter">{stats.codeReviewCount}</span>
                  </div>
                  {codeHistory.length > 0 && (
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Recent Env</div>
                      <span className="text-lg font-mono font-bold text-[var(--text-secondary)]">
                        {codeHistory[0].language}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Middle Row: Opportunities & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Opportunities List */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border-subtle)] p-8 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-4">
                    <Target className="w-6 h-6 text-[var(--text-secondary)]" />
                    <div>
                      <h2 className="text-lg font-bold">Opportunity Matches</h2>
                    </div>
                  </div>
                  <Link to="/internships" className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase tracking-wider">
                    View All
                  </Link>
                </div>

                <div className="space-y-2">
                  {recommendedOpps.slice(0, 3).map((opp, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors border border-transparent hover:border-[var(--border-strong)]">
                      <div className="mb-3 sm:mb-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-sm">{opp.title}</h4>
                          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{opp.company}</span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] font-mono">{opp.deadline}</div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="text-xs font-bold">{opp.matchScore}% Match</div>
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
                        >
                          Details <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {recommendedOpps.length === 0 && (
                    <div className="py-12 text-center text-sm text-[var(--text-secondary)] font-mono">
                      Scanning global networks...
                    </div>
                  )}
                </div>
              </motion.div>

              {/* System Log */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-[var(--surface)] border border-[var(--border-subtle)] p-8 rounded-2xl flex flex-col"
              >
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--border-subtle)]">
                  <Clock className="w-6 h-6 text-[var(--text-secondary)]" />
                  <div>
                    <h2 className="text-lg font-bold">Activity Log</h2>
                  </div>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar relative">
                  {activities.slice(0, 5).map((act, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-medium leading-snug text-[var(--text-primary)]">{act.description}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-1 font-mono">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-center text-xs text-[var(--text-secondary)] py-8 font-mono">
                      No recent activity
                    </div>
                  )}
                </div>
              </motion.div>

            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default Dashboard;
