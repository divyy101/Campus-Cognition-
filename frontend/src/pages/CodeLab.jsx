import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  Code2, 
  Terminal, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  FileCode2,
  Bug,
  Sparkles,
  Zap,
  Clock,
  MemoryStick
} from 'lucide-react';
import { CinematicReveal, FloatingVisual, AgentStatusIndicator } from '../components/cinematic/CinematicComponents';

const CodeLab = () => {
  const [code, setCode] = useState('// Initialize your cognitive code session\n\nfunction analyzePattern(data) {\n  // Agent is ready to review...\n  return data;\n}');
  const [language, setLanguage] = useState('javascript');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setResults(null);
    setError(null);

    try {
      const res = await api.post('/code/analyze', { code, language });
      if (res.data.success) {
        // Backend returns: { success, data: { bugs, warnings, explanation, timeComplexity, spaceComplexity, optimization, alternative, improvedCode } }
        setResults(res.data.data);
      } else {
        setError(res.data.message || 'Analysis failed.');
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      const msg = err.response?.data?.message || 'Connection lost to intelligence core.';
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e) => {
    // Tab support in textarea
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const totalIssues = results ? ((results.bugs?.length || 0) + (results.warnings?.length || 0)) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.8 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative z-10"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Navbar title="" />

        <main className="flex-1 px-6 md:px-12 py-8 max-w-[1800px] mx-auto w-full relative">
          
          {/* Cinematic Full-Screen Background */}
          <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-20">
             <FloatingVisual 
                src="/visuals/code-visual.jpg" 
                videoSrc="/visuals/code-visual-motion.mp4"
                alt="Code Intelligence"
                speed="slow"
                className="absolute inset-0 w-full h-full object-cover object-center"
             />
          </div>

          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left: Code Editor (7 cols) */}
            <CinematicReveal delay={0.1} className="xl:col-span-7 flex flex-col h-[calc(100vh-160px)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] flex items-center justify-center shadow-[0_0_15px_var(--cinematic-cyan)]">
                    <Code2 className="w-5 h-5 text-[var(--cinematic-cyan)]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold font-['Outfit']">Engineering Core</h1>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest mt-1 flex items-center gap-2">
                       IDE Active
                       <AgentStatusIndicator status={isAnalyzing ? 'analyzing' : 'active'} type="code" />
                    </p>
                  </div>
                </div>
                
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] focus:border-[var(--cinematic-cyan)] outline-none transition-colors"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <div className="flex-1 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] overflow-hidden flex flex-col relative shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
                {/* Editor Header */}
                <div className="px-4 py-3 bg-[var(--surface)] border-b border-[var(--border-subtle)] flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="ml-4 flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-main)] px-3 py-1 rounded-md">
                    <FileCode2 className="w-3.5 h-3.5" />
                    main.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp'}
                  </div>
                </div>

                {/* Textarea Code Input */}
                <div className="flex-1 relative font-mono text-sm">
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck="false"
                    className="absolute inset-0 w-full h-full bg-transparent text-[var(--text-primary)] p-6 resize-none outline-none leading-relaxed"
                    placeholder="// Paste your code here for intelligence review..."
                  />
                </div>

                {/* Editor Footer */}
                <div className="p-4 bg-[var(--surface)] border-t border-[var(--border-subtle)] flex justify-end">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !code.trim()}
                    className="px-6 py-2.5 rounded-xl bg-[var(--cinematic-cyan)] text-black font-bold text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2 shadow-[0_0_15px_var(--cinematic-cyan)]"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Run Intelligence
                      </>
                    )}
                  </button>
                </div>
              </div>
            </CinematicReveal>

            {/* Right: Analysis Results (5 cols) */}
            <CinematicReveal delay={0.3} className="xl:col-span-5 h-[calc(100vh-160px)] flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <Terminal className="w-5 h-5 text-[var(--text-secondary)]" />
                <h2 className="text-xl font-bold font-['Outfit']">Analysis Output</h2>
              </div>

              <div className="flex-1 semantic-card p-6 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {!results && !isAnalyzing && !error ? (
                    <motion.div 
                      key="idle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50"
                    >
                      <Terminal className="w-12 h-12 text-[var(--text-secondary)]" />
                      <p className="text-sm font-mono uppercase tracking-widest text-[var(--text-secondary)]">Awaiting code input...</p>
                    </motion.div>

                  ) : isAnalyzing ? (
                    <motion.div 
                      key="analyzing"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center space-y-6"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 border-2 border-[var(--border-strong)] rounded-full" />
                        <div className="absolute inset-0 border-t-2 border-[var(--cinematic-cyan)] rounded-full animate-spin" />
                        <Code2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[var(--cinematic-cyan)] animate-pulse" />
                      </div>
                      <p className="text-xs font-mono uppercase tracking-widest text-[var(--cinematic-cyan)] animate-pulse">Running Neural Review</p>
                    </motion.div>

                  ) : error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center space-y-4"
                    >
                      <AlertCircle className="w-12 h-12 text-red-500 opacity-60" />
                      <p className="text-sm text-red-400 text-center max-w-xs">{error}</p>
                      <button onClick={() => setError(null)} className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] underline">Dismiss</button>
                    </motion.div>

                  ) : results ? (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="space-y-5"
                    >
                      {/* Complexity Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-main)] flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                            <Clock className="w-3 h-3" /> Time
                          </div>
                          <div className="text-lg font-black font-['Outfit'] text-[var(--cinematic-cyan)]">{results.timeComplexity || 'N/A'}</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-main)] flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                            <MemoryStick className="w-3 h-3" /> Space
                          </div>
                          <div className="text-lg font-black font-['Outfit'] text-[var(--cinematic-cyan)]">{results.spaceComplexity || 'N/A'}</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-main)] flex flex-col gap-1">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Bugs</div>
                          <div className={`text-3xl font-black font-['Outfit'] ${results.bugs?.length > 0 ? 'text-red-400' : 'text-green-400'}`}>{results.bugs?.length || 0}</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-main)] flex flex-col gap-1">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Warnings</div>
                          <div className={`text-3xl font-black font-['Outfit'] ${results.warnings?.length > 0 ? 'text-yellow-400' : 'text-[var(--text-primary)]'}`}>{results.warnings?.length || 0}</div>
                        </div>
                      </div>

                      {/* Explanation */}
                      {results.explanation && (
                        <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--cinematic-cyan)]/30 shadow-[0_0_15px_rgba(53,214,232,0.05)]">
                          <div className="flex items-center gap-2 text-[var(--cinematic-cyan)] mb-3">
                            <Sparkles className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Intelligence Summary</h3>
                          </div>
                          <p className="text-sm leading-relaxed text-[var(--text-primary)]">{results.explanation}</p>
                        </div>
                      )}

                      {/* Bugs */}
                      {results.bugs && results.bugs.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                            <Bug className="w-3.5 h-3.5" /> Bugs Detected
                          </h3>
                          {results.bugs.map((bug, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 flex gap-3">
                              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                              <div>
                                {bug.line && <span className="text-[10px] font-mono text-[var(--text-secondary)] block mb-0.5">Line {bug.line} · {bug.type || 'Error'}</span>}
                                <p className="text-sm text-[var(--text-primary)]">{bug.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Warnings */}
                      {results.warnings && results.warnings.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-400 flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5" /> Warnings
                          </h3>
                          {results.warnings.map((warn, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex gap-3">
                              <Bug className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                              <div>
                                {warn.line && <span className="text-[10px] font-mono text-[var(--text-secondary)] block mb-0.5">Line {warn.line}</span>}
                                <p className="text-sm text-[var(--text-primary)]">{warn.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Optimization */}
                      {results.optimization && (
                        <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-strong)]">
                          <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2">
                            <Zap className="w-3.5 h-3.5 text-[var(--cinematic-cyan)]" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Optimization</h3>
                          </div>
                          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{results.optimization}</p>
                        </div>
                      )}

                      {/* Improved Code */}
                      {results.improvedCode && results.improvedCode !== code && (
                        <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--cinematic-cyan)]/20">
                          <div className="flex items-center gap-2 text-[var(--cinematic-cyan)] mb-3">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Optimized Code</h3>
                          </div>
                          <pre className="text-xs font-mono text-[var(--text-primary)] whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {results.improvedCode}
                          </pre>
                          <button
                            onClick={() => setCode(results.improvedCode)}
                            className="mt-3 text-xs font-bold text-[var(--cinematic-cyan)] uppercase tracking-widest hover:opacity-80 transition-opacity"
                          >
                            Apply to Editor →
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </CinematicReveal>

          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default CodeLab;
