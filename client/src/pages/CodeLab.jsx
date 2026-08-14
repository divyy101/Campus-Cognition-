import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  Code2, 
  Play, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Clock, 
  HardDrive,
  Copy,
  Sparkles
} from 'lucide-react';

const CodeLab = () => {
  const [code, setCode] = useState(`public class Solution {\n    public static void main(String[] args) {\n        int[] nums = {1, 2, 3, 4, 5};\n        for(int i = 0; i < nums.length; i++) {\n            System.out.println("Item: " + nums[i]);\n        }\n    }\n}`);
  const [language, setLanguage] = useState('java');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Please paste or type code before running analysis.');
      return;
    }

    setScanning(true);
    setResult(null);

    try {
      const res = await api.post('/code/analyze', { code, language });
      if (res.data.success) {
        setResult(res.data.data);
      } else {
        setError(res.data.message || 'Code analysis could not be completed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error executing AI code review.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#090A12] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Code Lab" />

        <main className="flex-1 p-2 md:p-4 flex flex-col">
          
          {/* Top Navbar for IDE */}
          <div className="flex items-center justify-between mb-2 bg-white dark:bg-[#11121C] p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4 px-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400 dark:bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500/80" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Neural IDE</span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-100 dark:bg-[#0D0F17] text-xs font-mono font-bold text-violet-600 dark:text-violet-400 rounded-md px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
              </select>

              <button
                onClick={handleAnalyze}
                disabled={scanning}
                className="px-4 py-1.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                {scanning ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
                Run & Inspect
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* IDE Layout (3 Panels) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 h-full min-h-[600px]">
            
            {/* Panel 1: Explorer (Hidden on small screens) */}
            <div className="hidden lg:flex lg:col-span-2 bg-white dark:bg-[#11121C] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-col">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Explorer
              </div>
              <div className="p-2 space-y-1">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 cursor-pointer text-xs font-mono">
                  <Code2 className="w-3.5 h-3.5" />
                  solution.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'java'}
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer text-xs font-mono transition-colors">
                  <Code2 className="w-3.5 h-3.5" />
                  utils.test
                </div>
              </div>
            </div>

            {/* Panel 2: Code Editor */}
            <div className="lg:col-span-7 bg-[#F1F5F9] dark:bg-[#0D0F17] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden">
              <div className="flex items-center px-2 pt-2 bg-white dark:bg-[#11121C] border-b border-slate-200 dark:border-slate-800">
                <div className="px-4 py-2 border-t-2 border-t-violet-500 bg-[#F1F5F9] dark:bg-[#0D0F17] text-xs font-mono font-medium text-slate-700 dark:text-slate-300 rounded-t-md">
                  solution.{language}
                </div>
              </div>

              {/* Scanning Overlay */}
              {scanning && (
                <div className="absolute inset-0 top-10 pointer-events-none z-10 overflow-hidden">
                  <div className="w-full h-0.5 bg-violet-500 shadow-[0_0_10px_2px_rgba(124,58,237,0.5)] animate-scan" />
                  <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent animate-scan-overlay" />
                </div>
              )}

              <div className="flex-1 relative flex">
                {/* Line Numbers */}
                <div className="w-12 bg-[#F1F5F9] dark:bg-[#0D0F17] border-r border-slate-200 dark:border-slate-800/50 flex flex-col items-end py-4 pr-3 pointer-events-none select-none text-[11px] font-mono text-slate-400">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <span key={i} className="leading-6 opacity-70">{i + 1}</span>
                  ))}
                </div>
                {/* Editor Textarea */}
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste or write your code here..."
                  className="flex-1 w-full bg-transparent p-4 font-mono text-[13px] leading-6 text-slate-800 dark:text-slate-200 resize-none focus:outline-none custom-scrollbar selection:bg-violet-200 dark:selection:bg-violet-900/50"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* Panel 3: AI Inspector */}
            <div className="lg:col-span-3 bg-white dark:bg-[#11121C] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 bg-slate-50 dark:bg-[#11121C]">
                <Sparkles className="w-3 h-3 text-violet-500" />
                AI Inspector
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {!result && !scanning ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                    <Terminal className="w-8 h-8 text-slate-400" />
                    <p className="text-xs text-slate-500 font-medium px-4">Run the inspector to analyze time/space complexity and detect potential bugs.</p>
                  </div>
                ) : scanning ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-100 dark:bg-white/5 rounded animate-pulse w-3/4" />
                    <div className="h-16 bg-slate-100 dark:bg-white/5 rounded animate-pulse w-full" />
                    <div className="h-16 bg-slate-100 dark:bg-white/5 rounded animate-pulse w-full" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Complexity */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0D0F17] border border-slate-100 dark:border-slate-800">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time</div>
                        <div className="text-sm font-mono font-bold text-violet-600 dark:text-violet-400">{result.timeComplexity}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0D0F17] border border-slate-100 dark:border-slate-800">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Space</div>
                        <div className="text-sm font-mono font-bold text-pink-600 dark:text-pink-400">{result.spaceComplexity}</div>
                      </div>
                    </div>

                    {/* Bugs */}
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Errors
                      </h4>
                      {result.bugs && result.bugs.length > 0 ? (
                        <div className="space-y-2">
                          {result.bugs.map((b, i) => (
                            <div key={i} className="px-3 py-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-xs text-red-700 dark:text-red-400">
                              {b.message || b}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-3 py-2 rounded-md bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> No critical bugs found.
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Code2 className="w-3 h-3 text-violet-500" /> Explanation
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0D0F17] p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        {result.explanation}
                      </p>
                    </div>

                    {/* Suggested Optimization */}
                    {result.improvedCode && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-500" /> Optimized Code</span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(result.improvedCode)}
                            className="text-violet-600 dark:text-violet-400 hover:underline"
                          >
                            Copy
                          </button>
                        </h4>
                        <div className="bg-[#1E293B] dark:bg-[#0D0F17] p-3 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
                          <pre className="font-mono text-[10px] text-emerald-400">
                            {result.improvedCode}
                          </pre>
                        </div>
                      </div>
                    )}
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

export default CodeLab;
