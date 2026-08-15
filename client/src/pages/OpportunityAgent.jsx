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
    <div className="flex min-h-screen bg-emerald-50/40 dark:bg-[#071311] font-sans text-slate-900 dark:text-emerald-50 transition-colors duration-500 relative overflow-hidden">
      
      {/* Network Nodes Motif */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
           style={{ 
             backgroundImage: 'radial-gradient(circle at 50% 50%, #10b981 2px, transparent 2px), radial-gradient(circle at 20% 80%, #059669 2px, transparent 2px), radial-gradient(circle at 80% 20%, #0d9488 2px, transparent 2px)', 
             backgroundSize: '100px 100px, 120px 120px, 150px 150px' 
           }}>
      </div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-600/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-600/10 dark:bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />
      
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar title="Discovery Graph" />

        <main className="flex-1 p-6 md:px-8 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between bg-white/80 dark:bg-[#0B1A17]/90 p-6 sm:p-8 rounded-[24px] border border-teal-100 dark:border-teal-900/40 shadow-sm relative overflow-hidden backdrop-blur-xl z-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-[10px] font-bold tracking-widest uppercase mb-3 border border-teal-200 dark:border-teal-800/50 shadow-sm">
                  <Compass className="w-3 h-3" />
                  Ecosystem Search
                </div>
                <h1 className="text-3xl md:text-[36px] font-extrabold tracking-tight text-teal-950 dark:text-emerald-50 leading-tight">
                  Open Source & Hackathons
                </h1>
                <p className="text-sm text-teal-900/70 dark:text-teal-100/60 mt-2 max-w-xl font-medium">
                  Connect with live hackathons, fellowships, and global developer programs from leading tech companies.
                </p>
              </div>

              {/* Search Widget */}
              <form onSubmit={handleSearch} className="w-full md:w-[350px] relative shrink-0 z-10">
                <Search className="w-4 h-4 text-teal-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search programs, companies..."
                  className="w-full bg-teal-50/50 dark:bg-[#071311] border border-teal-200 dark:border-teal-900/50 rounded-full pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-emerald-50 placeholder-teal-400 dark:placeholder-teal-700 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors shadow-inner"
                />
                <button type="submit" className="absolute right-2 top-1.5 bottom-1.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm">
                  Find
                </button>
              </form>
            </div>

            {/* Top Companies Marquee/List */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-teal-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Featured Networks
              </p>
              <div className="flex flex-wrap gap-2">
                {MNC_LIST.slice(0, 10).map((comp) => (
                  <button
                    key={comp}
                    onClick={() => handleMncClick(comp)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${
                      selectedMnc === comp
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-white dark:bg-[#0B1A17]/90 border-teal-100 dark:border-teal-900/40 text-slate-600 dark:text-teal-200 hover:border-emerald-300 dark:hover:border-emerald-500/50 backdrop-blur-md'
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-emerald-50 flex items-center gap-2">
                  <Code className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                  Active Bounties & Events
                </h2>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-8 h-8 border-2 border-teal-200 border-t-emerald-600 rounded-full animate-spin" />
                  <p className="text-sm text-slate-500 dark:text-teal-400 font-medium">Scanning discovery nodes...</p>
                </div>
              ) : opportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
                  {opportunities.map((opp, idx) => (
                    <div 
                      key={opp.id || idx}
                      className="bg-white dark:bg-[#0B1A17]/90 rounded-xl p-5 border border-teal-100 dark:border-teal-900/40 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group hover:border-emerald-300 dark:hover:border-emerald-500/60 backdrop-blur-xl"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${opp.isCompanyDiscovery ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/40' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'}`}>
                          {opp.company}
                        </div>
                        <button 
                          onClick={() => handleSave(opp)}
                          className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-emerald-50 mb-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {opp.title}
                      </h3>
                      
                      <p className="text-xs text-slate-600 dark:text-teal-100/60 line-clamp-2 leading-relaxed flex-1 mb-4">
                        {opp.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {(opp.requiredSkills || opp.skills || ['Hackathon', 'Open Source']).slice(0, 3).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[9px] font-semibold bg-teal-50/50 dark:bg-[#071311] text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-900/40">
                            #{s}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-teal-50 dark:border-teal-900/30">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded shadow-sm" title={opp.matchReason}>
                          <Sparkles className="w-3 h-3" />
                          {opp.matchScore}% Match
                        </div>
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                        >
                          Explore <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-[#0B1A17]/90 rounded-xl border border-teal-100 dark:border-teal-900/40 shadow-sm backdrop-blur-xl z-10 relative">
                  <Compass className="w-8 h-8 text-teal-200 dark:text-teal-800 mb-2" />
                  <h3 className="text-base font-bold text-slate-700 dark:text-teal-200">No nodes found in graph</h3>
                  <p className="text-sm text-slate-500 dark:text-teal-100/50 max-w-sm">Try exploring a different company or keyword.</p>
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
