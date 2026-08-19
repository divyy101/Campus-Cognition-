import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  MessageSquare, 
  Send,
  Loader2,
  Sparkles,
  Zap,
  Calendar,
  Target,
  AlertCircle
} from 'lucide-react';
import { CinematicReveal, FloatingVisual, AgentStatusIndicator } from '../components/cinematic/CinematicComponents';

const StudyAgent = () => {
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [notesFile, setNotesFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'agent', content: 'Initialize cognitive sync. Upload your study material or ask me a question.' }
  ]);
  const [isChatting, setIsChatting] = useState(false);

  const syllabusInputRef = useRef(null);
  const notesInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const handleUpload = async () => {
    if (!syllabusFile) return;
    setIsUploading(true);
    setUploadError(null);

    // Backend: POST /api/study/analyze
    // Fields: syllabus (required), notes (optional), title, scope
    const formData = new FormData();
    formData.append('syllabus', syllabusFile);
    if (notesFile) formData.append('notes', notesFile);
    formData.append('title', title || syllabusFile.name.replace(/\.[^/.]+$/, ''));
    formData.append('scope', 'Exam Focused');

    try {
      const res = await api.post('/study/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        // Backend returns: { success, sessionId, analysis: { subject, syllabus_summary, repeated_topics, important_questions, weekly_plan } }
        setUploadResult(res.data.analysis);
        setChatHistory(prev => [...prev, { 
          role: 'agent', 
          content: `Study plan generated for "${res.data.analysis?.subject || title}". I found ${res.data.analysis?.repeated_topics?.length || 0} key topics and ${res.data.analysis?.weekly_plan?.length || 0} weekly modules. What would you like to explore?`
        }]);
      } else {
        setUploadError(res.data.message || 'Analysis failed.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.response?.data?.message || 'Failed to process study material.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;

    const newMsg = chatMsg;
    setChatMsg('');
    setChatHistory(prev => [...prev, { role: 'user', content: newMsg }]);
    setIsChatting(true);

    try {
      // Backend: POST /api/study/rag/ask  body: { question }  response: { success, answer, sources }
      const res = await api.post('/study/rag/ask', { question: newMsg });
      if (res.data.success) {
        setChatHistory(prev => [...prev, { role: 'agent', content: res.data.answer }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'agent', content: res.data.message || 'Could not process your question.' }]);
      }
    } catch (err) {
      console.error('Chat failed:', err);
      const msg = err.response?.data?.message || 'Neural sync interrupted. Upload study material first, then ask questions.';
      setChatHistory(prev => [...prev, { role: 'agent', content: msg }]);
    } finally {
      setIsChatting(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatting]);

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
          
          {/* Visual Anchor Background */}
          <div className="absolute top-0 right-0 w-[45%] h-[60vh] opacity-20 pointer-events-none mask-image-left z-[-1] mix-blend-screen">
             <FloatingVisual 
                src="/visuals/study-visual.jpg" 
                alt="Learning Intelligence"
                speed="medium"
                className="w-full h-full object-cover object-center"
             />
          </div>

          <div className="relative z-10">
            <CinematicReveal direction="up" className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] flex items-center justify-center shadow-[0_0_20px_var(--cinematic-gold)]">
                  <BookOpen className="w-6 h-6 text-[var(--cinematic-gold)]" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold font-['Outfit']">Study Agent</h1>
                  <p className="text-xs text-[var(--text-secondary)] font-mono uppercase tracking-widest mt-1 flex items-center gap-2">
                     Neural Memory Active
                     <AgentStatusIndicator status={isUploading || isChatting ? 'analyzing' : 'active'} type="study" />
                  </p>
                </div>
              </div>
            </CinematicReveal>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Upload & Analysis (5 cols) */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* Upload Card */}
                <CinematicReveal delay={0.2}>
                  <div className="semantic-card p-8 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--cinematic-gold)]/10 blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <h2 className="text-lg font-bold font-['Outfit'] mb-6 flex items-center gap-2 relative z-10">
                      <Upload className="w-5 h-5 text-[var(--cinematic-gold)]" />
                      Knowledge Ingestion
                    </h2>

                    {/* Title field */}
                    <div className="mb-4 relative z-10">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Subject / Course title (optional)"
                        className="w-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--cinematic-gold)] outline-none transition-colors"
                      />
                    </div>

                    {/* Syllabus upload */}
                    <div 
                      onClick={() => syllabusInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all relative z-10 mb-3 ${
                        syllabusFile ? 'border-[var(--cinematic-gold)] bg-[var(--cinematic-gold)]/5' : 'border-[var(--border-strong)] bg-[var(--surface-elevated)] hover:border-[var(--text-primary)]'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={syllabusInputRef} 
                        onChange={(e) => setSyllabusFile(e.target.files[0] || null)} 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.txt"
                      />
                      <FileText className={`w-8 h-8 mx-auto mb-3 ${syllabusFile ? 'text-[var(--cinematic-gold)]' : 'text-[var(--text-secondary)]'}`} />
                      <p className="text-sm font-bold mb-0.5">{syllabusFile ? syllabusFile.name : 'Upload Syllabus *'}</p>
                      <p className="text-xs text-[var(--text-secondary)]">PDF, DOCX, TXT · Required</p>
                    </div>

                    {/* Notes upload (optional) */}
                    <div 
                      onClick={() => notesInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all relative z-10 mb-5 ${
                        notesFile ? 'border-[var(--cinematic-gold)]/50 bg-[var(--cinematic-gold)]/5' : 'border-[var(--border-strong)]/50 bg-[var(--surface-elevated)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={notesInputRef} 
                        onChange={(e) => setNotesFile(e.target.files[0] || null)} 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.txt"
                      />
                      <p className="text-xs font-bold text-[var(--text-secondary)]">{notesFile ? notesFile.name : '+ Add Notes (optional)'}</p>
                    </div>

                    {uploadError && (
                      <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 relative z-10">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-400">{uploadError}</p>
                      </div>
                    )}

                    <button
                      onClick={handleUpload}
                      disabled={!syllabusFile || isUploading}
                      className="w-full semantic-btn py-3 flex items-center justify-center gap-2 disabled:opacity-50 relative z-10 shadow-[0_0_15px_rgba(242,198,109,0.2)] transition-all"
                      style={{ backgroundColor: syllabusFile && !isUploading ? 'var(--cinematic-gold)' : undefined, color: syllabusFile && !isUploading ? '#000' : undefined }}
                    >
                      {isUploading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing Neural Data...</>
                      ) : (
                        <><Zap className="w-4 h-4" /> Initialize Analysis</>
                      )}
                    </button>
                  </div>
                </CinematicReveal>

                {/* Analysis Results */}
                <AnimatePresence>
                  {uploadResult && (
                    <CinematicReveal delay={0.1}>
                      <div className="semantic-card p-6 space-y-5">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--cinematic-gold)] flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {uploadResult.subject || 'Study Plan'}
                        </h3>

                        {/* Summary */}
                        {uploadResult.syllabus_summary && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Summary</p>
                            <p className="text-sm text-[var(--text-primary)] leading-relaxed">{uploadResult.syllabus_summary}</p>
                          </div>
                        )}

                        {/* Key Topics */}
                        {uploadResult.repeated_topics?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                              <Target className="w-3.5 h-3.5" /> High-Priority Topics
                            </p>
                            <div className="space-y-2">
                              {uploadResult.repeated_topics.slice(0, 5).map((topic, idx) => (
                                <div key={idx} className="flex gap-3 items-start">
                                  <div className="w-5 h-5 rounded-full bg-[var(--cinematic-gold)]/20 text-[var(--cinematic-gold)] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">{topic.topic}</p>
                                    {topic.reason && <p className="text-xs text-[var(--text-secondary)]">{topic.reason}</p>}
                                  </div>
                                  {topic.weight && (
                                    <span className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                      topic.weight === 'High' ? 'bg-red-500/10 text-red-400' :
                                      topic.weight === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                      'bg-[var(--cinematic-gold)]/10 text-[var(--cinematic-gold)]'
                                    }`}>{topic.weight}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Weekly Plan */}
                        {uploadResult.weekly_plan?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" /> Weekly Roadmap
                            </p>
                            <div className="space-y-3">
                              {uploadResult.weekly_plan.map((week, idx) => (
                                <div key={idx} className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-strong)]">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-[var(--cinematic-gold)] uppercase tracking-widest">Week {week.week}</span>
                                    <span className="text-xs text-[var(--text-secondary)]">{week.focus}</span>
                                  </div>
                                  {week.tasks?.length > 0 && (
                                    <ul className="space-y-1">
                                      {week.tasks.slice(0, 3).map((task, ti) => (
                                        <li key={ti} className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                                          <div className="w-1 h-1 rounded-full bg-[var(--cinematic-gold)]" />
                                          {task}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CinematicReveal>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Neural Chat (7 cols) */}
              <CinematicReveal delay={0.4} className="lg:col-span-7 h-[calc(100vh-200px)] min-h-[600px]">
                <div className="semantic-card flex flex-col h-full border border-[var(--border-strong)] relative overflow-hidden">
                  
                  {/* Chat Header */}
                  <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] relative z-10 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--cinematic-gold)] animate-pulse" />
                    <h2 className="font-bold text-sm uppercase tracking-widest font-['Outfit']">Neural Mentor</h2>
                    <span className="ml-auto text-[10px] text-[var(--text-secondary)] font-mono">
                      {uploadResult ? 'Knowledge base loaded' : 'Upload material to enable RAG'}
                    </span>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6 bg-gradient-to-b from-transparent to-[var(--surface-elevated)]/50">
                    {chatHistory.map((msg, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl p-4 ${
                          msg.role === 'user' 
                            ? 'bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-tr-sm' 
                            : 'bg-[var(--cinematic-gold)]/10 border border-[var(--cinematic-gold)]/20 text-[var(--text-primary)] rounded-tl-sm'
                        }`}>
                          {msg.role === 'agent' && (
                            <div className="flex items-center gap-2 mb-2 text-[var(--cinematic-gold)]">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Agent</span>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    {isChatting && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-[var(--cinematic-gold)]/10 border border-[var(--cinematic-gold)]/20 rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--cinematic-gold)] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--cinematic-gold)] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--cinematic-gold)] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 bg-[var(--surface)] border-t border-[var(--border-subtle)] relative z-10">
                    <form onSubmit={handleChat} className="relative flex items-center">
                      <input
                        type="text"
                        value={chatMsg}
                        onChange={(e) => setChatMsg(e.target.value)}
                        placeholder={uploadResult ? "Ask about your study material..." : "Upload a syllabus first, then ask questions..."}
                        className="w-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-xl pl-5 pr-14 py-4 text-sm focus:border-[var(--cinematic-gold)] outline-none transition-colors"
                      />
                      <button 
                        type="submit"
                        disabled={!chatMsg.trim() || isChatting}
                        className="absolute right-2 p-2.5 rounded-lg bg-[var(--cinematic-gold)] text-black hover:brightness-110 disabled:opacity-50 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </CinematicReveal>

            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default StudyAgent;
