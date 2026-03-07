
import React, { useState, useEffect } from 'react';
import { AppView, EmpathyStats, ChatMessage } from './types';
import { SCENARIOS } from './constants';
import Layout from './components/Layout';
import VisualImpairmentScene from './components/VisualImpairmentScene';
import HearingLossScene from './components/HearingLossScene';
import MotorDisabilityScene from './components/MotorDisabilityScene';
import ColorBlindnessScene from './components/ColorBlindnessScene';
import ARAuditor from './components/ARAuditor';
import ImpactDashboard from './components/ImpactDashboard';
import Onboarding from './components/Onboarding';
import {
  getCurrentUser, handleAuthCallback, isCognitoConfigured,
  signIn, signUp, signOut, type CognitoUser
} from './services/auth';
import { saveSession, isBackendConfigured } from './services/api';

const STORAGE_KEY   = 'walkinmyshoes_stats';
const ONBOARDING_KEY = 'walkinmyshoes_onboarding_v1';

const defaultStats: EmpathyStats = {
  scenariosCompleted: 0,
  empathyScore: 0,
  auditReportsGenerated: 0,
  timeSpentMinutes: 0,
  chatHistories: {}
};

const App: React.FC = () => {
  const [currentView, setCurrentView]     = useState<AppView>(AppView.LANDING);
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem(ONBOARDING_KEY) !== 'true');
  const [user, setUser]                   = useState<CognitoUser | null>(() => getCurrentUser());
  const [authLoading, setAuthLoading]     = useState(false);

  const [stats, setStats] = useState<EmpathyStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    } catch { return defaultStats; }
  });

  // ── Handle Cognito OAuth callback (?code=...) ──────────────
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      setAuthLoading(true);
      handleAuthCallback(code).then((u) => {
        if (u) setUser(u);
        window.history.replaceState({}, '', window.location.pathname);
        setAuthLoading(false);
      });
    }
  }, []);

  // ── Persist stats locally + sync to AWS DynamoDB ──────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    if (user && isBackendConfigured()) {
      saveSession(user.sub, stats).catch(() => {});
    }
  }, [stats, user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const completeScenario = (score: number) => {
    setStats(prev => ({
      ...prev,
      scenariosCompleted: prev.scenariosCompleted + 1,
      empathyScore: Math.round((prev.empathyScore + score) / (prev.scenariosCompleted ? 2 : 1)),
      timeSpentMinutes: prev.timeSpentMinutes + 8
    }));
    setCurrentView(AppView.DASHBOARD);
  };

  const updateChatHistory = (scenarioId: string, messages: ChatMessage[]) => {
    setStats(prev => ({
      ...prev,
      chatHistories: { ...prev.chatHistories, [scenarioId]: messages }
    }));
  };

  // ── Auth loading screen ────────────────────────────────────
  if (authLoading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🔐</div>
        </div>
        <div className="text-center">
          <p className="text-white font-black text-lg uppercase tracking-widest">Authenticating</p>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2 animate-pulse">
            Establishing AWS Cognito session...
          </p>
        </div>
      </div>
    );
  }

  // ── Page content ───────────────────────────────────────────
  const renderContent = () => {
    switch (currentView) {

      // ── LANDING ─────────────────────────────────────────────
      case AppView.LANDING:
        return (
          <div className="relative h-full flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-slate-950">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center max-w-5xl">
              {/* AWS stack badge */}
              {isBackendConfigured() && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_6px_#fbbf24]"></span>
                  <span className="text-amber-400 font-black uppercase tracking-[0.2em] text-[9px]">
                    AWS Stack — Lambda · DynamoDB · CloudFront · Cognito
                  </span>
                </div>
              )}

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8 backdrop-blur-sm">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></span>
                <span className="text-indigo-400 font-black uppercase tracking-[0.25em] text-[10px]">Immersive Experience v2.0</span>
              </div>

              <h1 className="text-6xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tighter text-white">
                Empower through <br />
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                  perspective.
                </span>
              </h1>

              <p className="text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed font-medium">
                Step into the shoes of others through interactive 3D simulations and analyze real-world barriers with high-precision AI.
              </p>

              {/* Logged-in user greeting */}
              {user && (
                <div className="mb-8 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-full">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"></span>
                  <span className="text-emerald-400 text-sm font-bold">
                    Welcome back, {user.name || user.email}
                  </span>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6">
                <button
                  onClick={() => setCurrentView(AppView.SIMULATION_SELECTOR)}
                  className="group relative bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-600/40 transition-all hover:-translate-y-2 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  Start Training
                </button>
                <button
                  onClick={() => setCurrentView(AppView.AR_AUDITOR)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-12 py-6 rounded-[2rem] font-black text-lg border border-slate-800 transition-all hover:-translate-y-2 active:scale-95"
                >
                  AR Auditor
                </button>
              </div>

              {/* Auth section */}
              {!user && (
                <div className="mt-10 flex gap-4 flex-wrap justify-center">
                  {isCognitoConfigured() ? (
                    <>
                      <button
                        onClick={signIn}
                        className="group flex items-center gap-2 text-xs font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-600/10 px-6 py-3 rounded-2xl"
                      >
                        🔐 Sign In
                      </button>
                      <button
                        onClick={signUp}
                        className="group flex items-center gap-2 text-xs font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-600/10 px-6 py-3 rounded-2xl"
                      >
                        ✨ Create Account
                      </button>
                    </>
                  ) : (
                    <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mt-2">
                      Add VITE_COGNITO credentials to .env to enable login
                    </p>
                  )}
                </div>
              )}
              {user && (
                <button onClick={signOut} className="mt-8 text-[10px] font-black text-slate-700 hover:text-rose-400 transition-colors uppercase tracking-widest">
                  ← Sign Out
                </button>
              )}

              <button
                onClick={() => setShowOnboarding(true)}
                className="mt-8 text-[10px] font-black text-slate-700 uppercase tracking-widest hover:text-indigo-400 transition-colors"
              >
                // Re-Calibrate Neural HUD
              </button>
            </div>
          </div>
        );

      // ── SIMULATION SELECTOR ──────────────────────────────────
      case AppView.SIMULATION_SELECTOR:
        return (
          <div className="p-12 max-w-7xl mx-auto min-h-full">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                <span className="text-indigo-400 font-black uppercase tracking-widest text-[10px]">4 Scenarios Available</span>
              </div>
              <h2 className="text-5xl font-black text-white tracking-tight">Select Simulation</h2>
              <p className="text-slate-400 mt-4 text-lg">Choose an immersive environment to begin your empathy journey.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {SCENARIOS.map((scenario) => (
                <div
                  key={scenario.id}
                  className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] p-8 hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col shadow-2xl hover:-translate-y-2 hover:shadow-indigo-500/10"
                  onClick={() => setCurrentView(scenario.id as AppView)}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-cyan-600/0 group-hover:from-indigo-600/5 group-hover:to-cyan-600/5 transition-all rounded-[2.5rem]"></div>

                  {scenario.isNew && (
                    <div className="absolute top-6 right-6 px-3 py-1 bg-cyan-500 text-[8px] font-black text-white uppercase rounded-full shadow-lg z-20 shadow-cyan-500/40">
                      New Experience
                    </div>
                  )}

                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-indigo-600 group-hover:scale-110 transition-all shadow-xl">
                    {scenario.icon}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                      scenario.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      scenario.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {scenario.difficulty}
                    </span>
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{scenario.timeEstimate}</span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{scenario.title}</h3>
                  <p className="text-slate-400 leading-relaxed mb-8 text-sm font-medium flex-1">{scenario.description}</p>

                  <div className="mt-auto flex items-center gap-3 text-indigo-400 font-black text-[10px] uppercase tracking-widest group-hover:gap-6 transition-all">
                    Launch VR <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ── SCENES ───────────────────────────────────────────────
      case AppView.VISION_SCENE:
        return <VisualImpairmentScene
          onComplete={completeScenario}
          history={stats.chatHistories[AppView.VISION_SCENE] || []}
          onUpdateHistory={(msgs) => updateChatHistory(AppView.VISION_SCENE, msgs)}
        />;

      case AppView.HEARING_SCENE:
        return <HearingLossScene
          onComplete={completeScenario}
          history={stats.chatHistories[AppView.HEARING_SCENE] || []}
          onUpdateHistory={(msgs) => updateChatHistory(AppView.HEARING_SCENE, msgs)}
        />;

      case AppView.MOTOR_SCENE:
        return <MotorDisabilityScene
          onComplete={completeScenario}
          history={stats.chatHistories[AppView.MOTOR_SCENE] || []}
          onUpdateHistory={(msgs) => updateChatHistory(AppView.MOTOR_SCENE, msgs)}
        />;

      case AppView.COLOR_BLIND_SCENE:
        return <ColorBlindnessScene
          onComplete={completeScenario}
          history={stats.chatHistories[AppView.COLOR_BLIND_SCENE] || []}
          onUpdateHistory={(msgs) => updateChatHistory(AppView.COLOR_BLIND_SCENE, msgs)}
        />;

      case AppView.AR_AUDITOR:
        return <ARAuditor
          history={[]}
          onUpdateHistory={(msgs) => updateChatHistory(AppView.AR_AUDITOR, msgs)}
          onAuditComplete={() => setStats(s => ({ ...s, auditReportsGenerated: s.auditReportsGenerated + 1 }))}
        />;

      case AppView.DASHBOARD:
        return <ImpactDashboard stats={stats} />;

      default:
        return null;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      user={user}
      onSignIn={isCognitoConfigured() ? signIn : undefined}
      onSignOut={signOut}
    >
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      {renderContent()}
    </Layout>
  );
};

export default App;
