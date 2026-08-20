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
  Target,
  Zap,
  Activity as ActivityIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatusDot } from '../components/cinematic/CinematicComponents';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
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

  const stats = data?.stats || { studyStreak: 0, studyCount: 0, codeReviewCount: 0, appliedOpportunities: 0 };
  const nextAction = data?.nextBestAction;
  const activities = data?.activities || [];
  const recommendedOpps = data?.recommendedOpportunities || [];

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] bg-[var(--bg)]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-[100dvh]">
          <Navbar title="Dashboard" />
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)]">
            <div className="w-10 h-10 border-2 border-[var(--border-strong)] border-t-[var(--accent)] rounded-full animate-spin mb-4" />
            <p className="cc-caption tracking-widest uppercase">Loading Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[100dvh] bg-[var(--bg)]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-[100dvh]">
          <Navbar title="Dashboard" />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="cc-card max-w-md w-full p-10 text-center">
              <AlertCircle className="w-12 h-12 text-[var(--danger)] mx-auto mb-4 opacity-80" />
              <h2 className="cc-h3 mb-2">Unable to load your dashboard.</h2>
              <p className="cc-body text-[var(--text-secondary)] mb-6">
                The dashboard data could not be retrieved from the central core.
              </p>
              <button onClick={() => window.location.reload()} className="cc-btn w-full py-3">
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Navbar title="Dashboard" />

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl mx-auto w-full space-y-12 pb-24">
          
          {/* --- HERO SECTION --- */}
          <section className="flex flex-col-reverse lg:flex-row items-center gap-8 justify-between mt-4 bg-[var(--surface)] p-6 sm:p-8 lg:p-10 rounded-3xl border border-[var(--border)] shadow-sm dark:bg-[#050b14] dark:border-[var(--accent)]/20">
            <div className="max-w-xl flex-1">
              <span className="cc-eyebrow text-[var(--success)] flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                SYSTEM ONLINE
              </span>
              <h1 className="cc-display mb-4">
                Your academic intelligence, connected.
              </h1>
              <p className="cc-body text-[var(--text-secondary)] mb-8 text-lg">
                Campus Cognition is monitoring your study momentum, analyzing code repositories, and scanning the global network for career opportunities.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link to={nextAction?.target || '/study'} className="cc-btn w-full sm:w-auto px-6 py-3">
                  <BookOpen className="w-4 h-4" />
                  Upload Exam Syllabus
                </Link>
                <Link to="/internships" className="cc-btn-secondary w-full sm:w-auto px-6 py-3">
                  Explore Intelligence
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-[45%] xl:w-[40%] relative rounded-2xl overflow-hidden border border-[var(--border-strong)] shadow-md dark:shadow-[0_0_40px_-15px_var(--accent)] shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10 pointer-events-none" />
              <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] z-10 pointer-events-none" />
              <img 
                src="https://static.vecteezy.com/system/resources/thumbnails/009/435/573/small_2x/abstract-dark-sci-fi-tunnel-with-green-light-seamless-loop-4k-3d-animation-background-free-video.jpg" 
                alt="Neural Tunnel Intelligence Visualization" 
                className="w-full h-[220px] lg:h-[340px] object-cover"
              />
            </div>
          </section>

          {/* --- INTELLIGENCE OVERVIEW --- */}
          <section>
            <h2 className="cc-h3 mb-6">Intelligence Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="cc-card p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
                    <ActivityIcon className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Study Momentum</h3>
                    <StatusDot status="active" label="Tracking" className="mt-0.5" />
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tighter text-[var(--text-primary)]">{stats.studyStreak}</span>
                    <span className="cc-small uppercase tracking-wide">Day Streak</span>
                  </div>
                </div>
              </div>

              <div className="cc-card p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[var(--warning-soft)] flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-[var(--warning)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Code Intelligence</h3>
                    <StatusDot status="analyzing" label="Ready" className="mt-0.5" />
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tighter text-[var(--text-primary)]">{stats.codeReviewCount}</span>
                    <span className="cc-small uppercase tracking-wide">Files Analyzed</span>
                  </div>
                </div>
              </div>

              <div className="cc-card p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[var(--success-soft)] flex items-center justify-center">
                    <Target className="w-5 h-5 text-[var(--success)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Opportunity Radar</h3>
                    <StatusDot status="searching" label="Scanning" className="mt-0.5" />
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tighter text-[var(--text-primary)]">{stats.appliedOpportunities}</span>
                    <span className="cc-small uppercase tracking-wide">Active Paths</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* --- FEED & TIMELINE --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Timeline */}
            <section className="lg:col-span-5">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-[var(--text-muted)]" />
                <h2 className="cc-h3">System Log</h2>
              </div>
              
              <div className="cc-card p-6">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px before:h-full before:w-px before:bg-[var(--border)]">
                  {activities.slice(0, 5).map((act, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute left-0 w-2.5 h-2.5 rounded-full bg-[var(--surface)] border-2 border-[var(--accent)] mt-1.5" />
                      <p className="text-sm text-[var(--text-primary)]">{act.description}</p>
                      <p className="cc-metadata mt-1">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-sm text-[var(--text-muted)]">No recent activity found.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Featured Opportunities */}
            <section className="lg:col-span-7">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[var(--text-muted)]" />
                  <h2 className="cc-h3">Top Matches</h2>
                </div>
                <Link to="/internships" className="cc-btn-ghost text-sm">
                  Explore All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="flex flex-col gap-4">
                {recommendedOpps.slice(0, 3).map((opp, idx) => (
                  <div key={idx} className="cc-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="cc-eyebrow mb-1">{opp.company}</div>
                      <h4 className="text-base font-semibold text-[var(--text-primary)]">{opp.title}</h4>
                      <div className="cc-metadata mt-1.5">{opp.deadline}</div>
                    </div>
                    
                    <div className="flex items-center gap-5">
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-[var(--text-primary)]">{opp.matchScore}%</span>
                        <span className="cc-caption uppercase">Match</span>
                      </div>
                      <a href={opp.url} target="_blank" rel="noopener noreferrer" className="cc-btn-secondary p-2.5" aria-label="Open Opportunity">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
                {recommendedOpps.length === 0 && (
                  <div className="cc-card p-10 text-center flex flex-col items-center justify-center text-[var(--text-muted)]">
                    <Target className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm">Scanning global networks for matches...</p>
                  </div>
                )}
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
