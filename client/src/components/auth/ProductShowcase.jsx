import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code2, Briefcase } from 'lucide-react';

const AgentPreviewCard = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  metric, 
  metricLabel, 
  colors, 
  delay = 0, 
  className = "" 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`glass-card p-5 rounded-2xl border relative overflow-hidden backdrop-blur-xl ${className}`}
      style={{
        borderColor: `rgba(${colors.border}, 0.2)`,
        boxShadow: `0 10px 40px -10px rgba(${colors.shadow}, 0.15)`
      }}
    >
      <div 
        className="absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full pointer-events-none opacity-40 transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${colors.gradientStart}, ${colors.gradientEnd})` }}
      />
      
      <div className="relative z-10 flex items-start gap-4">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
          style={{ 
            background: `rgba(${colors.border}, 0.1)`,
            borderColor: `rgba(${colors.border}, 0.2)`,
            color: colors.iconColor
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">{subtitle}</p>
          
          <div className="flex items-end gap-2">
            <span className="text-xl font-black tracking-tight" style={{ color: colors.iconColor }}>
              {metric}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              {metricLabel}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductShowcase = () => {
  return (
    <div className="hidden lg:flex w-[60%] relative bg-[#F7F9FC] dark:bg-[#070B14] overflow-hidden items-center justify-center p-12 transition-colors duration-500">
      
      {/* Abstract Animated Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Study Blue Glow */}
        <motion.div 
          animate={{ 
            x: [0, 50, 0], 
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px]" 
        />
        {/* Code Purple Glow */}
        <motion.div 
          animate={{ 
            x: [0, -40, 0], 
            y: [0, 40, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[120px]" 
        />
        {/* Opportunity Orange Glow */}
        <motion.div 
          animate={{ 
            x: [0, 30, 0], 
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 4 }}
          className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-orange-500/10 dark:bg-orange-500/5 blur-[100px]" 
        />
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTQ4LDE2MywxODQsMC4wNSkiLz48L3N2Zz4=')] bg-[length:32px_32px]" />
      </div>

      {/* Main Composition */}
      <div className="relative z-10 w-full max-w-[600px] flex flex-col pt-8">
        
        {/* Showcase Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 ml-8"
        >
          <h2 className="text-3xl font-light text-slate-800 dark:text-slate-200 tracking-tight leading-tight">
            Intelligence for your<br/>
            <span className="font-bold text-slate-900 dark:text-white">entire student journey.</span>
          </h2>
        </motion.div>

        {/* Asymmetric Cards */}
        <div className="relative h-[480px] w-full">
          
          {/* Study Card */}
          <AgentPreviewCard
            title="Study Agent"
            subtitle="Personalized learning paths"
            icon={BookOpen}
            metric="82%"
            metricLabel="Mastery"
            delay={0.2}
            className="absolute top-0 left-4 w-72 bg-white/80 dark:bg-[#111827]/80"
            colors={{
              border: "59, 130, 246", // blue-500
              shadow: "59, 130, 246",
              iconColor: "#3B82F6",
              gradientStart: "rgba(59,130,246,0.3)",
              gradientEnd: "rgba(6,182,212,0.3)" // cyan-500
            }}
          />

          {/* Code Card */}
          <AgentPreviewCard
            title="Code Agent"
            subtitle="AI-driven code reviews"
            icon={Code2}
            metric="0"
            metricLabel="Errors"
            delay={0.4}
            className="absolute top-36 right-4 w-72 bg-white/80 dark:bg-[#111827]/80 z-20"
            colors={{
              border: "168, 85, 247", // purple-500
              shadow: "168, 85, 247",
              iconColor: "#A855F7",
              gradientStart: "rgba(168,85,247,0.3)",
              gradientEnd: "rgba(236,72,153,0.3)" // pink-500
            }}
          />

          {/* Opportunity Card */}
          <AgentPreviewCard
            title="Opportunity Agent"
            subtitle="Career & Internship discovery"
            icon={Briefcase}
            metric="12"
            metricLabel="High Matches"
            delay={0.6}
            className="absolute bottom-8 left-16 w-72 bg-white/80 dark:bg-[#111827]/80 z-10"
            colors={{
              border: "245, 158, 11", // amber-500
              shadow: "245, 158, 11",
              iconColor: "#F59E0B",
              gradientStart: "rgba(245,158,11,0.3)",
              gradientEnd: "rgba(249,115,22,0.3)" // orange-500
            }}
          />
          
          {/* Decorative Connecting Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ stroke: 'currentColor' }}>
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.1 }}
              transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
              d="M 160 140 C 200 160, 320 160, 350 200" 
              fill="none" 
              strokeWidth="2"
              className="text-slate-400 dark:text-slate-500"
              strokeDasharray="4 4"
            />
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.1 }}
              transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
              d="M 350 280 C 320 320, 250 340, 200 350" 
              fill="none" 
              strokeWidth="2"
              className="text-slate-400 dark:text-slate-500"
              strokeDasharray="4 4"
            />
          </svg>

        </div>
      </div>

      {/* Subtle Footer */}
      <div className="absolute bottom-6 right-8 opacity-60">
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          © 2026 Campus Cognition. All rights reserved.
        </p>
      </div>

    </div>
  );
};

export default ProductShowcase;
