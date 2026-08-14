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
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0F0E17] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      
      {/* Network Nodes Motif */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
           style={{ 
             backgroundImage: 'radial-gradient(circle at 50% 50%, #9333ea 2px, transparent 2px), radial-gradient(circle at 20% 80%, #db2777 2px, transparent 2px), radial-gradient(circle at 80% 20%, #e11d48 2px, transparent 2px)', 
             backgroundSize: '100px 100px, 120px 120px, 150px 150px' 
           }}>
      </div>
      
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar title="Discovery Graph" />

        <main className="flex-1 p-6 md:px-8 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-[10px] font-bold tracking-widest uppercase mb-3 border border-pink-200 dark:border-pink-800/50">
                  <Compass className="w-3 h-3" />
                  Ecosystem Search
                </div>
                <h1 className="text-3xl md:text-[36px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Open Source & Hackathons
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
                  Connect with live hackathons, fellowships, and global developer programs from leading tech companies.
                </p>
              </div>

              {/* Search Widget */}
              <form onSubmit={handleSearch} className="w-full md:w-[350px] relative shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search programs, companies..."
                  className="w-full bg-white dark:bg-[#1A1825] border border-slate-200 dark:border-slate-800 rounded-full pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 dark:focus:border-pink-400 transition-colors shadow-sm"
                />
                <button type="submit" className="absolute right-2 top-1.5 bottom-1.5 px-4 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition-colors">
                  Find
                </button>
              </form>
            </div>

            {/* Top Companies Marquee/List */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Featured Networks
              </p>
              <div className="flex flex-wrap gap-2">
                {MNC_LIST.slice(0, 10).map((comp) => (
                  <button
                    key={comp}
                    onClick={() => handleMncClick(comp)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${
                      selectedMnc === comp
                        ? 'bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-500/20'
                        : 'bg-white dark:bg-[#1A1825] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-pink-300 dark:hover:border-pink-500/50'
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Active Bounties & Events
                </h2>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
                  <p className="text-sm text-slate-500 font-medium">Scanning discovery nodes...</p>
                </div>
              ) : opportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {opportunities.map((opp, idx) => (
                    <div 
                      key={opp.id || idx}
                      className="bg-white dark:bg-[#1A1825] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-100 dark:border-purple-800/30">
                          {opp.company}
                        </div>
                        <button 
                          onClick={() => handleSave(opp)}
                          className="text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {opp.title}
                      </h3>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1 mb-4">
                        {opp.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {(opp.skills || ['Hackathon', 'Open Source']).slice(0, 3).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-100 dark:bg-[#0F0E17] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                            #{s}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded">
                          <Sparkles className="w-3 h-3" />
                          {opp.matchScore}% Match
                        </div>
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 flex items-center gap-1 transition-colors"
                        >
                          Explore <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-[#1A1825] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <Compass className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No nodes found in graph</h3>
                  <p className="text-sm text-slate-500 max-w-sm">Try exploring a different company or keyword.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OpportunityAgent;
