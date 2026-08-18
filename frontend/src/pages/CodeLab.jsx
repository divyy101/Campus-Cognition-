import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  FileCode2,
  Activity
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative overflow-hidden z-10"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 z-10 h-screen overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Navbar title="" />

        <main className="flex-1 p-4 md:p-6 flex flex-col max-w-[1800px] mx-auto w-full">
          
          {/* Top Navbar for IDE */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-4 z-10 relative overflow-hidden">
            <div className="flex items-center gap-4 px-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[var(--accent)]" />
                <span className="text-sm font-bold tracking-wide">Code Intelligence</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 sm:mt-0 relative z-10 w-full sm:w-auto">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[var(--surface-elevated)] text-xs font-mono font-bold text-white rounded-xl px-4 py-2.5 border border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer min-w-[120px]"
              >
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
              </select>

              <button
                onClick={handleAnalyze}
                disabled={scanning}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg-main)] hover:brightness-110 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {scanning ? (
                  <span className="w-4 h-4 border-2 border-[var(--bg-main)]/30 border-t-[var(--bg-main)] rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Analyze Code
                  </>
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* IDE Layout (3 Panels) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[70vh]">
            
            {/* Panel 1: Explorer */}
            <div className="hidden lg:flex lg:col-span-2 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl flex-col relative z-10">
              <div className="px-5 py-4 border-b border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <FileCode2 className="w-3.5 h-3.5" /> Workspace
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] cursor-pointer text-xs font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  solution.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'java'}
                </div>
              </div>
            </div>

            {/* Panel 2: Code Editor */}
            <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl flex flex-col relative overflow-hidden z-10">
              <div className="flex items-center px-2 pt-2 bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)]">
                <div className="px-6 py-3 border-t-2 border-t-[var(--accent)] bg-[var(--surface)] text-xs font-mono font-bold rounded-t-lg">
                  solution.{language}
                </div>
              </div>

              <div className="flex-1 relative flex bg-[#03080A]/60">
                {/* Line Numbers */}
                <div className="w-14 border-r border-[var(--border-subtle)] flex flex-col items-end py-6 pr-4 pointer-events-none select-none text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--surface-elevated)]/30">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <span key={i} className="leading-7 opacity-50">{i + 1}</span>
                  ))}
                </div>
                {/* Editor Textarea */}
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here for analysis..."
                  className="flex-1 w-full bg-transparent p-6 font-mono text-[14px] leading-7 text-[#E2E8F0] resize-none focus:outline-none custom-scrollbar selection:bg-[var(--accent)]/30 placeholder:text-[var(--text-secondary)]/50"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* Panel 3: AI Inspector */}
            <div className="lg:col-span-3 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl flex flex-col overflow-hidden relative z-10">
              <div className="px-5 py-4 border-b border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[var(--accent)]" />
                  Analysis Output
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[var(--surface-elevated)]/30">
                <AnimatePresence mode="wait">
                  {!result && !scanning ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50"
                    >
                      <Terminal className="w-8 h-8 text-[var(--text-secondary)]" />
                      <p className="text-xs text-[var(--text-secondary)] font-medium px-4 leading-relaxed">
                        Ready to analyze. Click 'Analyze Code' to detect bugs and optimize performance.
                      </p>
                    </motion.div>
                  ) : scanning ? (
                    <motion.div 
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 text-[var(--accent)] text-xs font-mono font-bold">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                        Analyzing...
                      </div>
                      <div className="h-16 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl w-full animate-pulse" />
                      <div className="h-24 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl w-full animate-pulse" />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      
                      {/* Complexity */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            Time
                          </div>
                          <div className="text-lg font-mono font-bold text-[var(--accent)]">{result.timeComplexity}</div>
                        </div>
                        <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            Space
                          </div>
                          <div className="text-lg font-mono font-bold text-[var(--accent)]">{result.spaceComplexity}</div>
                        </div>
                      </div>

                      {/* Bugs */}
                      <div>
                        <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${result.bugs?.length > 0 ? 'text-red-500' : 'text-[var(--accent)]'}`} /> 
                          Issues Detected
                        </h4>
                        {result.bugs && result.bugs.length > 0 ? (
                          <div className="space-y-3">
                            {result.bugs.map((b, i) => (
                              <div key={i} className="px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-medium leading-relaxed">
                                {b.message || b}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-5 py-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs flex items-start gap-3 leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">No issues found.</span> The logic appears sound and secure.
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Explanation */}
                      <div>
                        <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-[var(--text-secondary)]" /> Analysis
                        </h4>
                        <div className="text-[13px] text-[var(--text-primary)] leading-loose bg-[var(--surface-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl">
                          {result.explanation}
                        </div>
                      </div>

                      {/* Suggested Optimization */}
                      {result.improvedCode && (
                        <div>
                          <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-[var(--accent)]" /> Improved Code</span>
                            <button 
                              onClick={() => navigator.clipboard.writeText(result.improvedCode)}
                              className="text-xs font-bold text-[var(--accent)] hover:brightness-110"
                            >
                              Copy
                            </button>
                          </h4>
                          <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl overflow-x-auto">
                            <pre className="font-mono text-[12px] leading-relaxed text-[#E2E8F0]">
                              {result.improvedCode.split('\n').map((line, i) => (
                                <div key={i} className="flex">
                                  <span className="text-[var(--text-secondary)]/50 w-6 shrink-0 select-none">{i+1}</span>
                                  <span>{line}</span>
                                </div>
                              ))}
                            </pre>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default CodeLab;
