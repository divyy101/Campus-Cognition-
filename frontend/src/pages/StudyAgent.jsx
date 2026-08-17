import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  BookOpen, 
  UploadCloud, 
  Sparkles, 
  Send, 
  Calendar,
  BrainCircuit
} from 'lucide-react';

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen bg-transparent font-sans text-[var(--text-primary)] relative z-10"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar title="Learning Studio" />

        <main className="flex-1 p-6 md:px-8 md:py-8 space-y-6 overflow-y-auto">
          {/* Header Section */}
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold tracking-widest uppercase mb-3 border border-[var(--accent)]/30 shadow-sm">
                <BookOpen className="w-3 h-3" />
                Study Workspace
              </div>
              <h1 className="text-3xl md:text-[36px] font-extrabold tracking-tight leading-tight">
                Digital Learning Desk
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl font-medium">
                Upload course materials to generate an AI-optimized syllabus, timeline, and personalized study modules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
            
            {/* Left Column: Upload & Materials (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="semantic-card p-6 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] rounded-t-2xl" />
                
                <h2 className="text-base font-bold mb-6 flex items-center gap-3">
                  <UploadCloud className="w-5 h-5 text-[var(--accent)]" />
                  Course Material
                </h2>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Track Name</label>
                    <input
                      type="text"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      placeholder="e.g. Data Structures"
                      className="semantic-input w-full px-4 py-3 text-sm placeholder:text-[var(--border-strong)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Focus Mode</label>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="semantic-input w-full px-4 py-3 text-sm"
                    >
                      <option value="Exam Focused">Exam Prep</option>
                      <option value="Comprehensive">Deep Learning</option>
                      <option value="Quick Revision">Quick Revision</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">
                      Upload Syllabus (PDF) <span className="text-[var(--danger)]">*</span>
                    </label>
                    <div className="border-2 border-dashed border-[var(--border-strong)] rounded-xl p-4 bg-[var(--surface-elevated)] text-center hover:border-[var(--accent)] transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => setSyllabusFile(e.target.files[0])}
                        className="w-full text-xs text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[10px] file:uppercase file:font-bold file:bg-[var(--accent)]/10 file:text-[var(--accent)] hover:file:bg-[var(--accent)]/20 cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="semantic-btn w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze Material
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Desk/Workspace (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {!analysis ? (
                /* Empty Workspace State */
                <div className="semantic-card h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-[var(--accent)]/10 flex items-center justify-center border border-[var(--accent)]/20 mb-6">
                    <BookOpen className="w-10 h-10 text-[var(--accent)]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Workspace Empty</h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-sm">
                    Upload your course syllabus on the left to generate an interactive timeline and personalized notes.
                  </p>
                </div>
              ) : (
                /* Active Workspace State */
                <>
                  {/* Timeline / Roadmap Panel */}
                  <div className="semantic-card p-6">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]">
                      <h3 className="text-base font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--accent)]" />
                        Study Timeline
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--surface-elevated)] px-2 py-1 rounded">Generated Plan</span>
                    </div>

                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border-strong)] before:to-transparent">
                      {(analysis.weekly_plan || []).map((w, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                          {/* Timeline Marker */}
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--surface)] bg-[var(--surface-elevated)] text-[var(--accent)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-0">
                            <span className="text-xs font-bold">{idx + 1}</span>
                          </div>
                          
                          {/* Card */}
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-sm ml-auto md:ml-0 hover:border-[var(--accent-secondary)] transition-colors">
                            <div className="text-[10px] font-bold text-[var(--accent-secondary)] uppercase tracking-widest mb-1">Week {w.week}</div>
                            <h4 className="font-bold text-sm mb-3">{w.focus}</h4>
                            <ul className="space-y-2">
                              {(w.tasks || []).map((task, tIdx) => (
                                <li key={tIdx} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] mt-1.5 shrink-0" />
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Mentor Panel */}
                  <div className="semantic-card p-6 flex flex-col h-[400px]">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--border)]">
                      <BrainCircuit className="w-4 h-4 text-[var(--accent-secondary)]" />
                      <h3 className="text-base font-bold">AI Study Mentor</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-sm mb-4 custom-scrollbar">
                      {chatHistory.length > 0 ? (
                        chatHistory.map((msg, i) => (
                          <div key={i} className={`p-4 rounded-xl max-w-[85%] ${msg.sender === 'user' ? 'bg-[var(--accent)] text-white ml-auto' : 'bg-[var(--surface-elevated)] border border-[var(--border)] mr-auto'}`}>
                            <p className="leading-relaxed text-[13px]">{msg.text}</p>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex items-center justify-center text-center">
                          <p className="text-xs text-[var(--text-secondary)] font-medium px-4">Have questions about your syllabus? Ask your mentor here.</p>
                        </div>
                      )}
                      {ragLoading && (
                        <div className="p-4 rounded-xl max-w-[85%] bg-[var(--surface-elevated)] border border-[var(--border)] mr-auto flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] animate-bounce [animation-delay:0.4s]" />
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleAskRAG} className="flex gap-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Type a question..."
                        className="semantic-input flex-1 px-4 py-3 text-sm"
                      />
                      <button 
                        type="submit" 
                        disabled={ragLoading || !question.trim()} 
                        className="px-4 rounded-lg bg-[var(--accent-secondary)] hover:brightness-110 text-white disabled:opacity-50 transition-colors flex items-center justify-center shadow-sm"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default StudyAgent;
