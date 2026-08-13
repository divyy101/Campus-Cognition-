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
    <div className="flex min-h-screen bg-transparent text-slate-100 font-sans selection:bg-amber-500/30">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Scholarship Agent — Financial Grant Portal" />

        <main className="flex-1 p-6 md:px-8 md:py-6 space-y-6 overflow-y-auto">
          {/* Header Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[32px] glass-card p-8 border border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/20 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-4 shadow-inner">
                  <Award className="w-3.5 h-3.5" />
                  Verified Authoritative Sources Only
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Scholarships & Academic Grants
                </h1>
                <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
                  Discover government schemes, merit-based grants, and female student engineering scholarships from National Scholarship Portal & trusted trusts.
                </p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 lg:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search scholarships (e.g. girls, CGPA)..."
                    className="w-full glass-input rounded-2xl pl-12 pr-4 py-3.5 text-xs placeholder-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 shrink-0 group"
                >
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Search
                </button>
              </form>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8 pt-6 border-t border-white/5 relative z-10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                Filter Category:
              </span>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Opportunities' },
                  { id: 'government', label: 'Govt & NSP Schemes' },
                  { id: 'girls', label: 'Girls in Engineering' },
                  { id: 'merit', label: 'Merit & CGPA Based' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                      activeFilter === f.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Scholarship Cards Grid */}
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading verified scholarships...</p>
            </div>
          ) : filteredScholarships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredScholarships.map((sch, idx) => (
                <motion.div
                  key={sch.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 rounded-[32px] glass-card border border-white/5 hover:bg-white/5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                            {sch.source || 'Official Scholarship Portal'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1 leading-tight group-hover:text-amber-300 transition-colors">
                          {sch.title}
                        </h3>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        {sch.matchScore}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-4 line-clamp-3 leading-relaxed">
                      {sch.description}
                    </p>

                    <div className="mt-5 pt-5 border-t border-white/5 space-y-3">
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                          <DollarSign className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span>Amount: {sch.stipend || 'Financial Grant'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
                        <div className="w-6 h-6 rounded-md bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
                          <Calendar className="w-3 h-3 text-rose-400" />
                        </div>
                        <span>Deadline: {sch.deadline}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate max-w-full sm:max-w-[200px] px-3 py-1.5 rounded-xl bg-black/20">
                      {sch.eligibility}
                    </span>

                    <a
                      href={sch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-amber-500/30 transition-colors shrink-0 group/btn"
                    >
                      Official Source
                      <ExternalLink className="w-3.5 h-3.5 group-hover/btn:scale-110 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
              No matching scholarships found. Try adjusting your filters!
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ScholarshipAgent;
