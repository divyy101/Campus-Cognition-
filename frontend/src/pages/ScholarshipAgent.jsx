import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  Compass,
  Briefcase, 
  Search, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  Bookmark,
  Target
} from 'lucide-react';
import { CinematicReveal, FloatingVisual, AgentStatusIndicator, ScrollSection } from '../components/cinematic/CinematicComponents';

const OpportunityAgent = () => {
  const [query, setQuery] = useState('');
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');

  const TAGS = ['AI/ML', 'Frontend', 'Backend', 'Data Science', 'Product Management', 'DevOps', 'UI/UX', 'Remote'];

  const fetchOpportunities = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/internships/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.data.success && res.data.data) {
        setOpportunities(res.data.data.results || []);
      }
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities('Entry level');
  }, []);

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setQuery(tag);
    fetchOpportunities(tag);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOpportunities(query);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.8 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative overflow-hidden z-10"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 z-10 h-screen overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Navbar title="" />

        <main className="flex-1 pb-24 relative">
          
          {/* Visual Anchor Hero Section */}
          <ScrollSection className="w-full relative min-h-[50vh] flex flex-col justify-center px-6 md:px-12 pt-12 pb-16 max-w-[1800px] mx-auto border-b border-[var(--border-subtle)]">
            
            {/* Visual Anchor */}
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] opacity-30 md:opacity-100 z-[-1] pointer-events-none mask-image-left mix-blend-screen">
              <FloatingVisual 
                src="/visuals/opportunity-visual.jpg" 
                alt="Career Network"
                speed="medium"
                className="w-full h-full object-cover object-left"
              />
            </div>
            
            <div className="relative z-20 max-w-3xl">
              <CinematicReveal delay={0.1} direction="up" className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] flex items-center justify-center shadow-[0_0_15px_var(--cinematic-coral)]">
                  <Compass className="w-5 h-5 text-[var(--cinematic-coral)]" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-3xl font-extrabold font-['Outfit']">Opportunity Agent</h1>
                  <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest flex items-center gap-2">
                     Network Scanner 
                     <AgentStatusIndicator status={loading ? 'searching' : 'active'} type="opportunity" />
                  </p>
                </div>
              </CinematicReveal>
              
              <CinematicReveal delay={0.2} direction="up">
                <h2 className="text-5xl font-extrabold tracking-tight leading-[1.1] mb-6 font-['Outfit']">
                  Discover roles that fit <br/>
                  <span className="text-[var(--cinematic-coral)]">your skill graph.</span>
                </h2>
              </CinematicReveal>

              <CinematicReveal delay={0.3} direction="up">
                <form onSubmit={handleSearch} className="w-full max-w-2xl flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-[var(--text-secondary)] absolute left-5 top-1/2 -translate-y-1/2 z-10" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search role, company, or skills..."
                      className="w-full bg-[var(--surface-elevated)]/80 backdrop-blur-md rounded-2xl pl-14 pr-6 py-4 text-sm font-bold border border-[var(--border-strong)] focus:border-[var(--cinematic-coral)] shadow-glow outline-none transition-all placeholder:text-[var(--text-secondary)]/50"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="px-10 py-4 rounded-2xl bg-[var(--cinematic-coral)] text-black font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-[0_0_15px_rgba(240,138,138,0.4)] transition-all shrink-0"
                  >
                    Scan Network
                  </button>
                </form>
              </CinematicReveal>

              <CinematicReveal delay={0.4} direction="up" className="mt-8 flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedTag === tag
                        ? 'bg-[var(--cinematic-coral)] border-[var(--cinematic-coral)] text-black'
                        : 'bg-[var(--surface-elevated)]/50 border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--cinematic-coral)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </CinematicReveal>
            </div>
          </ScrollSection>

          {/* Results Section */}
          <div className="px-6 md:px-12 pt-12 max-w-[1800px] mx-auto w-full relative z-20">
            <CinematicReveal delay={0.5}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold font-['Outfit'] flex items-center gap-3">
                  <Target className="w-6 h-6 text-[var(--cinematic-coral)]" />
                  {opportunities.length > 0 ? `${opportunities.length} Neural Matches` : 'Awaiting Scan'}
                </h3>
                <span className="text-[10px] font-bold text-[var(--cinematic-coral)] uppercase tracking-widest bg-[var(--cinematic-coral)]/10 px-3 py-1.5 rounded-lg border border-[var(--cinematic-coral)]/20">Ranked by Match Score</span>
              </div>
            </CinematicReveal>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-[var(--surface)]/50 border border-[var(--border-subtle)] rounded-3xl backdrop-blur-sm"
                >
                  <div className="w-16 h-16 border-2 border-[var(--border-strong)] border-t-[var(--cinematic-coral)] rounded-full animate-spin" />
                  <p className="text-xs font-mono uppercase tracking-widest text-[var(--cinematic-coral)] animate-pulse">Scanning Global Career Networks</p>
                </motion.div>
              ) : opportunities.length > 0 ? (
                <motion.div 
                  key="results"
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {opportunities.map((item, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05, duration: 0.5 }}
                      key={item.id || idx}
                      className="glass-panel p-8 hover:border-[var(--cinematic-coral)] transition-colors flex flex-col h-full group rounded-3xl"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors bg-[var(--surface-elevated)] border-[var(--border-strong)] text-[var(--cinematic-coral)]`}>
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">{item.company}</div>
                            <h4 className="font-bold text-lg line-clamp-1 group-hover:text-[var(--cinematic-coral)] transition-colors font-['Outfit']">
                              {item.title}
                            </h4>
                          </div>
                        </div>
                        <button className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--cinematic-coral)] transition-colors shrink-0">
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Card Body */}
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-6 leading-relaxed flex-1">
                        {item.description}
                      </p>

                      {/* Metadata */}
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-main)] px-3 py-2 rounded-lg border border-[var(--border-strong)] w-fit">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{item.location || 'Remote / Hybrid'}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {(item.requiredSkills || item.skills || []).slice(0, 3).map((sk, i) => (
                             <span key={i} className="px-2.5 py-1 bg-[var(--surface-elevated)] rounded-md text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{sk}</span>
                           ))}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-5 border-t border-[var(--border-subtle)] mt-auto">
                        <div className="flex items-center gap-1.5 text-xs font-black text-[var(--cinematic-coral)] font-['Outfit']">
                          <Sparkles className="w-4 h-4" />
                          {item.matchScore}% Match
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-black bg-[var(--text-secondary)] group-hover:bg-[var(--cinematic-coral)] flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors"
                        >
                          Details <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-32 flex flex-col items-center justify-center text-center space-y-4 bg-[var(--surface)]/50 border border-[var(--border-subtle)] rounded-3xl backdrop-blur-sm"
                >
                  <Search className="w-12 h-12 text-[var(--text-secondary)] mb-2 opacity-50" />
                  <h3 className="text-xl font-bold font-['Outfit']">No matches found</h3>
                  <p className="text-xs text-[var(--text-secondary)] max-w-sm font-mono uppercase tracking-widest">Adjust neural search parameters.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default OpportunityAgent;
