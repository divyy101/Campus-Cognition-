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
  Sparkles,
  Zap,
  Activity as ActivityIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CinematicReveal, 
  FloatingVisual, 
  ScrollSection, 
  AgentStatusIndicator 
} from '../components/cinematic/CinematicComponents';

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

  const stats = data?.stats || { studyStreak: 7, studyCount: 4, codeReviewCount: 12, appliedOpportunities: 3 };
  const nextAction = data?.nextBestAction;
  const activities = data?.activities || [];
  const recommendedOpps = data?.recommendedOpportunities || [];
  const codeHistory = data?.recentCodeHistory || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.8 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative z-10"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Navbar title="" />

        <main className="flex-1 flex flex-col pb-24 relative">
          
          {/* --- CINEMATIC HERO SECTION --- */}
          <ScrollSection className="w-full relative min-h-[70vh] flex flex-col justify-center px-6 md:px-12 pt-16 pb-12 max-w-[1800px] mx-auto border-b border-[var(--border-subtle)]">
            
            {/* Visual Anchor (40-60% of viewport right side on desktop) */}
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-[55%] opacity-20 md:opacity-100 z-[-1] pointer-events-none mask-image-left">
              <FloatingVisual 
                src="/visuals/hero-visual.jpg" 
                alt="Neural Network Intelligence"
                speed="slow"
                className="w-full h-full object-cover object-left"
              />
            </div>
            
            <div className="relative z-20 max-w-3xl">
              <CinematicReveal delay={0.2} direction="up" className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] flex items-center justify-center shadow-glow">
                  <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <span className="text-xs font-bold tracking-[0.2em] text-[var(--accent)] uppercase font-['Outfit']">System Online</span>
              </CinematicReveal>
              
              <CinematicReveal delay={0.4} direction="up">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 font-['Outfit']">
                  Your academic <br className="hidden md:block"/>
                  <span className="text-glow bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">
                    intelligence.
                  </span>
                </h1>
              </CinematicReveal>

              <CinematicReveal delay={0.6} direction="up">
                <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-xl font-light mb-10 leading-relaxed">
                  Campus Cognition is monitoring your study momentum, analyzing code repositories, and scanning the global network for career opportunities.
                </p>
              </CinematicReveal>
              
              <CinematicReveal delay={0.8} direction="up" className="flex flex-col sm:flex-row items-center gap-4">
                {nextAction ? (
                  <Link
                    to={nextAction.target || '/study'}
                    className="semantic-btn px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-3 shadow-glow group"
                  >
                    <Zap className="w-5 h-5 text-[var(--bg-main)] group-hover:scale-110 transition-transform" />
                    <span>{nextAction.title}</span>
                  </Link>
                ) : (
                  <Link to="/study" className="semantic-btn px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-3 shadow-glow group">
                    <BookOpen className="w-5 h-5 text-[var(--bg-main)]" />
                    <span>Initialize Study Session</span>
                  </Link>
                )}
              </CinematicReveal>
            </div>
          </ScrollSection>

          {/* --- DASHBOARD CORE (AI COMMAND CENTER) --- */}
          <div className="px-6 md:px-12 relative z-20 space-y-12 max-w-[1800px] mx-auto w-full pt-16">
            
            {/* Momentum & Agents Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Massive Momentum Metric */}
              <CinematicReveal delay={0.1} className="lg:col-span-5 semantic-card p-10 flex flex-col justify-between min-h-[300px]">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4 text-[var(--accent)]" /> 
                    Momentum Engine
                  </div>
                </div>
                
                <div className="my-8">
                  <div className="flex items-baseline gap-3">
                    <span className="text-8xl md:text-9xl font-black tracking-tighter text-[var(--accent)] drop-shadow-lg font-['Outfit']">{stats.studyStreak}</span>
                    <span className="text-2xl font-bold text-[var(--text-secondary)] uppercase tracking-widest">Day<br/>Streak</span>
                  </div>
                </div>
                
                <p className="text-sm text-[var(--text-secondary)] font-medium max-w-sm">
                  Your cognitive momentum is building. Neural networks optimized for maximum retention.
                </p>
              </CinematicReveal>

              {/* Agent Status Panel */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Code Agent Status */}
                <CinematicReveal delay={0.2} className="semantic-card p-8 group flex flex-col justify-between min-h-[300px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--cinematic-cyan)]/10 blur-[50px] -translate-y-1/2 translate-x-1/3" />
                  <div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-strong)]">
                          <Code2 className="w-5 h-5 text-[var(--cinematic-cyan)]" />
                        </div>
                        <h3 className="text-base font-bold font-['Outfit'] tracking-wide">Code Lab</h3>
                      </div>
                      <AgentStatusIndicator status="analyzing" type="code" />
                    </div>
                    
                    <div className="space-y-1 relative z-10">
                      <div className="text-5xl font-black tracking-tighter text-[var(--text-primary)] font-['Outfit']">{stats.codeReviewCount}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Files Analyzed</div>
                    </div>
                  </div>
                  
                  <Link to="/code-lab" className="mt-8 flex items-center justify-between group-hover:text-[var(--cinematic-cyan)] transition-colors relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest">Open Terminal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CinematicReveal>

                {/* Opportunity Agent Status */}
                <CinematicReveal delay={0.3} className="semantic-card p-8 group flex flex-col justify-between min-h-[300px] relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-[var(--cinematic-coral)]/10 blur-[50px] translate-y-1/3 translate-x-1/3" />
                  <div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-strong)]">
                          <Target className="w-5 h-5 text-[var(--cinematic-coral)]" />
                        </div>
                        <h3 className="text-base font-bold font-['Outfit'] tracking-wide">Career Net</h3>
                      </div>
                      <AgentStatusIndicator status="searching" type="opportunity" />
                    </div>
                    
                    <div className="space-y-1 relative z-10">
                      <div className="text-5xl font-black tracking-tighter text-[var(--text-primary)] font-['Outfit']">{stats.appliedOpportunities}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Active Paths</div>
                    </div>
                  </div>
                  
                  <Link to="/internships" className="mt-8 flex items-center justify-between group-hover:text-[var(--cinematic-coral)] transition-colors relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest">View Network</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CinematicReveal>
              </div>
            </div>

            {/* Editorial Feed & Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
              
              {/* Timeline */}
              <CinematicReveal delay={0.4} className="lg:col-span-5">
                <div className="flex items-center gap-3 mb-8">
                  <Clock className="w-5 h-5 text-[var(--text-secondary)]" />
                  <h2 className="text-xl font-bold font-['Outfit']">System Log</h2>
                </div>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px before:h-full before:w-px before:bg-[var(--border-strong)]">
                  {activities.slice(0, 5).map((act, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      className="relative pl-6"
                    >
                      <div className="absolute left-0 w-3 h-3 rounded-full bg-[var(--surface-elevated)] border-2 border-[var(--accent)] shadow-glow mt-1.5" />
                      <p className="text-sm font-medium leading-relaxed text-[var(--text-primary)]">{act.description}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 font-mono uppercase tracking-widest">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CinematicReveal>

              {/* Featured Opportunities */}
              <CinematicReveal delay={0.5} className="lg:col-span-7">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-[var(--text-secondary)]" />
                    <h2 className="text-xl font-bold font-['Outfit']">Top Matches</h2>
                  </div>
                  <Link to="/internships" className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:text-white transition-colors">
                    Explore All
                  </Link>
                </div>
                
                <div className="flex flex-col gap-4">
                  {recommendedOpps.slice(0, 3).map((opp, idx) => (
                    <div key={idx} className="glass-panel p-6 rounded-2xl group hover:border-[var(--border-strong)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-black text-[var(--cinematic-coral)] uppercase tracking-widest mb-2">{opp.company}</div>
                        <h4 className="text-lg font-bold font-['Outfit'] group-hover:text-[var(--cinematic-coral)] transition-colors">{opp.title}</h4>
                        <div className="text-xs text-[var(--text-secondary)] font-mono mt-2">{opp.deadline}</div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                          <span className="text-xl font-black text-[var(--text-primary)] font-['Outfit']">{opp.matchScore}%</span>
                          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Match</span>
                        </div>
                        <a href={opp.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center border border-[var(--border-strong)] group-hover:bg-[var(--cinematic-coral)] group-hover:text-black transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {recommendedOpps.length === 0 && (
                    <div className="glass-panel p-12 text-center text-sm text-[var(--text-secondary)] font-mono rounded-2xl">
                      Scanning global networks for matches...
                    </div>
                  )}
                </div>
              </CinematicReveal>

            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default Dashboard;
