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
  Zap
} from 'lucide-react';
import { CinematicReveal, FloatingVisual, AgentStatusIndicator } from '../components/cinematic/CinematicComponents';

const StudyAgent = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'agent', content: 'Initialize cognitive sync. Upload your study material or ask me a question.' }
  ]);
  const [isChatting, setIsChatting] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await api.post('/study/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setUploadResult(res.data.data.analysis);
        setChatHistory(prev => [...prev, { 
          role: 'agent', 
          content: `Document processed. I've extracted ${res.data.data.analysis.keyConcepts.length} key concepts. What would you like to explore?` 
        }]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
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
      const res = await api.post('/study/chat', { message: newMsg });
      if (res.data.success) {
        setChatHistory(prev => [...prev, { role: 'agent', content: res.data.data.reply }]);
      }
    } catch (err) {
      console.error('Chat failed:', err);
      setChatHistory(prev => [...prev, { role: 'agent', content: "Neural sync interrupted. Please try again." }]);
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
          <div className="absolute top-0 right-0 w-[45%] h-[60vh] opacity-30 pointer-events-none mask-image-left z-[-1] mix-blend-screen">
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
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--cinematic-gold)]/10 blur-[40px] -translate-y-1/2 translate-x-1/2" />
                    
                    <h2 className="text-lg font-bold font-['Outfit'] mb-6 flex items-center gap-2 relative z-10">
                      <Upload className="w-5 h-5 text-[var(--cinematic-gold)]" />
                      Knowledge Ingestion
                    </h2>
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all relative z-10 ${
                        file ? 'border-[var(--cinematic-gold)] bg-[var(--cinematic-gold)]/5' : 'border-[var(--border-strong)] bg-[var(--surface-elevated)] hover:border-[var(--text-primary)]'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.txt"
                      />
                      <FileText className={`w-10 h-10 mx-auto mb-4 ${file ? 'text-[var(--cinematic-gold)]' : 'text-[var(--text-secondary)]'}`} />
                      <p className="text-sm font-bold mb-1">{file ? file.name : 'Select Study Material'}</p>
                      <p className="text-xs text-[var(--text-secondary)]">PDF, DOCX, TXT up to 10MB</p>
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={!file || isUploading}
                      className="w-full mt-6 semantic-btn py-3 flex items-center justify-center gap-2 disabled:opacity-50 relative z-10 shadow-[0_0_15px_rgba(242,198,109,0.2)]"
                      style={{ backgroundColor: file && !isUploading ? 'var(--cinematic-gold)' : undefined, color: file && !isUploading ? '#000' : undefined }}
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
                      <div className="semantic-card p-8 bg-[var(--surface-elevated)] border-[var(--cinematic-gold)]/30">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--cinematic-gold)] mb-6 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Extracted Concepts
                        </h3>
                        
                        <div className="space-y-4">
                          {uploadResult.keyConcepts?.map((concept, idx) => (
                            <div key={idx} className="flex gap-4">
                              <div className="w-6 h-6 rounded-full bg-[var(--cinematic-gold)]/20 text-[var(--cinematic-gold)] flex items-center justify-center text-xs font-bold shrink-0">
                                {idx + 1}
                              </div>
                              <p className="text-sm text-[var(--text-primary)] leading-relaxed">{concept}</p>
                            </div>
                          ))}
                        </div>
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
                        placeholder="Query the knowledge base..."
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
