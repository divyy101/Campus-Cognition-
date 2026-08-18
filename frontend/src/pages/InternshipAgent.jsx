import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  Bookmark,
  Building
} from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const InternshipAgent = () => {
  const [query, setQuery] = useState('');
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');

  const SKILL_CHIPS = ['Python', 'Java', 'React', 'Node.js', 'Machine Learning', 'Data Structures', 'C++', 'SQL'];

  const fetchInternships = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/internships/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.data.success && res.data.data) {
        setInternships(res.data.data.results || []);
      }
    } catch (err) {
      console.error('Failed to fetch internships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships('MNC internship');
  }, []);

  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
    setQuery(skill);
    fetchInternships(skill);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInternships(query);
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

      <div className="flex-1 flex flex-col min-w-0 z-10 h-screen overflow-y-auto custom-scrollbar">
        <Navbar title="" />

        <main className="flex-1 px-6 md:px-12 py-8 space-y-12 max-w-[1600px] mx-auto w-full">
          
          {/* Header & Search Area */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8 bg-[var(--surface)] border border-[var(--border-subtle)] p-8 sm:p-12 relative overflow-hidden rounded-3xl"
          >
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--accent)] text-[10px] font-bold tracking-widest uppercase mb-4">
                Career Radar
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                Discover roles & companies.
              </h1>
              <p className="text-sm md:text-base text-[var(--text-secondary)] font-medium leading-relaxed max-w-2xl">
                Scan the global ecosystem for internships and entry-level positions tailored to your skill graph.
              </p>
            </div>

            <form onSubmit={handleSearch} className="relative z-10 w-full max-w-4xl flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-[var(--text-secondary)] absolute left-5 top-1/2 -translate-y-1/2 z-10" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search role, company, or skills (e.g. Java Spring)..."
                  className="w-full bg-[var(--surface-elevated)] rounded-2xl pl-14 pr-6 py-4 text-sm font-medium border border-[var(--border-strong)] focus:border-[var(--accent)] transition-colors outline-none placeholder:text-[var(--text-secondary)]/50"
                />
              </div>
              <button 
                type="submit" 
                className="px-10 py-4 rounded-2xl bg-[var(--accent)] hover:brightness-110 text-[var(--bg-main)] font-bold text-sm transition-all shrink-0"
              >
                INITIATE SCAN
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-3 relative z-10">
              {SKILL_CHIPS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillClick(skill)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                    selectedSkill === skill
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--bg-main)]'
                      : 'bg-[var(--surface-elevated)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div variants={staggerContainer} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-[var(--text-secondary)]" />
                {internships.length > 0 ? `${internships.length} opportunities detected` : 'Opportunities'}
              </h2>
              <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest bg-[var(--accent)]/10 px-3 py-1.5 rounded-lg border border-[var(--accent)]/20">Sorted by Match</span>
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
                  <p className="text-sm text-[var(--text-secondary)] font-mono uppercase tracking-widest">Scanning career portals...</p>
                </motion.div>
              ) : internships.length > 0 ? (
                <motion.div 
                  key="results"
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10"
                >
                  {internships.map((item, idx) => (
                    <motion.div 
                      variants={itemVariant}
                      key={item.id || idx}
                      className="bg-[var(--surface)] border border-[var(--border-subtle)] p-8 hover:border-[var(--border-strong)] transition-colors flex flex-col h-full group rounded-2xl"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${item.isCompanyDiscovery ? 'bg-[var(--surface-elevated)] border-[var(--border-strong)] text-[var(--accent)]' : 'bg-[var(--surface-elevated)] border-[var(--border-strong)] text-[var(--text-secondary)]'}`}>
                            <Building className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">{item.company}</div>
                            <h3 className="font-bold text-base line-clamp-1 group-hover:text-[var(--text-primary)] transition-colors">
                              {item.title}
                            </h3>
                          </div>
                        </div>
                        <button className="w-8 h-8 rounded-full border border-transparent hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0">
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Card Body */}
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-6 leading-relaxed flex-1">
                        {item.description}
                      </p>

                      {/* Metadata */}
                      {item.isCompanyDiscovery ? (
                        <div className="space-y-3 mb-8">
                          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Company Tech Stack</div>
                          <div className="flex flex-wrap gap-2">
                            {(item.skills || []).slice(0, 5).map((sk, i) => (
                              <span key={i} className="px-2.5 py-1 bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-md text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{sk}</span>
                            ))}
                            {item.skills && item.skills.length > 5 && <span className="px-2.5 py-1 bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-md text-[10px] font-bold text-[var(--text-secondary)] uppercase">+{item.skills.length - 5}</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 mb-8">
                          <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] bg-[var(--surface-elevated)] px-3 py-2 rounded-lg border border-[var(--border-subtle)] w-fit">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{item.location || 'Remote / Hybrid'}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {(item.requiredSkills || item.skills || []).slice(0, 3).map((sk, i) => (
                               <span key={i} className="px-2.5 py-1 border border-[var(--border-strong)] bg-[var(--surface-elevated)] rounded-md text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{sk}</span>
                             ))}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-5 border-t border-[var(--border-subtle)] mt-auto">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-3 py-1.5 rounded-lg" title={item.matchReason}>
                          <Sparkles className="w-3.5 h-3.5" />
                          {item.matchScore}% Match
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors group/link"
                        >
                          {item.isCompanyDiscovery ? 'View Company' : 'View Details'} <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
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
                  <Search className="w-12 h-12 text-[var(--text-secondary)] mb-2 opacity-50" />
                  <h3 className="text-xl font-bold">No opportunities found</h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-sm font-mono">Try adjusting your search terms or selecting a different skill to find roles.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </motion.div>
  );
};

export default InternshipAgent;
