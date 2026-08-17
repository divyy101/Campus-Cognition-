import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative overflow-hidden"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Navbar title="Career Radar" />

        <main className="flex-1 p-6 md:px-8 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header & Search Area */}
            <div className="flex flex-col gap-6 semantic-card p-6 sm:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform group-hover:scale-110" />
              
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold tracking-widest uppercase mb-3 border border-[var(--accent)]/30">
                  <Briefcase className="w-3 h-3" />
                  Career Radar
                </div>
                <h1 className="text-3xl md:text-[40px] font-extrabold tracking-tight leading-tight">
                  Discover roles & companies.
                </h1>
              </div>

              <form onSubmit={handleSearch} className="relative z-10 w-full max-w-3xl flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-[var(--text-secondary)] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search role, company, or skills (e.g. Java Spring)..."
                    className="semantic-input w-full pl-12 pr-4 py-4 text-sm shadow-inner"
                  />
                </div>
                <button 
                  type="submit" 
                  className="semantic-btn px-8 py-4 shrink-0 font-bold"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-2 relative z-10">
                {SKILL_CHIPS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillClick(skill)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                      selectedSkill === skill
                        ? 'bg-[var(--accent)] text-white shadow-glow'
                        : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">
                  {internships.length > 0 ? `${internships.length} opportunities found` : 'Opportunities'}
                </h2>
                <span className="text-[10px] font-bold text-[var(--accent-secondary)] uppercase tracking-widest bg-[var(--accent-secondary)]/10 px-2 py-1 rounded border border-[var(--accent-secondary)]/20">Sorted by Match</span>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-8 h-8 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
                  <p className="text-sm text-[var(--text-secondary)] font-medium">Scanning career portals...</p>
                </div>
              ) : internships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {internships.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="semantic-card p-6 flex flex-col h-full group"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${item.isCompanyDiscovery ? 'bg-[var(--accent-secondary)]/10 border-[var(--accent-secondary)]/30 text-[var(--accent-secondary)] group-hover:border-[var(--accent-secondary)]' : 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)] group-hover:border-[var(--accent)]'}`}>
                            <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{item.company}</div>
                            <h3 className="font-bold text-sm line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                              {item.title}
                            </h3>
                          </div>
                        </div>
                        <button className="text-[var(--border-strong)] hover:text-[var(--accent)] transition-colors">
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Card Body */}
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 leading-relaxed flex-1">
                        {item.description}
                      </p>

                      {/* Metadata */}
                      {item.isCompanyDiscovery ? (
                        <div className="space-y-2 mb-6">
                          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Company Tech Stack</div>
                          <div className="flex flex-wrap gap-1.5">
                            {(item.skills || []).slice(0, 5).map((sk, i) => (
                              <span key={i} className="px-2 py-1 bg-[var(--surface-elevated)] border border-[var(--border)] rounded text-[10px] font-medium text-[var(--text-secondary)]">{sk}</span>
                            ))}
                            {item.skills && item.skills.length > 5 && <span className="px-2 py-1 bg-[var(--surface-elevated)] rounded text-[10px] font-medium text-[var(--text-secondary)]">+{item.skills.length - 5}</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{item.location || 'Remote / Hybrid'}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                             {(item.requiredSkills || item.skills || []).slice(0, 3).map((sk, i) => (
                               <span key={i} className="px-1.5 py-0.5 border border-[var(--border)] rounded text-[9px] font-bold text-[var(--text-secondary)] uppercase">{sk}</span>
                             ))}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-auto">
                        <div className="flex items-center gap-1.5 text-[var(--accent-secondary)] bg-[var(--accent-secondary)]/10 px-2 py-1 rounded border border-[var(--accent-secondary)]/20 text-[10px] font-bold uppercase tracking-widest" title={item.matchReason}>
                          <Sparkles className="w-3 h-3" />
                          {item.matchScore}% Match
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[var(--accent)] hover:text-[var(--accent)]/80 flex items-center gap-1"
                        >
                          {item.isCompanyDiscovery ? 'View Company' : 'View Details'} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 semantic-card">
                  <Search className="w-8 h-8 text-[var(--text-secondary)] mb-2" />
                  <h3 className="text-base font-bold">No opportunities found</h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-sm">Try adjusting your search terms or selecting a different skill to find roles.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default InternshipAgent;
