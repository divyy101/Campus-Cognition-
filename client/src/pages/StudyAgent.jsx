import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  BookOpen, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  BarChart3,
  Calendar
} from 'lucide-react';

const StudyAgent = () => {
  const [sessionTitle, setSessionTitle] = useState('');
  const [scope, setScope] = useState('Exam Focused');
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [notesFile, setNotesFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  // RAG Chat State
  const [question, setQuestion] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');

    if (!syllabusFile) {
      setError('Syllabus file is required. Please select your course syllabus file.');
      return;
    }

    const formData = new FormData();
    formData.append('session_title', sessionTitle || 'Study Session');
    formData.append('scope', scope);
    formData.append('syllabus', syllabusFile);
    if (notesFile) {
      formData.append('notes', notesFile);
    }

    setLoading(true);
    try {
      const res = await api.post('/study/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setAnalysis(res.data.analysis);
      } else {
        setError(res.data.message || 'AI analysis could not be completed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading files for analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskRAG = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question;
    setQuestion('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userQ }]);
    setRagLoading(true);

    try {
      const res = await api.post('/study/rag/ask', { question: userQ });
      if (res.data.success) {
        setChatHistory(prev => [...prev, {
          sender: 'ai',
          text: res.data.answer,
          sources: res.data.sources
        }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, {
        sender: 'ai',
        text: 'Sorry, I could not process your question right now.'
      }]);
    } finally {
      setRagLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-emerald-900/20 text-slate-100 font-sans selection:bg-emerald-500/30">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Study Agent — Intelligent Learning Workspace" />

        <main className="flex-1 p-6 md:px-8 md:py-6 space-y-6 overflow-y-auto">
          {/* Header Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[32px] glass-card p-6 border border-white/5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Academic AI Copilot</span>
              <h1 className="text-2xl font-black text-white mt-1">Syllabus Analysis & Study Roadmap</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">Upload your course syllabus (Required) and notes (Optional). Maximum 700 MB per file.</p>
            </div>
            <div className="relative z-10 hidden sm:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-indigo-300 shadow-inner">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Topic Priority Powered
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Upload Form */}
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass-card rounded-[32px] p-6 border border-white/5"
              >
                <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2 tracking-wide">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <UploadCloud className="w-4 h-4 text-indigo-400" />
                  </div>
                  Upload Materials
                </h2>

                {error && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleUpload} className="space-y-5">
                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 group-focus-within:text-indigo-400 transition-colors">Subject Title</label>
                    <input
                      type="text"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      placeholder="e.g. Data Structures & Algorithms"
                      className="w-full glass-input rounded-2xl px-4 py-3 text-sm placeholder-slate-500"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 group-focus-within:text-indigo-400 transition-colors">Exam Scope</label>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="w-full glass-input rounded-2xl px-4 py-3 text-sm [&>option]:bg-slate-900"
                    >
                      <option value="Exam Focused">Exam Focused (PYQ Prioritized)</option>
                      <option value="Comprehensive">Comprehensive (Full Coverage)</option>
                      <option value="Quick Revision">Quick Revision (Formula & High-Yield)</option>
                    </select>
                  </div>

                  {/* Syllabus (Required) */}
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1">
                      Syllabus PDF <span className="text-rose-400">* (REQUIRED)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => setSyllabusFile(e.target.files[0])}
                        className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-bold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 file:cursor-pointer transition-colors border border-dashed border-white/10 rounded-2xl p-2 bg-black/20"
                        required
                      />
                    </div>
                    {syllabusFile && <p className="text-[10px] text-indigo-400 mt-2 font-medium ml-1">Selected: {syllabusFile.name}</p>}
                  </div>

                  {/* Notes (Optional) */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Lecture Notes <span className="text-slate-500">(Optional)</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.md"
                      onChange={(e) => setNotesFile(e.target.files[0])}
                      className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-bold file:bg-white/5 file:text-slate-300 hover:file:bg-white/10 file:cursor-pointer transition-colors border border-dashed border-white/10 rounded-2xl p-2 bg-black/20"
                    />
                    {notesFile && <p className="text-[10px] text-indigo-400 mt-2 font-medium ml-1">Selected: {notesFile.name}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl glass-button text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 group"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Generate AI Roadmap
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* RAG Q&A Window */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass-card rounded-[32px] p-6 border border-white/5 flex flex-col h-96"
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 tracking-wide">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                  </div>
                  Syllabus Assistant
                </h3>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-xs mb-4 custom-scrollbar">
                  {chatHistory.length > 0 ? (
                    chatHistory.map((msg, i) => (
                      <div key={i} className={`p-4 rounded-2xl max-w-[85%] ${msg.sender === 'user' ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-100 ml-auto' : 'bg-white/5 border border-white/10 text-slate-300 mr-auto'}`}>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-center">
                      <p className="text-[11px] text-slate-500 font-medium px-4">Ask any question about your uploaded syllabus or notes. I'll search your materials to answer.</p>
                    </div>
                  )}
                  {ragLoading && (
                    <div className="p-4 rounded-2xl max-w-[85%] bg-white/5 border border-white/10 mr-auto">
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]" />
                      </span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleAskRAG} className="flex gap-2 relative">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about exam topics..."
                    className="flex-1 glass-input rounded-2xl pl-4 pr-12 py-3.5 text-xs placeholder-slate-500"
                  />
                  <button 
                    type="submit" 
                    disabled={ragLoading || !question.trim()} 
                    className="absolute right-2 top-2 p-2 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 hover:text-indigo-300 disabled:opacity-50 disabled:hover:bg-indigo-500/20 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Right Column: AI Analysis Visualization */}
            <div className="lg:col-span-2 space-y-6">
              {analysis ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Topic Priorities */}
                  <div className="glass-card rounded-[32px] p-6 sm:p-8 border border-white/5">
                    <h3 className="text-base font-bold text-white mb-6 flex items-center gap-3 tracking-wide">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                        <BarChart3 className="w-5 h-5 text-amber-400" />
                      </div>
                      Important Exam Topics & PYQ Priority
                    </h3>

                    <div className="space-y-3">
                      {(analysis.repeated_topics || []).map((t, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-black/20 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-white/5 transition-colors">
                          <div>
                            <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{t.topic}</span>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{t.reason}</p>
                          </div>
                          <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                            {t.weight} Priority
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Study Plan */}
                  <div className="glass-card rounded-[32px] p-6 sm:p-8 border border-white/5">
                    <h3 className="text-base font-bold text-white mb-6 flex items-center gap-3 tracking-wide">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                      </div>
                      Weekly Study Roadmap
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(analysis.weekly_plan || []).map((w, idx) => (
                        <div key={idx} className="p-5 rounded-3xl bg-black/20 border border-white/5 group hover:border-emerald-500/30 transition-colors">
                          <div className="inline-block mb-3 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                            Week {w.week}
                          </div>
                          <h4 className="font-bold text-sm text-white mb-3">{w.focus}</h4>
                          <ul className="space-y-2.5">
                            {(w.tasks || []).map((task, tIdx) => (
                              <li key={tIdx} className="text-xs text-slate-400 flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                                <span className="leading-relaxed">{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="glass-card rounded-[32px] p-12 border border-white/5 border-dashed text-center flex flex-col items-center justify-center min-h-[500px]">
                  <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 relative">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
                    <BookOpen className="w-8 h-8 text-indigo-400 relative z-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white">No Roadmap Generated Yet</h3>
                  <p className="text-sm text-slate-400 max-w-sm mt-3 leading-relaxed">
                    Upload your course syllabus PDF on the left panel to generate your AI topic prioritization and weekly study schedule.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudyAgent;
