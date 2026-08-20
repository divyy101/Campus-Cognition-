import React, { useState } from 'react';
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
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--text-primary)] leading-none">Campus Cognition</h1>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Intelligence Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors relative ${
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--accent)] rounded-r-full" />
                  )}
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="px-3 py-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-sunken)] text-[var(--text-secondary)] font-semibold flex items-center justify-center text-xs border border-[var(--border)]">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{user.username}</p>
                <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-2 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 w-64 h-full bg-[var(--sidebar-bg)] backdrop-blur-xl border-r border-[var(--border)] flex flex-col transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--surface-sunken)] text-[var(--text-muted)]"
          aria-label="Close navigation"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[240px] bg-[var(--sidebar-bg)] backdrop-blur-xl border-r border-[var(--border)] min-h-screen flex-col shrink-0 z-20">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
