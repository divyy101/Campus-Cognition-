import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative overflow-hidden"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Navbar title="Funding Desk" />

        <main className="flex-1 p-6 md:px-8 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Hero Section */}
            <div className="semantic-card p-8 flex flex-col md:flex-row items-center justify-between gap-8 group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform group-hover:scale-110" />
              
              <div className="relative z-10 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold tracking-widest uppercase mb-4 border border-[var(--accent)]/30 shadow-sm">
                  <Award className="w-3 h-3" />
                  Institutional Grants
                </div>
                <h1 className="text-3xl md:text-[36px] font-extrabold tracking-tight leading-tight mb-3">
                  Academic Funding Catalog
                </h1>
                <p className="text-sm text-[var(--text-secondary)] max-w-xl">
                  Discover verified scholarships, government schemes, and merit-based financial aid for your academic journey.
                </p>
              </div>

              {/* Search Widget */}
              <div className="w-full md:w-[320px] bg-[var(--surface-elevated)] p-1.5 rounded-xl border border-[var(--border)] shadow-inner relative z-10 flex shrink-0">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[var(--accent)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search grants..."
                    className="w-full bg-transparent pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className="px-4 py-2.5 rounded-lg bg-[var(--accent)] hover:brightness-110 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Sidebar (Filters) */}
              <div className="w-full lg:w-64 shrink-0 space-y-6">
                <div className="semantic-card p-5">
                  <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5" />
                    Funding Categories
                  </h3>
                  
                  <div className="space-y-2">
                    {[
                      { id: 'all', label: 'All Grants' },
                      { id: 'government', label: 'Govt. Schemes' },
                      { id: 'girls', label: 'Women in STEM' },
                      { id: 'merit', label: 'Merit-Based' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                          activeFilter === f.id
                            ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/50'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] border border-transparent'
                        }`}
                      >
                        {f.label}
                        {activeFilter === f.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content (Grants List) */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold">
                    {filteredScholarships.length} Available Funds
                  </h2>
                </div>

                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 semantic-card">
                    <div className="w-8 h-8 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
                    <p className="text-sm text-[var(--text-secondary)] font-medium">Verifying institutional data...</p>
                  </div>
                ) : filteredScholarships.length > 0 ? (
                  <div className="space-y-4 relative z-10">
                    {filteredScholarships.map((sch, idx) => (
                      <div 
                        key={sch.id || idx}
                        className="semantic-card p-5 hover:border-[var(--accent-secondary)] transition-all flex flex-col sm:flex-row gap-5 group"
                      >
                        {/* Funding Badge */}
                        <div className="w-16 h-16 shrink-0 rounded-full bg-[var(--surface-elevated)] border-2 border-[var(--border)] flex flex-col items-center justify-center text-[var(--accent)] group-hover:scale-105 transition-transform relative">
                          <div className="absolute inset-[-4px] rounded-full border border-dashed border-[var(--accent)]/30" />
                          <DollarSign className="w-5 h-5 mb-0.5 text-[var(--accent-secondary)]" />
                          <span className="text-[9px] font-bold uppercase text-[var(--accent)]">Grant</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--surface-elevated)] px-2 py-0.5 rounded border border-[var(--border)]">
                              {sch.source || 'Official Source'}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-secondary)] bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/20 px-2 py-0.5 rounded flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> {sch.matchScore}% Match
                            </span>
                          </div>
                          
                          <h3 className="text-base font-bold mb-2 leading-tight group-hover:text-[var(--accent-secondary)] transition-colors">
                            {sch.title}
                          </h3>
                          
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-4">
                            {sch.description}
                          </p>

                          {/* Details Row */}
                          <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--border)]">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                              <DollarSign className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
                              <span className="text-[var(--accent)]">{sch.stipend || 'Financial Aid Provided'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                              <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                              <span>Ends: {sch.deadline}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] max-w-[200px] truncate">
                              <GraduationCap className="w-3.5 h-3.5 opacity-50" />
                              <span className="truncate">{sch.eligibility}</span>
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-4 sm:pt-0 sm:pl-5 gap-3 shrink-0">
                           <a
                            href={sch.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2.5 rounded-lg bg-[var(--accent)] hover:brightness-110 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
                          >
                            Apply Now
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 semantic-card">
                    <Award className="w-8 h-8 text-[var(--text-secondary)] mb-2" />
                    <h3 className="text-base font-bold">No grants found</h3>
                    <p className="text-sm text-[var(--text-secondary)] max-w-sm">Try adjusting your filters or search terms.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default ScholarshipAgent;
