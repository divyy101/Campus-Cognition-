import React, { useState } from 'react';
import { Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AIProviderSelector from './AIProviderSelector';

const Navbar = ({ title }) => {
  const { theme, toggleTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-[var(--navbar-bg)] border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 w-full md:pl-6 pl-16">
      
      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate">
          {title}
        </h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Global Search (Cmd+K mock) */}
        <div className={`hidden sm:flex items-center h-9 px-3 rounded-md border transition-colors ${
          searchFocused 
            ? 'border-[var(--accent)] bg-[var(--surface)] ring-2 ring-[var(--accent-soft)]' 
            : 'border-[var(--border)] bg-[var(--surface-sunken)] hover:border-[var(--border-strong)]'
        }`}>
          <Search className={`w-4 h-4 mr-2 ${searchFocused ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
          <input
            type="text"
            placeholder="Search... (⌘K)"
            className="bg-transparent border-none outline-none text-sm w-48 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <div className="h-5 w-px bg-[var(--border)] hidden sm:block mx-1" />

        {/* AI Provider Selector */}
        <AIProviderSelector />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)] transition-colors border border-transparent hover:border-[var(--border)]"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

      </div>
    </header>
  );
};

export default Navbar;
