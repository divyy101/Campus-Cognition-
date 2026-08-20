import React, { useState, useRef } from 'react';
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
import { StatusDot } from '../components/cinematic/CinematicComponents';

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

  return (
    <div className="flex min-h-[100dvh] bg-[var(--bg)]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Navbar title="Code Lab" />

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-[1800px] mx-auto w-full">
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left: Code Editor (7 cols) */}
            <div className="xl:col-span-7 flex flex-col h-[calc(100dvh-140px)] min-h-[600px]">
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--warning-soft)] flex items-center justify-center">
                    <Code2 className="w-6 h-6 text-[var(--warning)]" />
                  </div>
                  <div>
                    <h1 className="cc-h2">Engineering Core</h1>
                    <div className="flex items-center gap-2 mt-1">
                       <StatusDot status={isAnalyzing ? 'analyzing' : 'active'} />
                       <span className="cc-caption uppercase tracking-wide">IDE Active</span>
                    </div>
                  </div>
                </div>
                
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="cc-input py-2 px-3 text-sm font-semibold uppercase tracking-wider"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <div className="flex-1 cc-card overflow-hidden flex flex-col relative shadow-sm">
                
                {/* Editor Header */}
                <div className="px-4 py-3 bg-[var(--surface-sunken)] border-b border-[var(--border)] flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="ml-4 flex items-center gap-2 text-xs font-mono font-medium text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 rounded-md">
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
                    className="absolute inset-0 w-full h-full bg-[var(--surface)] text-[var(--text-primary)] p-6 resize-none outline-none leading-relaxed"
                    placeholder="// Paste your code here for intelligence review..."
                  />
                </div>

                {/* Editor Footer */}
                <div className="p-4 bg-[var(--surface-sunken)] border-t border-[var(--border)] flex justify-end">
                  <button
                    onClick={() => {
                      const instructions = `

/*
IMPORTANT INSTRUCTIONS FOR THE AI:
Analyze the code.
Is it correct? Is it already optimal?
Can time/space complexity, readability, or memory usage be improved?
If it can be improved, provide the improved code.
If not, state: "Your solution is already asymptotically optimal. No meaningful time/space optimization is available. I recommend keeping the current implementation." and DO NOT provide improved code.
Make sure to explain why it is better, or why not. Base your optimization on ${language} specific best practices.
*/`;
                      const originalCode = code;
                      setCode(originalCode); // Ensure editor stays the same
                      const finalCode = originalCode + instructions;
                      
                      setIsAnalyzing(true);
                      setResults(null);
                      setError(null);
                  
                      api.post('/code/analyze', { code: finalCode, language })
                        .then(res => {
                          if (res.data.success) {
                            const data = res.data.data;
                            if (data.improvedCode) {
                              data.improvedCode = data.improvedCode.replace(instructions, '');
                              // If it defaults to the exact original code, just set it to originalCode
                              if (data.improvedCode.trim() === finalCode.trim() || data.improvedCode.trim() === originalCode.trim()) {
                                data.improvedCode = originalCode;
                              }
                            }
                            setResults(data);
                          } else {
                            setError(res.data.message || 'Analysis failed.');
                          }
                        })
                        .catch(err => {
                          setError(err.response?.data?.message || 'Connection lost to intelligence core.');
                        })
                        .finally(() => setIsAnalyzing(false));
                    }}
                    disabled={isAnalyzing || !code.trim()}
                    style={{
                      background: 'var(--accent)',
                      color: '#FFFFFF',
                      border: '1px solid var(--accent)',
                      opacity: isAnalyzing || !code.trim() ? 0.5 : 1,
                      cursor: isAnalyzing || !code.trim() ? 'not-allowed' : 'pointer',
                    }}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm transition-colors hover:brightness-90 flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Intelligence
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Analysis Results (5 cols) */}
            <div className="xl:col-span-5 h-[calc(100dvh-140px)] min-h-[600px] flex flex-col">
              <div className="flex items-center gap-2 mb-6 h-12">
                <Terminal className="w-5 h-5 text-[var(--text-muted)]" />
                <h2 className="cc-h2">Analysis Output</h2>
              </div>

              <div className="flex-1 cc-card p-6 overflow-y-auto custom-scrollbar bg-[var(--surface-sunken)]">
                <AnimatePresence mode="wait">
                  {!results && !isAnalyzing && !error ? (
                    <motion.div 
                      key="idle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-4 text-[var(--text-muted)]"
                    >
                      <Terminal className="w-12 h-12 opacity-50" />
                      <p className="text-sm font-mono uppercase tracking-widest">Awaiting code input...</p>
                    </motion.div>

                  ) : isAnalyzing ? (
                    <motion.div 
                      key="analyzing"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center space-y-6"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 border-2 border-[var(--border-strong)] rounded-full" />
                        <div className="absolute inset-0 border-t-2 border-[var(--warning)] rounded-full animate-spin" />
                        <Code2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[var(--warning)] animate-pulse" />
                      </div>
                      <p className="text-xs font-mono uppercase tracking-widest text-[var(--warning)] animate-pulse">Running Neural Review</p>
                    </motion.div>

                  ) : error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center space-y-4"
                    >
                      <AlertCircle className="w-12 h-12 text-[var(--danger)] opacity-80" />
                      <p className="text-sm text-[var(--danger)] text-center max-w-xs">{error}</p>
                      <button onClick={() => setError(null)} className="cc-btn-ghost text-xs">Dismiss</button>
                    </motion.div>

                  ) : results ? (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Complexity Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="cc-card p-4 flex flex-col gap-1.5 shadow-sm">
                          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                            <Clock className="w-3.5 h-3.5" /> Time
                          </div>
                          <div className="text-xl font-bold font-mono text-[var(--warning)]">{results.timeComplexity || 'N/A'}</div>
                        </div>
                        <div className="cc-card p-4 flex flex-col gap-1.5 shadow-sm">
                          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                            <MemoryStick className="w-3.5 h-3.5" /> Space
                          </div>
                          <div className="text-xl font-bold font-mono text-[var(--warning)]">{results.spaceComplexity || 'N/A'}</div>
                        </div>
                        <div className="cc-card p-4 flex flex-col gap-1.5 shadow-sm">
                          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Bugs</div>
                          <div className={`text-2xl font-bold ${results.bugs?.length > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>{results.bugs?.length || 0}</div>
                        </div>
                        <div className="cc-card p-4 flex flex-col gap-1.5 shadow-sm">
                          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Warnings</div>
                          <div className={`text-2xl font-bold ${results.warnings?.length > 0 ? 'text-amber-500' : 'text-[var(--text-primary)]'}`}>{results.warnings?.length || 0}</div>
                        </div>
                      </div>

                      {/* Explanation */}
                      {results.explanation && (
                        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                          <div className="flex items-center gap-2 text-[var(--warning)] mb-3">
                            <Sparkles className="w-4 h-4" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Intelligence Summary</h3>
                          </div>
                          <p className="cc-body">{results.explanation}</p>
                        </div>
                      )}

                      {/* Bugs */}
                      {results.bugs && results.bugs.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--danger)] flex items-center gap-2">
                            <Bug className="w-4 h-4" /> Bugs Detected
                          </h3>
                          {results.bugs.map((bug, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] flex gap-3">
                              <AlertCircle className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
                              <div>
                                {bug.line && <span className="text-xs font-mono text-[var(--danger)] block mb-1 font-semibold">Line {bug.line} · {bug.type || 'Error'}</span>}
                                <p className="text-sm text-[var(--danger)]">{bug.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Warnings */}
                      {results.warnings && results.warnings.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Warnings
                          </h3>
                          {results.warnings.map((warn, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex gap-3">
                              <Bug className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                {warn.line && <span className="text-xs font-mono text-amber-600 dark:text-amber-400 block mb-1 font-semibold">Line {warn.line}</span>}
                                <p className="text-sm text-amber-700 dark:text-amber-300">{warn.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Optimization */}
                      {results.optimization && (
                        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                          <div className="flex items-center gap-2 text-[var(--warning)] mb-3">
                            <Zap className="w-4 h-4" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Optimization</h3>
                          </div>
                          <p className="cc-body">{results.optimization}</p>
                        </div>
                      )}

                      {/* Improved Code */}
                      {results.improvedCode && results.improvedCode !== code && (
                        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                          <div className="flex items-center gap-2 text-[var(--success)] mb-4">
                            <CheckCircle2 className="w-4 h-4" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Optimized Code</h3>
                          </div>
                          <pre className="text-sm font-mono text-[var(--text-primary)] whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar bg-[var(--surface-sunken)] p-4 rounded-lg border border-[var(--border)]">
                            {results.improvedCode}
                          </pre>
                          <button
                            onClick={() => setCode(results.improvedCode)}
                            className="mt-4 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors flex items-center gap-1"
                          >
                            Apply to Editor <Play className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CodeLab;
