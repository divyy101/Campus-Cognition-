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
    <div className="flex min-h-screen bg-[#020604] font-mono text-emerald-500 relative overflow-hidden transition-colors duration-500">
      
      {/* Hacker Matrix Motif (Forces dark mode aesthetic regardless of system theme for full immersion) */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #10b981 3px, transparent 4px)', backgroundSize: '100% 4px' }} />
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-green-500/10 blur-[150px] rounded-full pointer-events-none" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Navbar title="Neural Code Lab" />

        <main className="flex-1 p-2 md:p-4 flex flex-col">
          
          {/* Top Navbar for IDE */}
          <div className="flex items-center justify-between mb-2 bg-[#050A08]/90 p-2 rounded-xl border border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] relative z-10 backdrop-blur-md">
            <div className="flex items-center gap-4 px-2">
              <div className="flex gap-1.5 opacity-50">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">Sys.IDE_ACTIVE</span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#020604] text-xs font-mono font-bold text-emerald-400 rounded-lg px-3 py-1.5 border border-emerald-900 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer hover:bg-emerald-900/20"
              >
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
              </select>

              <button
                onClick={handleAnalyze}
                disabled={scanning}
                className="px-4 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600/40 hover:border-emerald-400 text-emerald-400 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              >
                {scanning ? (
                  <span className="w-3 h-3 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
                EXECUTE
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-2 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-500 text-xs font-medium flex items-center gap-2 backdrop-blur-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* IDE Layout (3 Panels) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 h-full min-h-[600px]">
            
            {/* Panel 1: Explorer (Hidden on small screens) */}
            <div className="hidden lg:flex lg:col-span-2 bg-[#050A08]/90 rounded-xl border border-emerald-900/50 shadow-sm flex-col relative z-10 backdrop-blur-md">
              <div className="px-4 py-3 border-b border-emerald-900/50 text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                File System
              </div>
              <div className="p-2 space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-900/20 text-emerald-400 border border-emerald-900/30 cursor-pointer text-xs font-mono transition-colors hover:bg-emerald-900/40">
                  <Code2 className="w-3.5 h-3.5" />
                  solution.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'java'}
                </div>
              </div>
            </div>

            {/* Panel 2: Code Editor */}
            <div className="lg:col-span-7 bg-[#020604]/90 rounded-xl border border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.05)] flex flex-col relative overflow-hidden z-10 backdrop-blur-md">
              <div className="flex items-center px-2 pt-2 bg-[#050A08] border-b border-emerald-900/50">
                <div className="px-5 py-2.5 border-t-2 border-t-emerald-500 bg-[#020604] text-xs font-mono font-bold text-emerald-400 rounded-t-lg">
                  solution.{language}
                </div>
              </div>

              {/* Scanning Overlay */}
              {scanning && (
                <div className="absolute inset-0 top-12 pointer-events-none z-10 overflow-hidden rounded-b-xl">
                  <div className="w-full h-[2px] bg-emerald-400 shadow-[0_0_15px_2px_rgba(16,185,129,0.8)] animate-scan" />
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent animate-scan-overlay" />
                </div>
              )}

              <div className="flex-1 relative flex">
                {/* Line Numbers */}
                <div className="w-12 bg-[#050A08] border-r border-emerald-900/50 flex flex-col items-end py-5 pr-3 pointer-events-none select-none text-[11px] font-mono text-emerald-800">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <span key={i} className="leading-6 opacity-70">{i + 1}</span>
                  ))}
                </div>
                {/* Editor Textarea */}
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Insert code logic here..."
                  className="flex-1 w-full bg-transparent p-5 font-mono text-[13px] leading-6 text-emerald-300 resize-none focus:outline-none custom-scrollbar selection:bg-emerald-900/50 placeholder:text-emerald-900/50"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* Panel 3: AI Inspector */}
            <div className="lg:col-span-3 bg-[#050A08]/90 rounded-xl border border-emerald-900/50 shadow-sm flex flex-col overflow-hidden relative z-10 backdrop-blur-md">
              <div className="px-4 py-3 border-b border-emerald-900/50 text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Diagnostic Terminal
              </div>

              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {!result && !scanning ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <Terminal className="w-10 h-10 text-emerald-700" />
                    <p className="text-xs text-emerald-600 font-medium px-4 font-mono animate-pulse">Awaiting execution command...</p>
                  </div>
                ) : scanning ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-emerald-900/30 rounded w-3/4 animate-pulse" />
                    <div className="h-16 bg-emerald-900/20 rounded-xl w-full animate-pulse" />
                    <div className="h-16 bg-emerald-900/20 rounded-xl w-full animate-pulse" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Complexity */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-[#020604] border border-emerald-900/40 hover:border-emerald-700/50 transition-colors">
                        <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mb-1.5">Time O(n)</div>
                        <div className="text-sm font-mono font-bold text-emerald-400">{result.timeComplexity}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#020604] border border-emerald-900/40 hover:border-emerald-700/50 transition-colors">
                        <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mb-1.5">Space O(n)</div>
                        <div className="text-sm font-mono font-bold text-emerald-400">{result.spaceComplexity}</div>
                      </div>
                    </div>

                    {/* Bugs */}
                    <div>
                      <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Anomalies
                      </h4>
                      {result.bugs && result.bugs.length > 0 ? (
                        <div className="space-y-2">
                          {result.bugs.map((b, i) => (
                            <div key={i} className="px-4 py-3 rounded-xl bg-red-950/20 border border-red-900/30 text-xs text-red-400 font-mono shadow-sm">
                              > {b.message || b}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 font-mono shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> > System secure. No anomalies.
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    <div>
                      <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5" /> Log output
                      </h4>
                      <p className="text-[11px] text-emerald-300/80 leading-relaxed bg-[#020604] p-4 rounded-xl border border-emerald-900/40 font-mono shadow-sm">
                        {result.explanation}
                      </p>
                    </div>

                    {/* Suggested Optimization */}
                    {result.improvedCode && (
                      <div>
                        <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Refactored Stream</span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(result.improvedCode)}
                            className="text-emerald-500 hover:text-emerald-300 hover:underline font-mono text-xs transition-colors"
                          >
                            Copy
                          </button>
                        </h4>
                        <div className="bg-[#020604] p-4 rounded-xl border border-emerald-900/50 shadow-inner overflow-x-auto">
                          <pre className="font-mono text-[11px] text-emerald-400">
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
