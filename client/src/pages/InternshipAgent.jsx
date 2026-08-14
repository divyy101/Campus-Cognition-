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
    <div className="flex min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-cyan-900/20 text-slate-100 font-sans selection:bg-cyan-500/30">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Internship Agent — MNC & University Careers" />

        <main className="flex-1 p-6 md:px-8 md:py-6 space-y-6 overflow-y-auto">
          {/* Header Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[32px] glass-card p-8 border border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">Live Corporate & Research Careers</span>
                <h1 className="text-3xl font-black text-white mt-2 tracking-tight">Software & Technical Internships</h1>
                <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
                  Search active student programs, summer co-ops, and research internships at premier MNCs & government portals.
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
                    placeholder="Search company or role..."
                    className="w-full glass-input rounded-2xl pl-12 pr-4 py-3.5 text-xs placeholder-slate-500"
                  />
                </div>
                <button type="submit" className="px-6 py-3.5 rounded-2xl glass-button text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 group">
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Search
                </button>
              </form>
            </div>

            {/* Skill Chips */}
            <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Filter by Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {SKILL_CHIPS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillClick(skill)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                      selectedSkill === skill
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Cards Grid */}
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Searching live databases...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {internships.map((item, idx) => (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 rounded-[32px] glass-card border border-white/5 hover:bg-white/5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                            <Building className="w-3.5 h-3.5 text-violet-400" />
                          </div>
                          <span className="font-bold text-xs text-violet-400">{item.company}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white leading-tight group-hover:text-violet-300 transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        {item.matchScore}% Fit
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-4 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-5 pt-5 border-t border-white/5 space-y-3">
                      <div className="flex items-center gap-3 text-xs text-slate-300">
                        <div className="w-6 h-6 rounded-md bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
                          <MapPin className="w-3 h-3 text-rose-400" />
                        </div>
                        <span className="font-medium">{item.location || 'Remote / India'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-300">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                          <DollarSign className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="font-medium">{item.stipend || 'Provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-1 rounded-lg bg-black/20">{item.source}</span>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 font-bold text-xs flex items-center gap-2 border border-violet-500/30 transition-colors group/btn"
                    >
                      Apply Now
                      <ExternalLink className="w-3.5 h-3.5 group-hover/btn:scale-110 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InternshipAgent;
