import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  GraduationCap,
  Search, 
  ExternalLink, 
  Sparkles, 
  Bookmark,
  Target,
  Award
} from 'lucide-react';
import { AgentStatusIndicator, PageHeader } from '../components/cinematic/CinematicComponents';

const ScholarshipAgent = () => {
  const [query, setQuery] = useState('');
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');

  const TAGS = ['Merit Based', 'Need Based', 'STEM', 'Women in Tech', 'International', 'Research', 'Undergraduate', 'Postgraduate'];

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

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setQuery(tag);
    fetchScholarships(tag);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchScholarships(query);
  };

  return (
    <div className="flex min-h-[100dvh] bg-[var(--bg)]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Navbar title="Scholarship Agent" />

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl mx-auto w-full space-y-12 pb-24">
          
          <PageHeader
            icon={GraduationCap}
            eyebrow="Funding Intelligence"
            title="Scholarship Agent"
            description="Discover funding that fits your academic profile."
            actions={<AgentStatusIndicator status={loading ? 'searching' : 'active'} type="opportunity" />}
          />

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Sidebar: Filters & Search */}
            <aside className="lg:w-[320px] shrink-0 space-y-6">
              <div className="cc-card p-6 sticky top-[100px]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">Funding Parameters</h3>
                
                <form onSubmit={handleSearch} className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Scholarship, provider, criteria..."
                      className="cc-input w-full pl-10 pr-4 py-2.5 text-sm"
                    />
                  </div>
                  <button type="submit" className="cc-btn w-full py-2.5 text-sm">
                    Find Funding
                  </button>
                </form>

                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Suggested Vectors</h4>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                          selectedTag === tag
                            ? 'bg-[var(--accent)] text-[var(--text-on-accent)] border-[var(--accent)]'
                            : 'bg-[var(--surface-sunken)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Feed: Opportunities */}
            <section className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="cc-h3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[var(--accent)]" />
                  {scholarships.length > 0 ? `${scholarships.length} Funding Matches` : 'Awaiting Scan'}
                </h3>
                <span className="cc-badge">Ranked by Match Score</span>
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="py-24 flex flex-col items-center justify-center space-y-4 cc-card"
                  >
                    <div className="w-8 h-8 border-2 border-[var(--border-strong)] border-t-[var(--accent)] rounded-full animate-spin" />
                    <p className="cc-caption text-[var(--accent)] animate-pulse">Scanning Scholarship Database</p>
                  </motion.div>
                ) : scholarships.length > 0 ? (
                  <motion.div 
                    key="results"
                    className="grid grid-cols-1 xl:grid-cols-2 gap-6"
                  >
                    {scholarships.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={item.id || idx}
                        className="cc-card p-6 flex flex-col h-full hover:border-[var(--accent)] transition-colors group relative overflow-hidden"
                      >
                        {/* Match Score Indicator Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--surface-sunken)]">
                          <div 
                            className="h-full bg-[var(--accent)]" 
                            style={{ width: `${item.matchScore || 0}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-start mb-4 mt-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-colors">
                              <Award className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">{item.company || item.provider}</div>
                              <h4 className="text-base font-bold text-[var(--text-primary)] line-clamp-1 leading-tight">
                                {item.title}
                              </h4>
                            </div>
                          </div>
                          <button className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-1">
                            <Bookmark className="w-5 h-5" />
                          </button>
                        </div>

                        <p className="cc-body text-[var(--text-secondary)] line-clamp-2 mb-6 flex-1 text-sm">
                          {item.description}
                        </p>

                        <div className="space-y-3 mb-6">
                          {item.amount && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--success)] bg-[var(--success-soft)] px-3 py-1.5 rounded-lg border border-[var(--success)]/20 w-fit">
                              <Award className="w-3.5 h-3.5" />
                              <span>{item.amount}</span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                             {(item.requiredCriteria || item.skills || []).slice(0, 3).map((cr, i) => (
                               <span key={i} className="px-2 py-1 bg-[var(--surface-sunken)] rounded text-[11px] font-bold text-[var(--text-secondary)] border border-[var(--border)]">{cr}</span>
                             ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-auto">
                          <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--text-primary)]">
                            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                            {item.matchScore}% <span className="text-[var(--text-muted)] font-medium">Match</span>
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cc-btn-ghost px-4 py-2 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                          >
                            Apply <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="py-24 flex flex-col items-center justify-center text-center space-y-3 cc-card"
                  >
                    <Search className="w-10 h-10 text-[var(--text-muted)]" />
                    <h3 className="cc-h3 text-[var(--text-primary)]">No scholarships found</h3>
                    <p className="cc-caption">Adjust search criteria to find funding.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ScholarshipAgent;
