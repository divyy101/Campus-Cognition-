import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Award, 
  DollarSign, 
  Calendar,
  Sparkles
} from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const ScholarshipAgent = () => {
  const [query, setQuery] = useState('');
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchScholarships = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/scholarships/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.data.success && res.data.data) {
        setScholarships(res.data.data.results || []);
      }
    } catch (err) {
      console.error('Failed to fetch scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships('');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchScholarships(query);
  };

  const filteredScholarships = scholarships.filter(s => {
    if (activeFilter === 'girls') return (s.title + s.description).toLowerCase().includes('girl') || (s.title + s.description).toLowerCase().includes('women');
    if (activeFilter === 'merit') return (s.title + s.description).toLowerCase().includes('merit') || (s.title + s.description).toLowerCase().includes('cgpa');
    if (activeFilter === 'government') return (s.source + s.title).toLowerCase().includes('gov') || (s.source + s.title).toLowerCase().includes('nsp') || (s.source + s.title).toLowerCase().includes('national');
    return true;
  });

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
          
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--surface)] border border-[var(--border-subtle)] p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group rounded-3xl relative overflow-hidden"
          >
            <div className="relative z-10 flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--accent)] text-[10px] font-bold tracking-widest uppercase mb-5">
                <Award className="w-3.5 h-3.5" />
                Institutional Grants
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                Academic Funding Catalog
              </h1>
              <p className="text-sm md:text-base text-[var(--text-secondary)] font-medium leading-relaxed">
                Discover verified scholarships, government schemes, and merit-based financial aid for your academic journey through our intelligent parsing engine.
              </p>
            </div>

            {/* Search Widget */}
            <div className="w-full md:w-[380px] bg-[var(--surface-elevated)] p-2 rounded-2xl border border-[var(--border-strong)] relative z-10 flex shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search grants..."
                  className="w-full bg-transparent pl-12 pr-4 py-3.5 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="px-6 py-3.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--accent)] hover:text-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-bold text-xs transition-colors"
              >
                FIND
              </button>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Sidebar (Filters) */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full lg:w-72 shrink-0 space-y-6"
            >
              <div className="bg-[var(--surface)] border border-[var(--border-subtle)] p-6 rounded-2xl">
                <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Funding Categories
                </h3>
                
                <div className="space-y-3">
                  {[
                    { id: 'all', label: 'All Grants' },
                    { id: 'government', label: 'Govt. Schemes' },
                    { id: 'girls', label: 'Women in STEM' },
                    { id: 'merit', label: 'Merit-Based' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                        activeFilter === f.id
                          ? 'bg-[var(--accent)] text-[var(--bg-main)]'
                          : 'text-[var(--text-secondary)] bg-[var(--surface-elevated)] border border-[var(--border-strong)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {f.label}
                      {activeFilter === f.id && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Main Content (Grants List) */}
            <div className="flex-1 space-y-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]"
              >
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-[var(--text-secondary)]" />
                  {filteredScholarships.length} Available Funds
                </h2>
              </motion.div>

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
                    <p className="text-sm text-[var(--text-secondary)] font-mono uppercase tracking-widest">Verifying institutional data...</p>
                  </motion.div>
                ) : filteredScholarships.length > 0 ? (
                  <motion.div 
                    key="results"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="space-y-5 relative z-10"
                  >
                    {filteredScholarships.map((sch, idx) => (
                      <motion.div 
                        variants={itemVariant}
                        key={sch.id || idx}
                        className="bg-[var(--surface)] border border-[var(--border-subtle)] p-6 hover:border-[var(--border-strong)] transition-colors flex flex-col sm:flex-row gap-6 group rounded-2xl"
                      >
                        {/* Funding Badge */}
                        <div className="w-20 h-20 shrink-0 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] flex flex-col items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
                          <DollarSign className="w-8 h-8 mb-1" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Grant</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--surface-elevated)] px-3 py-1.5 rounded-lg border border-[var(--border-strong)]">
                              {sch.source || 'Official Source'}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" /> {sch.matchScore}% Match
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-[var(--text-primary)] transition-colors">
                            {sch.title}
                          </h3>
                          
                          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-6">
                            {sch.description}
                          </p>

                          {/* Details Row */}
                          <div className="flex flex-wrap gap-5 pt-5 border-t border-[var(--border-subtle)]">
                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] bg-[var(--surface-elevated)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
                              <DollarSign className="w-4 h-4 text-[var(--text-primary)]" />
                              <span className="text-[var(--text-primary)]">{sch.stipend || 'Financial Aid Provided'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] bg-[var(--surface-elevated)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
                              <Calendar className="w-4 h-4" />
                              <span>Ends: {sch.deadline}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] max-w-[250px] truncate bg-[var(--surface-elevated)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
                              <GraduationCap className="w-4 h-4 opacity-50" />
                              <span className="truncate">{sch.eligibility}</span>
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-[var(--border-subtle)] pt-5 sm:pt-0 sm:pl-6 gap-3 shrink-0">
                           <a
                            href={sch.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--accent)] hover:brightness-110 text-[var(--bg-main)] font-bold text-sm transition-all flex items-center justify-center gap-2"
                          >
                            Apply Now
                            <ExternalLink className="w-4 h-4" />
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
                    <Award className="w-12 h-12 text-[var(--text-secondary)] mb-2 opacity-50" />
                    <h3 className="text-xl font-bold">No grants found</h3>
                    <p className="text-sm text-[var(--text-secondary)] max-w-sm font-mono">Try adjusting your filters or search terms.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default ScholarshipAgent;
