import React, { useState, useEffect } from 'react';
import AIProviderSelector from './AIProviderSelector';
import { Search, Command, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ title = 'Workspace' }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Handle Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="h-20 glass-panel mx-4 mt-4 rounded-3xl px-8 flex items-center justify-between sticky top-4 z-30 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <h2 className="font-extrabold text-xl text-[var(--text-primary)] tracking-tight hidden md:block">{title}</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Global Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-4 bg-[var(--surface-elevated)] hover:bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl px-4 py-2.5 transition-all duration-300 shadow-sm group"
          >
            <div className="flex items-center gap-2 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              <Search className="w-4 h-4 transition-colors" />
              <span className="text-xs font-semibold">Search intelligence...</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--border-subtle)] px-2 py-1 rounded-lg">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>
          
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-3 rounded-2xl bg-[var(--surface-elevated)] hover:bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-[var(--surface-elevated)] hover:bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Neural Engine Switcher */}
          <div className="hidden sm:block">
            <AIProviderSelector />
          </div>
        </div>
      </motion.header>

      {/* Global Search Modal Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-[var(--bg-main)]/80 backdrop-blur-md flex items-start justify-center pt-[10vh]"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-[24px] shadow-2xl overflow-hidden mx-4"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-subtle)]">
                <Search className="w-5 h-5 text-[var(--accent)] shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search companies, scholarships, internships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)] text-sm font-medium"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--border-subtle)] px-2 py-1 rounded-lg hover:bg-[var(--border-strong)]"
                >
                  ESC
                </button>
              </div>

              {/* Mock Search Results Content */}
              <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {!searchQuery ? (
                  <div className="py-8 text-center text-[var(--text-secondary)] flex flex-col items-center justify-center">
                    <Command className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">Type to start searching</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Suggestions</div>
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--surface)] text-sm text-[var(--text-primary)] flex items-center gap-3 group transition-colors">
                      <Search className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
                      Google Internships 2025
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--surface)] text-sm text-[var(--text-primary)] flex items-center gap-3 group transition-colors">
                      <Search className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
                      NVIDIA Research Fellowships
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--surface)] text-sm text-[var(--text-primary)] flex items-center gap-3 group transition-colors">
                      <Search className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
                      Women in Engineering Scholarships
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
