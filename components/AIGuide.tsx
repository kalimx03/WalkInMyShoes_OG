/**
 * AIGuide.tsx — Fully self-contained chat panel
 *
 * ARCHITECTURE CHANGE: AIGuide owns ALL its own state internally.
 * No more shared history prop causing race conditions.
 * ARAuditor triggers it via imperative ref: aiGuideRef.current.sendMessage(text)
 *
 * For simulation scenes: uses same self-contained approach, history prop ignored.
 */

import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { geminiService } from '../services/bedrock';
import { ChatMessage } from '../types';

export interface AIGuideHandle {
  sendExternal: (text: string) => void;
}

interface Props {
  context: string;
  mode?: 'fixed' | 'absolute';
  sidebarOffset?: number;
  // Legacy props for simulation scenes (kept for compatibility, not used internally)
  history?: ChatMessage[];
  onUpdateHistory?: (messages: ChatMessage[]) => void;
}

const PANEL_W = 340;

const AIGuide = forwardRef<AIGuideHandle, Props>(({
  context,
  mode = 'absolute',
  sidebarOffset = 0,
}, ref) => {
  const SIDEBAR_W = sidebarOffset;

  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [input, setInput]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const chatRef      = useRef<any>(null);
  const isLoadingRef = useRef(false);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const initDone     = useRef(false);

  const SUGGESTIONS = [
    'Explain the detected issues',
    'What are WCAG 2.1 contrast rules?',
    'How do I fix ramp slope issues?',
    'ADA §404 doorway requirements?',
  ];

  // ── Init ──────────────────────────────────────────────────────
  useEffect(() => {
    // Fresh chat session on every mount/context change
    chatRef.current = geminiService.createGuideChat(context, []);
    isLoadingRef.current = false;
    setIsLoading(false);

    if (!initDone.current) {
      initDone.current = true;
      setMessages([{
        role: 'model',
        text: "Hi! I'm your AI accessibility expert. I can explain ADA standards, WCAG rules, interpret scan results, and advise on remediation. How can I help?",
        timestamp: Date.now(),
      }]);
    }
  }, [context]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll ───────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [messages, isLoading]);

  // ── Imperative handle — lets ARAuditor call sendExternal ──────
  useImperativeHandle(ref, () => ({
    sendExternal: (text: string) => {
      if (!text.trim()) return;
      setIsExpanded(true);
      sendMessage(text);
    },
  }));

  // ── Core send ─────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!chatRef.current || isLoadingRef.current) return;

    const userMsg: ChatMessage = { role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const res = await chatRef.current.sendMessage({ message: text });
      const reply = res?.text?.trim() || "I couldn't generate a response. Please try again.";
      setMessages(prev => [...prev, { role: 'model', text: reply, timestamp: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'model',
        text: 'Connection issue — please try again.',
        timestamp: Date.now(),
      }]);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoadingRef.current) return;
    setInput('');
    sendMessage(trimmed);
  }, [input, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const posClass = mode === 'fixed' ? 'fixed' : 'absolute';
  const topClass  = mode === 'fixed' ? 'top-[57px]' : 'top-0';

  return (
    <>
      {/* Toggle tab */}
      <div
        className={`${posClass} z-[70] flex items-center`}
        style={{ right: SIDEBAR_W + (isExpanded ? PANEL_W : 0), top: '50%', transform: 'translateY(-50%)' }}
      >
        <button
          onClick={() => setIsExpanded(e => !e)}
          className="bg-slate-900/95 border border-slate-700 border-r-0 rounded-l-2xl px-2 h-14 text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center shadow-xl"
        >
          <span className={`font-bold text-xs transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`}>
            {isExpanded ? '▶' : '◀'}
          </span>
        </button>
      </div>

      {/* Panel */}
      <div
        className={`${posClass} ${topClass} bottom-0 z-[65] flex flex-col shadow-2xl transition-all duration-300 ease-in-out`}
        style={{
          right: SIDEBAR_W,
          width: isExpanded ? PANEL_W : 0,
          opacity: isExpanded ? 1 : 0,
          pointerEvents: isExpanded ? 'auto' : 'none',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #0a0c13 0%, #0c0e16 100%)',
          borderLeft: '1px solid rgba(99,102,241,0.15)',
        }}
      >
        {/* Header */}
        <div className="flex-none px-4 py-3 border-b border-indigo-900/30 bg-gradient-to-r from-indigo-950/60 to-transparent flex items-center gap-3">
          <div className="relative w-9 h-9 flex-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-base shadow-lg">🤖</div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white tracking-tight leading-none">AI Expert Guide</p>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[.2em] mt-0.5">
              {isLoading ? '● Thinking...' : '● Active Insight'}
            </p>
          </div>
          <button onClick={() => setIsExpanded(false)}
            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-slate-300 flex items-center justify-center text-xs transition-all flex-none">✕</button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 ai-scroll">
          {messages.filter(m => !m.isHidden).map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-5 h-5 rounded-lg bg-indigo-600/30 flex items-center justify-center text-[10px] mr-1.5 mt-1 flex-none">🤖</div>
              )}
              <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-[12px] leading-relaxed break-words ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/40 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-5 h-5 rounded-lg bg-indigo-600/30 flex items-center justify-center text-[10px] mr-1.5 flex-none">🤖</div>
              <div className="bg-slate-800/90 border border-slate-700/40 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }}/>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.filter(m => !m.isHidden).length <= 1 && !isLoading && (
          <div className="flex-none px-3 pb-2 flex gap-1.5 overflow-x-auto hide-scrollbar">
            {SUGGESTIONS.map((q, i) => (
              <button key={i} onClick={() => { setInput(''); sendMessage(q); }} disabled={isLoading}
                className="flex-none text-[8px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1.5 rounded-full hover:bg-indigo-500/25 transition-all whitespace-nowrap active:scale-95 disabled:opacity-40">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex-none p-3 pt-2 border-t border-slate-800/60 bg-slate-950/50">
          <div className="flex gap-2">
            <input ref={inputRef} type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your guide..."
              disabled={isLoading}
              className="flex-1 min-w-0 bg-slate-800/70 border border-slate-700/60 rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition-all disabled:opacity-50"
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all active:scale-90 flex-none">↑</button>
          </div>
        </div>
      </div>

      <style>{`
        .ai-scroll::-webkit-scrollbar{width:3px}
        .ai-scroll::-webkit-scrollbar-track{background:transparent}
        .ai-scroll::-webkit-scrollbar-thumb{background:rgba(99,102,241,.3);border-radius:10px}
        .hide-scrollbar::-webkit-scrollbar{display:none}
        .hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </>
  );
});

AIGuide.displayName = 'AIGuide';
export default AIGuide;
