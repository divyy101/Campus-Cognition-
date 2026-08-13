import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Code2, 
  Briefcase, 
  GraduationCap, 
  Compass, 
  User, 
  Activity,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Study Agent', path: '/study', icon: BookOpen },
    { name: 'Code Lab', path: '/code-lab', icon: Code2 },
    { name: 'Internships', path: '/internships', icon: Briefcase },
    { name: 'Scholarships', path: '/scholarships', icon: GraduationCap },
    { name: 'Opportunities', path: '/opportunities', icon: Compass },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Activity Log', path: '/activity', icon: Activity },
  ];

  return (
    <motion.aside 
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-64 glass-card text-white min-h-screen flex flex-col border-r border-white/5 shadow-2xl shrink-0 z-40 relative m-4 rounded-[28px] overflow-hidden"
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div>
          <h1 className="font-extrabold text-[15px] tracking-tight text-white">Campus Cognition</h1>
          <p className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-white/10 border border-white/10 rounded-2xl backdrop-blur-md"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {isActive && (
                     <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-r-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-emerald-400' : 'group-hover:text-emerald-400 transition-colors'}`} />
                  <span className="relative z-10 tracking-wide">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="p-4 border-t border-white/5 bg-black/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/5 text-emerald-400 font-bold flex items-center justify-center border border-white/10 text-xs shadow-inner">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate tracking-wide">{user.username}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
