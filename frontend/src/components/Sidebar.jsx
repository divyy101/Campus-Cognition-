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
import { motion } from 'framer-motion';

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
      className="w-64 bg-[var(--surface)] text-[var(--text-primary)] min-h-screen flex flex-col border-r border-[var(--border)] shrink-0 z-40 relative overflow-hidden"
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-[var(--border-subtle)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="font-extrabold text-[15px] tracking-tight">Cognition</h1>
          <p className="text-[10px] font-bold text-[var(--accent)] tracking-widest uppercase opacity-80">Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-subtle)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                     <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--accent)] rounded-r-full" />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 transition-colors duration-300 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`} />
                  <span className="relative z-10 tracking-wide">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--surface)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold flex items-center justify-center border border-[var(--border-strong)] text-xs shadow-sm">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate tracking-wide">{user.username}</p>
                <p className="text-[10px] text-[var(--text-secondary)] truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log out"
              className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--surface-elevated)] rounded-xl transition-all"
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
