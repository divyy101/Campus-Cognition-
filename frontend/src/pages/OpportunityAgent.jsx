import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative overflow-hidden"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar title="Discovery Graph" />

        <main className="flex-1 p-6 md:px-8 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between semantic-card p-6 sm:p-8 group relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform group-hover:scale-110" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] text-[10px] font-bold tracking-widest uppercase mb-3 border border-[var(--accent-secondary)]/30 shadow-sm">
                  <Compass className="w-3 h-3" />
                  Ecosystem Search
                </div>
                <h1 className="text-3xl md:text-[36px] font-extrabold tracking-tight leading-tight">
                  Open Source & Hackathons
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl font-medium">
                  Connect with live hackathons, fellowships, and global developer programs from leading tech companies.
                </p>
              </div>

              {/* Search Widget */}
              <form onSubmit={handleSearch} className="w-full md:w-[350px] relative shrink-0 z-10">
                <Search className="w-4 h-4 text-[var(--accent)] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search programs, companies..."
                  className="semantic-input w-full rounded-full pl-11 pr-4 py-3 text-sm shadow-inner"
                />
                <button type="submit" className="absolute right-2 top-1.5 bottom-1.5 px-4 rounded-full bg-[var(--accent)] hover:brightness-110 text-white font-bold text-xs transition-colors shadow-sm">
                  Find
                </button>
              </form>
            </div>

            {/* Top Companies Marquee/List */}
            <div>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Featured Networks
              </p>
              <div className="flex flex-wrap gap-2">
                {MNC_LIST.slice(0, 10).map((comp) => (
                  <button
                    key={comp}
                    onClick={() => handleMncClick(comp)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${
                      selectedMnc === comp
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-glow'
                        : 'bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Code className="w-5 h-5 text-[var(--accent)]" />
                  Active Bounties & Events
                </h2>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 semantic-card">
                  <div className="w-8 h-8 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
                  <p className="text-sm text-[var(--text-secondary)] font-medium">Scanning discovery nodes...</p>
                </div>
              ) : opportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
                  {opportunities.map((opp, idx) => (
                    <div 
                      key={opp.id || idx}
                      className="semantic-card p-5 hover:border-[var(--accent)] transition-shadow flex flex-col h-full group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${opp.isCompanyDiscovery ? 'bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] border-[var(--accent-secondary)]/30' : 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30'}`}>
                          {opp.company}
                        </div>
                        <button 
                          onClick={() => handleSave(opp)}
                          className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="font-bold text-sm mb-2 leading-tight group-hover:text-[var(--accent)] transition-colors">
                        {opp.title}
                      </h3>
                      
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed flex-1 mb-4">
                        {opp.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {(opp.requiredSkills || opp.skills || ['Hackathon', 'Open Source']).slice(0, 3).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border-strong)]">
                            #{s}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest bg-[var(--accent)]/10 px-2 py-1 rounded shadow-sm" title={opp.matchReason}>
                          <Sparkles className="w-3 h-3" />
                          {opp.matchScore}% Match
                        </div>
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[var(--accent-secondary)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
                        >
                          Explore <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 semantic-card relative">
                  <Compass className="w-8 h-8 text-[var(--text-secondary)] mb-2" />
                  <h3 className="text-base font-bold">No nodes found in graph</h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-sm">Try exploring a different company or keyword.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default OpportunityAgent;
