import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  DollarSign, 
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
    <div className="flex min-h-screen bg-[#F0F4F8] dark:bg-[#0B111A] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      
      {/* Career Portal Motif */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(45deg, #f59e0b 25%, transparent 25%, transparent 75%, #f59e0b 75%, #f59e0b), linear-gradient(45deg, #f59e0b 25%, transparent 25%, transparent 75%, #f59e0b 75%, #f59e0b)', backgroundSize: '60px 60px', backgroundPosition: '0 0, 30px 30px' }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 dark:bg-amber-600/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px] bg-teal-600/5 dark:bg-teal-600/10 blur-[100px] rounded-full pointer-events-none" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Career Radar" />

        <main className="flex-1 p-6 md:px-8 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header & Search Area */}
            <div className="flex flex-col gap-6 bg-white dark:bg-[#111622]/90 p-6 sm:p-8 rounded-[24px] border border-slate-200 dark:border-amber-900/30 shadow-sm relative overflow-hidden backdrop-blur-xl z-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 dark:bg-amber-900/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold tracking-widest uppercase mb-3 border border-amber-200 dark:border-amber-800/50">
                  <Briefcase className="w-3 h-3" />
                  Career Radar
                </div>
                <h1 className="text-3xl md:text-[40px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Discover roles & companies.
                </h1>
              </div>

              <form onSubmit={handleSearch} className="relative z-10 w-full max-w-3xl flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search role, company, or skills (e.g. Java Spring)..."
                    className="w-full bg-[#F8FAFC] dark:bg-[#0A0F16] border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors shadow-inner"
                  />
                </div>
                <button 
                  type="submit" 
                  className="px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-colors shrink-0"
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
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-[#0A0F16] text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800'
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {internships.length > 0 ? `${internships.length} opportunities found` : 'Opportunities'}
                </h2>
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded">Sorted by Match</span>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                  <p className="text-sm text-slate-500 font-medium">Scanning career portals...</p>
                </div>
              ) : internships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {internships.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="bg-white dark:bg-[#111622]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full group hover:border-amber-300 dark:hover:border-amber-500/40 backdrop-blur-xl relative z-10"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${item.isCompanyDiscovery ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 group-hover:border-indigo-400' : 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 group-hover:border-teal-400'}`}>
                            <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.company}</div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {item.title}
                            </h3>
                          </div>
                        </div>
                        <button className="text-slate-300 hover:text-amber-500 dark:text-slate-600 dark:hover:text-amber-400 transition-colors">
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Card Body */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed flex-1">
                        {item.description}
                      </p>

                      {/* Metadata */}
                      {item.isCompanyDiscovery ? (
                        <div className="space-y-2 mb-6">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Company Tech Stack</div>
                          <div className="flex flex-wrap gap-1.5">
                            {(item.skills || []).slice(0, 5).map((sk, i) => (
                              <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-medium text-slate-600 dark:text-slate-300">{sk}</span>
                            ))}
                            {item.skills && item.skills.length > 5 && <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800/50 rounded text-[10px] font-medium text-slate-400">+{item.skills.length - 5}</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.location || 'Remote / Hybrid'}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                             {(item.requiredSkills || item.skills || []).slice(0, 3).map((sk, i) => (
                               <span key={i} className="px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-bold text-slate-500 uppercase">{sk}</span>
                             ))}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
                        <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest" title={item.matchReason}>
                          <Sparkles className="w-3 h-3" />
                          {item.matchScore}% Match
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1"
                        >
                          {item.isCompanyDiscovery ? 'View Company' : 'View Details'} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-[#111622]/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl z-10">
                  <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No opportunities found</h3>
                  <p className="text-sm text-slate-500 max-w-sm">Try adjusting your search terms or selecting a different skill to find roles.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InternshipAgent;
