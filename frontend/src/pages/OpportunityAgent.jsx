import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  Compass, 
  Search, 
  Building2, 
  ExternalLink, 
  Sparkles, 
  Code, 
  Award,
  Bookmark
} from 'lucide-react';

const MNC_LIST = [
  'NVIDIA', 'DRDO', 'Google', 'Microsoft', 'TCS', 'Infosys', 'Amazon', 
  'IBM', 'Oracle', 'Adobe', 'Accenture', 'Deloitte', 'Wipro', 'Cisco', 
  'Intel', 'Meta', 'Samsung', 'Qualcomm', 'AMD', 'Salesforce'
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const OpportunityAgent = () => {
  const [query, setQuery] = useState('');
  const [selectedMnc, setSelectedMnc] = useState('');
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOpportunities = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/opportunities/search?q=${encodeURIComponent(searchQuery)}`);
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
    fetchOpportunities('software engineering');
  }, []);

  const handleMncClick = (company) => {
    setSelectedMnc(company);
    setQuery(company);
    fetchOpportunities(company);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOpportunities(query);
  };

  const handleSave = async (opp) => {
    try {
      await api.post('/opportunities/status', {
        opportunityId: opp.id,
        title: opp.title,
        company: opp.company,
        url: opp.url,
        status: 'SAVED'
      });
      alert(`Saved '${opp.title}' to your profile!`);
    } catch (e) {
      alert('Error saving opportunity.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative overflow-hidden z-10"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-y-auto custom-scrollbar">
        <Navbar title="" />

        <main className="flex-1 px-6 md:px-12 py-8 space-y-12 max-w-[1600px] mx-auto w-full">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-8 md:items-end justify-between bg-[var(--surface)] border border-[var(--border-subtle)] p-8 sm:p-12 relative overflow-hidden rounded-3xl"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--accent)] text-[10px] font-bold tracking-widest uppercase mb-4">
                Ecosystem Search
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                Open Source & Hackathons
              </h1>
              <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-2xl font-medium leading-relaxed">
                Connect with live hackathons, fellowships, and global developer programs from leading tech companies in a unified network graph.
              </p>
            </div>

            {/* Search Widget */}
            <form onSubmit={handleSearch} className="w-full md:w-[400px] relative shrink-0 z-10">
              <Search className="w-5 h-5 text-[var(--text-secondary)] absolute left-5 top-1/2 -translate-y-1/2 z-10" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Query network..."
                className="w-full bg-[var(--surface-elevated)] rounded-2xl pl-14 pr-24 py-4 text-sm font-medium border border-[var(--border-strong)] focus:border-[var(--accent)] transition-colors outline-none placeholder:text-[var(--text-secondary)]/50"
              />
              <button type="submit" className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-[var(--surface)] hover:bg-[var(--accent)] hover:text-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-bold text-xs transition-colors">
                SCAN
              </button>
            </form>
          </motion.div>

          {/* Top Companies Marquee/List */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--accent)]" /> Featured Networks
            </p>
            <div className="flex flex-wrap gap-3">
              {MNC_LIST.slice(0, 10).map((comp) => (
                <button
                  key={comp}
                  onClick={() => handleMncClick(comp)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                    selectedMnc === comp
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--bg-main)]'
                      : 'bg-[var(--surface-elevated)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {comp}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results Grid */}
          <motion.div variants={staggerContainer} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Code className="w-6 h-6 text-[var(--text-secondary)]" />
                Active Bounties & Events
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-3xl"
                >
                  <div className="w-12 h-12 border-2 border-[var(--border-strong)] border-t-[var(--accent)] rounded-full animate-spin" />
                  <p className="text-sm text-[var(--text-secondary)] font-mono uppercase tracking-widest">Scanning discovery nodes...</p>
                </motion.div>
              ) : opportunities.length > 0 ? (
                <motion.div 
                  key="results"
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10"
                >
                  {opportunities.map((opp, idx) => (
                    <motion.div 
                      variants={itemVariant}
                      key={opp.id || idx}
                      className="bg-[var(--surface)] border border-[var(--border-subtle)] p-6 hover:border-[var(--border-strong)] transition-colors flex flex-col h-full group rounded-2xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--text-secondary)]">
                          {opp.company}
                        </div>
                        <button 
                          onClick={() => handleSave(opp)}
                          className="w-8 h-8 rounded-full border border-transparent hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="font-bold text-base mb-3 leading-tight group-hover:text-[var(--text-primary)] text-[var(--text-primary)] transition-colors">
                        {opp.title}
                      </h3>
                      
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed flex-1 mb-6">
                        {opp.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {(opp.requiredSkills || opp.skills || ['Hackathon', 'Open Source']).slice(0, 3).map((s, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-strong)] uppercase tracking-wider">
                            #{s}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-5 border-t border-[var(--border-subtle)] mt-auto">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">
                          <Sparkles className="w-3.5 h-3.5" />
                          {opp.matchScore}% Match
                        </div>
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors group/link"
                        >
                          Explore <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
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
                  className="py-32 flex flex-col items-center justify-center text-center space-y-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-3xl"
                >
                  <Compass className="w-12 h-12 text-[var(--text-secondary)] mb-2 opacity-50" />
                  <h3 className="text-xl font-bold">No nodes found in graph</h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-sm font-mono">Try exploring a different company or adjusting your search parameters.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </motion.div>
  );
};

export default OpportunityAgent;
