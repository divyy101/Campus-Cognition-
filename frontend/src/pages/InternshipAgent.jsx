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
  Target
} from 'lucide-react';
import { AgentStatusIndicator, PageHeader } from '../components/cinematic/CinematicComponents';

const InternshipAgent = () => {
  const [query, setQuery] = useState('');
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');

  const TAGS = ['AI/ML', 'Frontend', 'Backend', 'Data Science', 'Product Management', 'DevOps', 'UI/UX', 'Remote'];

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
    fetchInternships('Entry level');
  }, []);

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setQuery(tag);
    fetchInternships(tag);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInternships(query);
  };

  return (
    <div className="flex min-h-[100dvh] bg-[var(--bg)]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Navbar title="Internship Agent" />

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl mx-auto w-full space-y-12 pb-24">
          
          <PageHeader
            icon={Briefcase}
            eyebrow="Network Scanner"
            title="Internship Agent"
            description="Find internships that match your skill graph."
            actions={<AgentStatusIndicator status={loading ? 'searching' : 'active'} type="opportunity" />}
          />

          <section>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search role, company, or skills..."
                  className="cc-input w-full pl-12 pr-4 py-3"
                />
              </div>
              <button type="submit" className="cc-btn px-8 py-3">
                Scan Network
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
                    selectedTag === tag
                      ? 'bg-[var(--accent)] text-[var(--text-on-accent)] border-[var(--accent)]'
                      : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="cc-h3 flex items-center gap-2">
                <Target className="w-5 h-5 text-[var(--accent)]" />
                {internships.length > 0 ? `${internships.length} Neural Matches` : 'Awaiting Scan'}
              </h3>
              <span className="cc-badge">Ranked by Match Score</span>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="py-24 flex flex-col items-center justify-center space-y-4"
                >
                  <div className="w-8 h-8 border-2 border-[var(--border-strong)] border-t-[var(--accent)] rounded-full animate-spin" />
                  <p className="cc-caption text-[var(--accent)] animate-pulse">Scanning Global Career Networks</p>
                </motion.div>
              ) : internships.length > 0 ? (
                <motion.div 
                  key="results"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {internships.map((item, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={item.id || idx}
                      className="cc-card p-6 flex flex-col h-full hover:border-[var(--accent)] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)]">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="cc-eyebrow mb-1">{item.company}</div>
                            <h4 className="text-base font-bold text-[var(--text-primary)] line-clamp-1">
                              {item.title}
                            </h4>
                          </div>
                        </div>
                        <button className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="cc-body text-[var(--text-secondary)] line-clamp-2 mb-6 flex-1">
                        {item.description}
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                          <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                          <span>{item.location || 'Remote / Hybrid'}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {(item.requiredSkills || item.skills || []).slice(0, 3).map((sk, i) => (
                             <span key={i} className="px-2 py-1 bg-[var(--surface-sunken)] rounded text-xs font-semibold text-[var(--text-secondary)] border border-[var(--border)]">{sk}</span>
                           ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-auto">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--accent)]">
                          <Sparkles className="w-4 h-4" />
                          {item.matchScore}% Match
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cc-btn-secondary px-4 py-2 text-xs"
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
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="py-24 flex flex-col items-center justify-center text-center space-y-3"
                >
                  <Search className="w-10 h-10 text-[var(--text-muted)]" />
                  <h3 className="cc-h3 text-[var(--text-primary)]">No matches found</h3>
                  <p className="cc-caption">Adjust neural search parameters.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </main>
      </div>
    </div>
  );
};

export default InternshipAgent;
