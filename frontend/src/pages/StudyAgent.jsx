import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  Send,
  Loader2,
  Sparkles,
  Zap,
  Calendar,
  Target,
  AlertCircle
} from 'lucide-react';
import { StatusDot, EmptyState } from '../components/cinematic/CinematicComponents';

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
  const chatScrollRef = useRef(null);

  const handleUpload = async () => {
    if (!syllabusFile) return;
    setIsUploading(true);
    setUploadError(null);

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
    if (chatScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
      // Auto-scroll if already near bottom (within 150px)
      if (scrollHeight - scrollTop - clientHeight < 150) {
        chatScrollRef.current.scrollTop = scrollHeight;
      }
    }
  }, [chatHistory, isChatting]);

  return (
    <div className="flex min-h-[100dvh] bg-[var(--bg)]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Navbar title="Study Agent" />

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-[1600px] mx-auto w-full">
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <h1 className="cc-h1">Study Agent</h1>
                <div className="flex items-center gap-2 mt-1">
                   <StatusDot status={isUploading || isChatting ? 'analyzing' : 'active'} />
                   <span className="cc-caption uppercase">Neural Memory Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Upload & Analysis */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="cc-card p-6">
                <h2 className="cc-h3 mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[var(--accent)]" />
                  Knowledge Ingestion
                </h2>

                <div className="mb-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Subject / Course title (optional)"
                    className="cc-input w-full px-4 py-3"
                  />
                </div>

                {/* Syllabus upload */}
                <div 
                  onClick={() => syllabusInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-3 ${
                    syllabusFile ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-[var(--surface-sunken)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={syllabusInputRef} 
                    onChange={(e) => setSyllabusFile(e.target.files[0] || null)} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <FileText className={`w-8 h-8 mx-auto mb-3 ${syllabusFile ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                  <p className="text-sm font-semibold mb-1 text-[var(--text-primary)]">{syllabusFile ? syllabusFile.name : 'Upload Syllabus *'}</p>
                  <p className="cc-caption">PDF, DOCX, TXT · Required</p>
                </div>

                {/* Notes upload */}
                <div 
                  onClick={() => notesInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors mb-5 ${
                    notesFile ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-[var(--surface-sunken)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={notesInputRef} 
                    onChange={(e) => setNotesFile(e.target.files[0] || null)} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">{notesFile ? notesFile.name : '+ Add Notes (optional)'}</p>
                </div>

                {uploadError && (
                  <div className="mb-4 p-3 rounded-lg bg-[var(--danger-soft)] border border-[var(--danger)]/20 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" />
                    <p className="text-xs text-[var(--danger)]">{uploadError}</p>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!syllabusFile || isUploading}
                  className="cc-btn w-full py-3 h-[48px]"
                >
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing Neural Data...</>
                  ) : (
                    <><Zap className="w-4 h-4" /> Initialize Analysis</>
                  )}
                </button>
              </div>

              {/* Analysis Results */}
              <AnimatePresence>
                {uploadResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="cc-card p-6 space-y-6">
                    <h3 className="cc-h3 flex items-center gap-2 text-[var(--accent)]">
                      <Sparkles className="w-4 h-4" />
                      {uploadResult.subject || 'Study Plan'}
                    </h3>

                    {uploadResult.syllabus_summary && (
                      <div>
                        <p className="cc-eyebrow mb-2">Summary</p>
                        <p className="cc-body">{uploadResult.syllabus_summary}</p>
                      </div>
                    )}

                    {uploadResult.repeated_topics?.length > 0 && (
                      <div>
                        <p className="cc-eyebrow mb-3 flex items-center gap-2">
                          <Target className="w-3.5 h-3.5" /> High-Priority Topics
                        </p>
                        <div className="space-y-3">
                          {uploadResult.repeated_topics.slice(0, 5).map((topic, idx) => (
                            <div key={idx} className="flex gap-3 items-start">
                              <div className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">{topic.topic}</p>
                                {topic.reason && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{topic.reason}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadResult.weekly_plan?.length > 0 && (
                      <div>
                        <p className="cc-eyebrow mb-3 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" /> Weekly Roadmap
                        </p>
                        <div className="space-y-3">
                          {uploadResult.weekly_plan.map((week, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border)]">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-[var(--accent)]">Week {week.week}</span>
                                <span className="text-xs text-[var(--text-secondary)] font-medium">{week.focus}</span>
                              </div>
                              {week.tasks?.length > 0 && (
                                <ul className="space-y-1.5 mt-3">
                                  {week.tasks.slice(0, 3).map((task, ti) => (
                                    <li key={ti} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-strong)] mt-1.5 shrink-0" />
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Neural Chat */}
            <div className="lg:col-span-7 h-[calc(100dvh-180px)] min-h-[500px]">
              <div className="cc-card flex flex-col h-full overflow-hidden">
                
                {/* Chat Header */}
                <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide">Neural Mentor</h2>
                  <span className="ml-auto text-xs text-[var(--text-muted)] font-mono">
                    {uploadResult ? 'Knowledge base loaded' : 'Upload material to enable RAG'}
                  </span>
                </div>

                {/* Chat Area */}
                <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[var(--surface-sunken)] space-y-6">
                  {chatHistory.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-4 ${
                        msg.role === 'user' 
                          ? 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-tr-sm shadow-sm' 
                          : 'bg-[var(--accent-soft)] text-[var(--text-primary)] rounded-tl-sm'
                      }`}>
                        {msg.role === 'agent' && (
                          <div className="flex items-center gap-2 mb-2 text-[var(--accent)]">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Agent</span>
                          </div>
                        )}
                        {/* Render msg content properly for long text / markdown (simulated here) */}
                        <div className="text-sm leading-relaxed whitespace-pre-wrap overflow-hidden" style={{ wordBreak: 'break-word' }}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="flex justify-start">
                      <div className="bg-[var(--accent-soft)] rounded-2xl rounded-tl-sm p-4 flex gap-1.5 items-center h-[52px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)]">
                  <form onSubmit={handleChat} className="relative flex items-center">
                    <input
                      type="text"
                      value={chatMsg}
                      onChange={(e) => setChatMsg(e.target.value)}
                      placeholder={uploadResult ? "Ask about your study material..." : "Upload a syllabus first, then ask questions..."}
                      className="cc-input w-full pl-4 pr-12 py-3"
                    />
                    <button 
                      type="submit"
                      disabled={!chatMsg.trim() || isChatting}
                      className="absolute right-2 p-2 rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default StudyAgent;
