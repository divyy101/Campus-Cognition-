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
    <div className="flex min-h-screen bg-transparent text-slate-100 font-sans selection:bg-emerald-500/30">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Code Lab — Neural Code Analysis & Optimization" />

        <main className="flex-1 p-6 md:px-8 md:py-6 space-y-6 overflow-y-auto">
          {/* Header Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-5 rounded-[24px] border border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
                  Code Inspector & Complexity Engine
                </h1>
                <p className="text-xs text-slate-400 mt-1">Multi-language code review, bug detection, and time/space complexity analysis</p>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="glass-input text-xs font-mono font-bold text-emerald-400 rounded-2xl px-4 py-3 flex-1 sm:flex-none [&>option]:bg-slate-900"
              >
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
              </select>

              <button
                onClick={handleAnalyze}
                disabled={scanning}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 disabled:opacity-50 shrink-0 group"
              >
                {scanning ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    Scanning
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
                    Run Review
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Main Grid: Code Editor on Left, Analysis on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Interactive Code Editor */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative rounded-[32px] glass-card border border-white/5 overflow-hidden flex flex-col h-[600px] shadow-2xl"
            >
              {/* Terminal Window Header */}
              <div className="px-5 py-4 bg-black/40 border-b border-white/5 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 ml-3 font-bold uppercase tracking-widest">{language} editor</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ready
                </span>
              </div>

              {/* Green Scanning Beam Animation overlay during scan */}
              {scanning && (
                <div className="absolute inset-x-0 top-14 bottom-0 pointer-events-none z-10 overflow-hidden">
                  <div className="w-full h-[2px] bg-emerald-400 shadow-[0_0_15px_2px_rgba(16,185,129,0.5)] animate-scan" />
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent animate-scan-overlay" />
                </div>
              )}

              {/* Code Textarea */}
              <div className="flex-1 relative bg-[#090D16]/80 backdrop-blur-xl">
                {/* Line numbers mock (visual only for premium feel) */}
                <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-white/5 bg-black/20 flex flex-col items-end py-4 pr-3 pointer-events-none select-none text-[10px] font-mono text-slate-600">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <span key={i} className="leading-relaxed opacity-50">{i + 1}</span>
                  ))}
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste code snippet here..."
                  className="absolute inset-0 w-full h-full bg-transparent pl-16 pr-4 py-4 font-mono text-[13px] text-emerald-50 resize-none focus:outline-none leading-relaxed custom-scrollbar selection:bg-emerald-500/30"
                  spellCheck="false"
                />
              </div>
            </motion.div>

            {/* Right: Analysis Results */}
            <div className="space-y-6">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Complexity Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-[24px] glass-card border border-white/5 flex items-center gap-4 group hover:bg-white/5 transition-colors">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition-transform">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                        <p className="text-xl font-mono font-black text-indigo-400 mt-0.5">{result.timeComplexity}</p>
                      </div>
                    </div>

                    <div className="p-5 rounded-[24px] glass-card border border-white/5 flex items-center gap-4 group hover:bg-white/5 transition-colors">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Space</p>
                        <p className="text-xl font-mono font-black text-emerald-400 mt-0.5">{result.spaceComplexity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bugs & Warnings */}
                  <div className="p-6 rounded-[24px] glass-card border border-white/5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 tracking-wide">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Bugs & Warnings
                    </h3>
                    {result.bugs && result.bugs.length > 0 ? (
                      <div className="space-y-3">
                        {result.bugs.map((b, i) => (
                          <div key={i} className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{b.message || b}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-xs text-emerald-400 font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          No critical syntax bugs detected!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Explanation & Optimization */}
                  <div className="p-6 rounded-[24px] glass-card border border-white/5 space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Code Explanation
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/5">{result.explanation}</p>
                    </div>

                    {result.optimization && (
                      <div>
                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Zap className="w-3 h-3" />
                          Optimization Notes
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/5">{result.optimization}</p>
                      </div>
                    )}
                  </div>

                  {/* Improved Code Snippet */}
                  {result.improvedCode && (
                    <div className="p-6 rounded-[24px] glass-card border border-emerald-500/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
                      <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center justify-between relative z-10">
                        <span>Optimized Solution</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(result.improvedCode)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Code
                        </button>
                      </h3>
                      <div className="relative z-10 rounded-2xl bg-[#090D16]/80 border border-white/5 p-4 overflow-x-auto custom-scrollbar">
                        <pre className="font-mono text-[11px] text-emerald-300 leading-relaxed">
                          {result.improvedCode}
                        </pre>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-[600px] rounded-[32px] glass-card border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 relative group">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
                    <Code2 className="w-8 h-8 text-emerald-400 relative z-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Neural Inspector Ready</h3>
                  <p className="text-sm text-slate-400 max-w-sm mt-3 leading-relaxed">
                    Click "Run Review" to analyze time/space complexity, find edge cases, and view optimized code.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CodeLab;
