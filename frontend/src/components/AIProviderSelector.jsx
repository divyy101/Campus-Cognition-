import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Cpu, Sparkles } from 'lucide-react';

const AIProviderSelector = ({ className = '' }) => {
  const { aiEngine, setAiEngine } = useAuth();

  return (
    <div className={`flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
        <Cpu className="w-3.5 h-3.5 text-indigo-500" />
        Neural Engine:
      </span>

      <button
        type="button"
        onClick={() => setAiEngine('campus_ai')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
          aiEngine === 'campus_ai'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        OpenAI
      </button>
    </div>
  );
};

export default AIProviderSelector;
