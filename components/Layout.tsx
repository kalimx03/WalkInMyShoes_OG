
import React, { useState } from 'react';
import { AppView } from '../types';

interface CognitoUser {
  sub: string;
  email: string;
  name?: string;
}

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user?: CognitoUser | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, user, onSignIn, onSignOut }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Simulations', view: AppView.SIMULATION_SELECTOR, icon: '🥽' },
    { label: 'AR Auditor', view: AppView.AR_AUDITOR, icon: '🛰️' },
    { label: 'My Impact', view: AppView.DASHBOARD, icon: '📊' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* ── Persistent Navigation Header ── */}
      <header className="flex-none h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/60 flex items-center justify-between px-6 z-50 shadow-2xl">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate(AppView.LANDING)}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all group-hover:scale-110">
            W
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent leading-none">
              WalkInMyShoes
            </h1>
            <span className="text-[8px] text-slate-600 font-black uppercase tracking-[0.3em] leading-none mt-0.5">
              Empathy Engine
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ label, view, icon }) => (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                currentView === view
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Right Side: Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 px-3 py-1.5 rounded-xl">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_6px_#34d399]"></span>
                <span className="text-xs text-slate-300 font-bold">{user.name || user.email?.split('@')[0]}</span>
              </div>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="text-[10px] text-slate-600 hover:text-rose-400 transition-colors font-black uppercase tracking-widest"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : onSignIn ? (
            <button
              onClick={onSignIn}
              className="hidden md:flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-white transition-all uppercase tracking-widest border border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-600/10 px-4 py-2 rounded-xl"
            >
              <span>🔐</span> Sign In
            </button>
          ) : null}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className={`block w-5 h-0.5 bg-current transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-current transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-current transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden flex-none bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 z-40 px-4 py-4 space-y-2">
          {navItems.map(({ label, view, icon }) => (
            <button
              key={view}
              onClick={() => { onNavigate(view); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                currentView === view
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
          {!user && onSignIn && (
            <button onClick={() => { onSignIn(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/10 transition-all">
              🔐 Sign In with AWS Cognito
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 relative overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
