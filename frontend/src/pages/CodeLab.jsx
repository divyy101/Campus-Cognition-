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
  Sparkles
} from 'lucide-react';
import { CinematicReveal, FloatingVisual, AgentStatusIndicator } from '../components/cinematic/CinematicComponents';

const CodeLab = () => {
  const [code, setCode] = useState('// Initialize your cognitive code session\n\nfunction analyzePattern(data) {\n  // Agent is ready to review...\n  return data;\n}');
  const [language, setLanguage] = useState('javascript');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const textareaRef = useRef(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setResults(null);

    try {
      const res = await api.post('/code/analyze', { code, language });
      if (res.data.success) {
        setResults(res.data.data.analysis);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setResults({
        summary: "Analysis failed due to server error.",
        issues: [{ type: "error", message: "Connection lost to intelligence core.", line: 0 }]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.8 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative z-10"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-y-auto custom-scrollbar">
        <Navbar title="" />

        <main className="flex-1 px-6 md:px-12 py-8 max-w-[1800px] mx-auto w-full relative">
          
          {/* Visual Anchor Background (CodeLab) */}
          <div className="absolute top-0 right-0 w-[40%] h-[70vh] opacity-20 pointer-events-none mask-image-left z-0 mix-blend-screen">
             <FloatingVisual 
                src="/visuals/code-visual.jpg" 
                alt="Code Intelligence"
                speed="slow"
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
                    spellCheck="false"
                    className="absolute inset-0 w-full h-full bg-transparent text-[var(--text-primary)] p-6 resize-none outline-none leading-relaxed"
                    placeholder="// Paste your code here for intelligence review..."
                  />
                  {/* Subtle Grid overlay for editor */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMSkiLz48L3N2Zz4=')] bg-[length:40px_40px]" />
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
                  {!results && !isAnalyzing ? (
                    <motion.div 
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
                  ) : (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Summary */}
                      <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--cinematic-cyan)]/30 shadow-[0_0_15px_rgba(53,214,232,0.1)]">
                        <div className="flex items-center gap-2 text-[var(--cinematic-cyan)] mb-2">
                          <Sparkles className="w-4 h-4" />
                          <h3 className="text-xs font-bold uppercase tracking-widest">Intelligence Summary</h3>
                        </div>
                        <p className="text-sm leading-relaxed">{results.summary}</p>
                      </div>

                      {/* Metrics/Score (Mocked for visual) */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-main)]">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Quality Score</div>
                          <div className="text-3xl font-black font-['Outfit'] text-[var(--success)]">92<span className="text-sm text-[var(--text-secondary)]">/100</span></div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-main)]">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Issues Found</div>
                          <div className="text-3xl font-black font-['Outfit']">{results.issues?.length || 0}</div>
                        </div>
                      </div>

                      {/* Issues List */}
                      {results.issues && results.issues.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-4">Detailed Findings</h3>
                          {results.issues.map((issue, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border flex gap-4 ${
                              issue.type === 'error' ? 'bg-red-500/5 border-red-500/20' :
                              issue.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' :
                              'bg-[var(--cinematic-cyan)]/5 border-[var(--cinematic-cyan)]/20'
                            }`}>
                              <div className="mt-0.5">
                                {issue.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-500" /> :
                                 issue.type === 'warning' ? <Bug className="w-4 h-4 text-yellow-500" /> :
                                 <CheckCircle2 className="w-4 h-4 text-[var(--cinematic-cyan)]" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                    issue.type === 'error' ? 'text-red-500' :
                                    issue.type === 'warning' ? 'text-yellow-500' :
                                    'text-[var(--cinematic-cyan)]'
                                  }`}>{issue.type}</span>
                                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">Line {issue.line}</span>
                                </div>
                                <p className="text-sm">{issue.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
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
