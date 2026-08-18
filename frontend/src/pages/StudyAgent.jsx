import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  BookOpen, 
  UploadCloud, 
  Sparkles, 
  Send, 
  Calendar,
  BrainCircuit,
  FileText
} from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const StudyAgent = () => {
  const [sessionTitle, setSessionTitle] = useState('');
  const [scope, setScope] = useState('Exam Focused');
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [notesFile, setNotesFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const [question, setQuestion] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');

    if (!syllabusFile) {
      setError('Syllabus file is required.');
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
        setChatHistory(prev => [...prev, { sender: 'ai', text: res.data.answer }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'Sorry, I could not process your question.' }]);
    } finally {
      setRagLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative z-10"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-y-auto custom-scrollbar">
        <Navbar title="" />

        <main className="flex-1 px-6 md:px-12 py-8 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8 border-b border-[var(--border-subtle)]"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] text-[var(--accent)] text-[10px] font-bold tracking-widest uppercase mb-4 border border-[var(--border-strong)]">
                Study Agent Active
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Digital Learning Desk
              </h1>
              <p className="text-sm md:text-base text-[var(--text-secondary)] mt-3 max-w-2xl font-medium">
                Upload course materials to generate an AI-optimized syllabus, timeline, and personalized study modules.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Upload & Materials (4 columns) */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="lg:col-span-4 space-y-6"
            >
              <motion.div variants={itemVariant} className="bg-[var(--surface)] border border-[var(--border-subtle)] p-8 rounded-2xl relative">
                
                <h2 className="text-base font-bold mb-8 flex items-center gap-3">
                  <UploadCloud className="w-5 h-5 text-[var(--text-secondary)]" />
                  Cognitive Ingestion
                </h2>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleUpload} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Knowledge Track</label>
                    <input
                      type="text"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      placeholder="e.g. Advanced Data Structures"
                      className="semantic-input w-full px-4 py-3.5 text-sm placeholder:text-[var(--text-secondary)]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Focus Paradigm</label>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="semantic-input w-full px-4 py-3.5 text-sm"
                    >
                      <option value="Exam Focused">Targeted Exam Prep</option>
                      <option value="Comprehensive">Deep Comprehensive Learning</option>
                      <option value="Quick Revision">Rapid Revision</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">
                      Source Material (PDF) <span className="text-[var(--accent)]">*</span>
                    </label>
                    <div className="border-2 border-dashed border-[var(--border-strong)] rounded-xl p-8 bg-[var(--surface-elevated)] text-center hover:border-[var(--accent)] transition-colors group/upload cursor-pointer relative overflow-hidden">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => setSyllabusFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required
                      />
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="w-8 h-8 text-[var(--text-secondary)] group-hover/upload:text-[var(--accent)] transition-colors" />
                        <span className="text-xs font-mono text-[var(--text-secondary)] group-hover/upload:text-[var(--text-primary)]">
                          {syllabusFile ? syllabusFile.name : 'Drop file or click to browse'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-sm mt-4 flex items-center justify-center gap-2 transition-all bg-[var(--accent)] text-[var(--bg-main)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-[var(--bg-main)]/30 border-t-[var(--bg-main)] rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Initialize Analysis
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </motion.div>

            {/* Right Column: Desk/Workspace (8 columns) */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="lg:col-span-8 space-y-6"
            >
              {!analysis ? (
                /* Empty Workspace State */
                <motion.div variants={itemVariant} className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 relative">
                  <div className="w-20 h-20 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] flex items-center justify-center mb-8">
                    <BookOpen className="w-8 h-8 text-[var(--text-secondary)]" />
                  </div>
                  
                  <h3 className="text-xl font-extrabold mb-3">Awaiting Input Data</h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-md font-mono leading-relaxed">
                    System standing by. Upload your course syllabus to initialize the neural processing engine and generate your interactive learning timeline.
                  </p>
                </motion.div>
              ) : (
                /* Active Workspace State */
                <>
                  {/* Timeline / Roadmap Panel */}
                  <motion.div variants={itemVariant} className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-subtle)]">
                      <div className="flex items-center gap-4">
                        <Calendar className="w-6 h-6 text-[var(--text-secondary)]" />
                        <h3 className="text-lg font-bold">Strategic Timeline</h3>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1.5 rounded-lg">Optimized Plan</span>
                    </div>

                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.375rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-[var(--border-strong)]">
                      {(analysis.weekly_plan || []).map((w, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: idx % 2 === 0 ? -10 : 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1, duration: 0.5 }}
                          key={idx} 
                          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                        >
                          {/* Timeline Marker */}
                          <div className="flex items-center justify-center w-11 h-11 rounded-full border-[3px] border-[var(--bg-main)] bg-[var(--surface-elevated)] text-[var(--text-primary)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-0 z-10 transition-colors group-hover:bg-[var(--accent)] group-hover:text-[var(--bg-main)]">
                            <span className="text-xs font-black">{idx + 1}</span>
                          </div>
                          
                          {/* Card */}
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] ml-auto md:ml-0 hover:border-[var(--border-strong)] transition-colors">
                            <div className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest mb-2">Phase {w.week}</div>
                            <h4 className="font-bold text-base mb-4">{w.focus}</h4>
                            <ul className="space-y-3">
                              {(w.tasks || []).map((task, tIdx) => (
                                <li key={tIdx} className="text-sm text-[var(--text-secondary)] flex items-start gap-3 leading-relaxed">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0 opacity-50" />
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* AI Mentor Panel */}
                  <motion.div variants={itemVariant} className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col h-[500px]">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--border-subtle)]">
                      <BrainCircuit className="w-6 h-6 text-[var(--text-secondary)]" />
                      <div>
                        <h3 className="text-lg font-bold">Neural Mentor</h3>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-5 pr-4 text-sm mb-6 custom-scrollbar">
                      {chatHistory.length > 0 ? (
                        chatHistory.map((msg, i) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={i} 
                            className={`p-5 rounded-2xl max-w-[85%] ${
                              msg.sender === 'user' 
                                ? 'bg-[var(--surface-elevated)] border border-[var(--border-strong)] ml-auto text-right' 
                                : 'bg-[var(--surface)] border border-[var(--border-subtle)] border-l-2 border-l-[var(--accent)] mr-auto'
                            }`}
                          >
                            <p className="leading-relaxed text-[13px]">{msg.text}</p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                          <BrainCircuit className="w-12 h-12 mb-4 text-[var(--text-secondary)]" />
                          <p className="text-xs text-[var(--text-secondary)] font-mono max-w-[200px]">Mentor initialized. Awaiting interrogation regarding syllabus materials.</p>
                        </div>
                      )}
                      
                      {ragLoading && (
                        <div className="p-5 rounded-2xl max-w-[85%] bg-[var(--surface)] border border-[var(--border-subtle)] border-l-2 border-l-[var(--accent)] mr-auto flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                          <span className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-widest">Processing...</span>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleAskRAG} className="flex gap-3">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Query the mentor..."
                        className="semantic-input flex-1 px-5 py-4 text-sm font-medium"
                      />
                      <button 
                        type="submit" 
                        disabled={ragLoading || !question.trim()} 
                        className="px-6 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] hover:bg-[var(--surface)] disabled:opacity-50 transition-colors flex items-center justify-center group"
                      >
                        <Send className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                      </button>
                    </form>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default StudyAgent;
