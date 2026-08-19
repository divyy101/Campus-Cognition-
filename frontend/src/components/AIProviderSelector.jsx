import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Cpu, Sparkles } from 'lucide-react';

const AIProviderSelector = ({ className = '' }) => {
  const { aiEngine, setAiEngine } = useAuth();

  return (
    <div className={`flex items-center gap-2 bg-[var(--surface-elevated)] p-1.5 rounded-xl border border-[var(--border)] ${className}`}>
      <span className="text-xs font-semibold text-[var(--text-secondary)] px-2 flex items-center gap-1">
        <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" />
        Neural Engine:
      </span>

      <button
        type="button"
        onClick={() => setAiEngine('campus_ai')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
          aiEngine === 'campus_ai'
            ? 'bg-[var(--accent)] text-[var(--bg-main)] shadow-glow'
            : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        Grok
      </button>

      <button
        type="button"
        onClick={() => setAiEngine('gemini')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
          aiEngine === 'gemini'
            ? 'bg-[var(--accent)] text-[var(--bg-main)] shadow-glow'
            : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Cpu className="w-3.5 h-3.5" />
        Gemini 1.5
      </button>

      <button
        type="button"
        onClick={() => setAiEngine('openai')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
          aiEngine === 'openai'
            ? 'bg-[var(--accent)] text-[var(--bg-main)] shadow-glow'
            : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        OpenAI
      </button>
    </div>
  );
};

export default AIProviderSelector;
