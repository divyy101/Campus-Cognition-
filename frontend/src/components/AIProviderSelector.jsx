import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Cpu, Sparkles } from 'lucide-react';

const AIProviderSelector = ({ className = '' }) => {
  const { aiEngine, setAiEngine } = useAuth();

  return (
    <div className={`flex items-center gap-1 bg-[var(--surface-sunken)] p-1 rounded-lg border border-[var(--border)] ${className}`}>
      <span className="text-[11px] font-semibold text-[var(--text-muted)] px-2 uppercase tracking-wide flex items-center gap-1">
        <Cpu className="w-3 h-3 text-[var(--accent)]" />
        Neural Engine:
      </span>

      <button
        type="button"
        onClick={() => setAiEngine('campus_ai')}
        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
          aiEngine === 'campus_ai'
            ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        Grok
      </button>

      <button
        type="button"
        onClick={() => setAiEngine('gemini')}
        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
          aiEngine === 'gemini'
            ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Cpu className="w-3.5 h-3.5" />
        Gemini 1.5
      </button>

      <button
        type="button"
        onClick={() => setAiEngine('openai')}
        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
          aiEngine === 'openai'
            ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        OpenAI
      </button>
    </div>
  );
};

export default AIProviderSelector;
