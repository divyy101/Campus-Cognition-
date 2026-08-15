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
  CheckCircle2, 
  HelpCircle,
  BarChart3,
  Calendar,
  Lock,
  BrainCircuit,
  GraduationCap
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
    <div className="flex min-h-screen bg-[#FFFCF8] dark:bg-[#0C0A09] font-sans text-slate-900 dark:text-orange-50 transition-colors duration-500 relative overflow-hidden">
      
      {/* Soft Paper Grid Background Motif for Study Agent */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #f59e0b 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute bottom-0 left-[-10%] w-[600px] h-[500px] bg-amber-500/10 dark:bg-amber-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-500/10 dark:bg-rose-900/20 blur-[100px] rounded-full pointer-events-none" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar title="Learning Studio" />

        <main className="flex-1 p-6 md:px-8 md:py-8 space-y-6 overflow-y-auto">
          {/* Header Section */}
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold tracking-widest uppercase mb-3 border border-amber-200 dark:border-amber-800/50 shadow-sm">
                <BookOpen className="w-3 h-3" />
                Study Workspace
              </div>
              <h1 className="text-3xl md:text-[36px] font-extrabold tracking-tight text-slate-900 dark:text-orange-50 leading-tight">
                Digital Learning Desk
              </h1>
              <p className="text-sm text-slate-600 dark:text-amber-100/60 mt-2 max-w-xl font-medium">
                Upload course materials to generate an AI-optimized syllabus, timeline, and personalized study modules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
            
            {/* Left Column: Upload & Materials (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white/90 dark:bg-[#151110]/90 rounded-[16px] p-6 border border-amber-100 dark:border-amber-900/30 shadow-sm relative backdrop-blur-xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-rose-400 dark:from-amber-600 dark:to-rose-600 rounded-t-[16px]" />
                
                <h2 className="text-base font-bold text-slate-900 dark:text-orange-50 mb-6 flex items-center gap-3">
                  <UploadCloud className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  Course Material
                </h2>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-amber-100/60 uppercase tracking-widest mb-1.5">Track Name</label>
                    <input
                      type="text"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      placeholder="e.g. Data Structures"
                      className="w-full bg-[#FFFCF8] dark:bg-[#0C0A09] border border-amber-100 dark:border-amber-900/50 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-orange-50 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-amber-100/60 uppercase tracking-widest mb-1.5">Focus Mode</label>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="w-full bg-[#FFFCF8] dark:bg-[#0C0A09] border border-amber-100 dark:border-amber-900/50 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-orange-50 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors"
                    >
                      <option value="Exam Focused">Exam Prep</option>
                      <option value="Comprehensive">Deep Learning</option>
                      <option value="Quick Revision">Quick Revision</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-amber-100/60 uppercase tracking-widest mb-1.5">
                      Upload Syllabus (PDF) <span className="text-red-400">*</span>
                    </label>
                    <div className="border-2 border-dashed border-amber-200 dark:border-amber-900/50 rounded-xl p-4 bg-[#FFFCF8] dark:bg-[#0C0A09] text-center hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => setSyllabusFile(e.target.files[0])}
                        className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[10px] file:uppercase file:font-bold file:bg-amber-100 dark:file:bg-amber-900/30 file:text-amber-700 dark:file:text-amber-400 hover:file:bg-amber-200 dark:hover:file:bg-amber-900/50 cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 dark:from-amber-600 dark:to-rose-700 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
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
                <div className="bg-white/90 dark:bg-[#151110]/90 rounded-[16px] border border-amber-100 dark:border-amber-900/30 shadow-sm h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 backdrop-blur-xl">
                  <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center border border-amber-100 dark:border-amber-900/30 mb-6">
                    <BookOpen className="w-10 h-10 text-amber-500 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-orange-50 mb-2">Workspace Empty</h3>
                  <p className="text-sm text-slate-500 dark:text-amber-100/50 max-w-sm">
                    Upload your course syllabus on the left to generate an interactive timeline and personalized notes.
                  </p>
                </div>
              ) : (
                /* Active Workspace State */
                <>
                  {/* Timeline / Roadmap Panel */}
                  <div className="bg-white dark:bg-[#151110] rounded-[16px] p-6 border border-amber-100 dark:border-amber-900/30 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-amber-50 dark:border-amber-900/20">
                      <h3 className="text-base font-bold text-slate-900 dark:text-orange-50 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                        Study Timeline
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0C0A09] px-2 py-1 rounded">Generated Plan</span>
                    </div>

                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-amber-200 dark:before:via-amber-900/50 before:to-transparent">
                      {(analysis.weekly_plan || []).map((w, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                          {/* Timeline Marker */}
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#151110] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-0">
                            <span className="text-xs font-bold">{idx + 1}</span>
                          </div>
                          
                          {/* Card */}
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-xl bg-[#FFFCF8] dark:bg-[#0C0A09] border border-amber-100 dark:border-amber-900/30 shadow-sm ml-auto md:ml-0 hover:border-rose-300 dark:hover:border-rose-500/50 transition-colors">
                            <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Week {w.week}</div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-orange-50 mb-3">{w.focus}</h4>
                            <ul className="space-y-2">
                              {(w.tasks || []).map((task, tIdx) => (
                                <li key={tIdx} className="text-xs text-slate-600 dark:text-amber-100/70 flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 dark:bg-rose-500 mt-1.5 shrink-0" />
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
                  <div className="bg-white/90 dark:bg-[#151110]/90 rounded-[16px] p-6 border border-amber-100 dark:border-amber-900/30 shadow-sm flex flex-col h-[400px] backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-amber-50 dark:border-amber-900/20">
                      <BrainCircuit className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-orange-50">AI Study Mentor</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-sm mb-4 custom-scrollbar">
                      {chatHistory.length > 0 ? (
                        chatHistory.map((msg, i) => (
                          <div key={i} className={`p-4 rounded-xl max-w-[85%] ${msg.sender === 'user' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white ml-auto' : 'bg-[#FFFCF8] dark:bg-[#0C0A09] border border-amber-100 dark:border-amber-900/30 text-slate-800 dark:text-amber-50 mr-auto'}`}>
                            <p className="leading-relaxed text-[13px]">{msg.text}</p>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex items-center justify-center text-center">
                          <p className="text-xs text-slate-500 dark:text-amber-100/50 font-medium px-4">Have questions about your syllabus? Ask your mentor here.</p>
                        </div>
                      )}
                      {ragLoading && (
                        <div className="p-4 rounded-xl max-w-[85%] bg-[#FFFCF8] dark:bg-[#0C0A09] border border-amber-100 dark:border-amber-900/30 mr-auto flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 dark:bg-rose-500 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 dark:bg-rose-500 animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 dark:bg-rose-500 animate-bounce [animation-delay:0.4s]" />
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleAskRAG} className="flex gap-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Type a question..."
                        className="flex-1 bg-[#FFFCF8] dark:bg-[#0C0A09] border border-amber-100 dark:border-amber-900/50 rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-orange-50 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors"
                      />
                      <button 
                        type="submit" 
                        disabled={ragLoading || !question.trim()} 
                        className="px-4 rounded-lg bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 text-white disabled:opacity-50 transition-colors flex items-center justify-center shadow-sm"
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
    </div>
  );
};

export default StudyAgent;
