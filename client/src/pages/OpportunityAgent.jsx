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
    <div className="flex min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-rose-900/20 text-slate-100 font-sans selection:bg-rose-500/30">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Opportunity Agent — Live MNC & Global Search" />

        <main className="flex-1 p-6 md:px-8 md:py-6 space-y-6 overflow-y-auto">
          {/* Header Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[32px] glass-card p-8 border border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/20 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none translate-y-1/3" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-widest mb-4 shadow-inner">
                  <Compass className="w-3.5 h-3.5" />
                  Live Discovery Engine
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Hackathons & Global Fellowships
                </h1>
                <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
                  Search live early career initiatives, research fellowships, and hackathons across leading MNCs.
                </p>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 lg:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter company (NVIDIA, Google)..."
                    className="w-full glass-input rounded-2xl pl-12 pr-4 py-3.5 text-xs placeholder-slate-500"
                  />
                </div>
                <button type="submit" className="px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all flex items-center justify-center gap-2 shrink-0 group">
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Search
                </button>
              </form>
            </div>

            {/* MNC Selector Chips */}
            <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 ml-1">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                Quick MNC Search
              </p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                {MNC_LIST.map((comp) => (
                  <button
                    key={comp}
                    onClick={() => handleMncClick(comp)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                      selectedMnc === comp
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Opportunity Cards Grid */}
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mb-4" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Retrieving live opportunities...</p>
            </div>
          ) : opportunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.map((opp, idx) => (
                <motion.div
                  key={opp.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 rounded-[32px] glass-card border border-white/5 hover:bg-white/5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                            {opp.company}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white leading-tight group-hover:text-sky-300 transition-colors">
                          {opp.title}
                        </h3>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        {opp.matchScore}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-4 line-clamp-3 leading-relaxed">
                      {opp.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/5">
                      {(opp.skills || []).map((s, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => handleSave(opp)}
                      className="p-3 rounded-2xl glass-button text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-colors flex items-center justify-center group/save"
                      title="Save Opportunity"
                    >
                      <Bookmark className="w-4 h-4 group-hover/save:scale-110 transition-transform" />
                    </button>

                    <a
                      href={opp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs flex items-center justify-center gap-2 border border-sky-500/30 transition-colors shrink-0 group/btn"
                    >
                      View Details
                      <ExternalLink className="w-3.5 h-3.5 group-hover/btn:scale-110 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
              No matching opportunities found. Try another search.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OpportunityAgent;
