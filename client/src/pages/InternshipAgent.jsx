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
    <div className="flex min-h-screen bg-[#FFFDF8] dark:bg-[#130C08] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Career Radar" />

        <main className="flex-1 p-6 md:px-8 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header & Search Area */}
            <div className="flex flex-col gap-6 bg-white dark:bg-[#21140D] p-6 sm:p-8 rounded-2xl border border-orange-100 dark:border-orange-900/30 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 dark:bg-orange-900/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold tracking-widest uppercase mb-3 border border-orange-200 dark:border-orange-800/50">
                  <Briefcase className="w-3 h-3" />
                  Opportunities
                </div>
                <h1 className="text-3xl md:text-[40px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Find your next internship.
                </h1>
              </div>

              <form onSubmit={handleSearch} className="relative z-10 w-full max-w-3xl flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search role, company or skill..."
                    className="w-full bg-[#FFFDF8] dark:bg-[#130C08] border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 transition-colors shadow-inner"
                  />
                </div>
                <button 
                  type="submit" 
                  className="px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-bold text-sm shadow-sm transition-colors shrink-0"
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
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-50 dark:bg-[#130C08] text-slate-600 dark:text-slate-300 hover:bg-orange-100 dark:hover:bg-white/5 border border-orange-100 dark:border-slate-800'
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
                      className="bg-white dark:bg-[#21140D] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group hover:border-orange-200 dark:hover:border-orange-500/30"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-[#130C08] flex items-center justify-center border border-orange-100 dark:border-slate-800 group-hover:border-orange-300 transition-colors">
                            <Building className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.company}</div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
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
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.location || 'Remote / Hybrid'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.stipend || 'Competitive Stipend'}</span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                          <Sparkles className="w-3 h-3" />
                          {item.matchScore}% Match
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1"
                        >
                          View Details <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-[#21140D] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
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
