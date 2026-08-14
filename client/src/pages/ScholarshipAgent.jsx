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
    <div className="flex min-h-screen bg-[#FDFBF7] dark:bg-[#171717] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Funding Desk" />

        <main className="flex-1 p-6 md:px-8 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Hero Section */}
            <div className="bg-white dark:bg-[#262626] rounded-2xl p-8 border border-amber-100 dark:border-amber-900/30 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 dark:bg-amber-900/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              
              <div className="relative z-10 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold tracking-widest uppercase mb-4 border border-amber-200 dark:border-amber-800/50">
                  <Award className="w-3 h-3" />
                  Institutional Grants
                </div>
                <h1 className="text-3xl md:text-[36px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-3">
                  Academic Funding Catalog
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                  Discover verified scholarships, government schemes, and merit-based financial aid for your academic journey.
                </p>
              </div>

              {/* Search Widget */}
              <div className="w-full md:w-[320px] bg-[#FDFBF7] dark:bg-[#171717] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner relative z-10 flex shrink-0">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search grants..."
                    className="w-full bg-transparent pl-9 pr-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Sidebar (Filters) */}
              <div className="w-full lg:w-64 shrink-0 space-y-6">
                <div className="bg-white dark:bg-[#262626] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
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
                            ? 'bg-amber-50 dark:bg-[#171717] text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#171717] border border-transparent'
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
                  <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {filteredScholarships.length} Available Funds
                  </h2>
                </div>

                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-[#262626] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">Verifying institutional data...</p>
                  </div>
                ) : filteredScholarships.length > 0 ? (
                  <div className="space-y-4">
                    {filteredScholarships.map((sch, idx) => (
                      <div 
                        key={sch.id || idx}
                        className="bg-white dark:bg-[#262626] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-900/50 transition-all flex flex-col sm:flex-row gap-5 relative overflow-hidden group"
                      >
                        {/* Funding Badge */}
                        <div className="w-16 h-16 shrink-0 rounded-full bg-[#FDFBF7] dark:bg-[#171717] border-2 border-amber-100 dark:border-amber-900/30 flex flex-col items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform relative">
                          <div className="absolute inset-[-4px] rounded-full border border-dashed border-amber-200 dark:border-amber-800/50" />
                          <DollarSign className="w-5 h-5 mb-0.5" />
                          <span className="text-[9px] font-bold uppercase">Grant</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-[#171717] px-2 py-0.5 rounded">
                              {sch.source || 'Official Source'}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> {sch.matchScore}% Match
                            </span>
                          </div>
                          
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                            {sch.title}
                          </h3>
                          
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                            {sch.description}
                          </p>

                          {/* Details Row */}
                          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-700 dark:text-emerald-400">{sch.stipend || 'Financial Aid Provided'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                              <Calendar className="w-3.5 h-3.5 text-amber-500" />
                              <span>Ends: {sch.deadline}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{sch.eligibility}</span>
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/60 pt-4 sm:pt-0 sm:pl-5 gap-3 shrink-0">
                           <a
                            href={sch.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
                          >
                            Apply Now
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-[#262626] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <Award className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No grants found</h3>
                    <p className="text-sm text-slate-500 max-w-sm">Try adjusting your filters or search terms.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ScholarshipAgent;
