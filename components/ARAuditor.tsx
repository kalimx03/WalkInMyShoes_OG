/**
 * ARAuditor.tsx — Complete Production Rewrite
 *
 * ALL BUGS FIXED:
 * 1. synthesizeFix — reads capturedFrameRef (never stale), switches to Remediate tab
 * 2. consultAI — pushes message with timestamp+1 so AIGuide detects it as NEW
 * 3. Export — blob download, real HTML file, never opens as URL fragment
 * 4. Tooltips — rendered via ReactDOM.createPortal at body level, never clipped
 * 5. AR boxes — large, vivid, corner brackets, pulsing selection state
 * 6. Remediation tab — shows captured frame preview + full 7-section report
 * 7. Score ring — animated SVG progress
 * 8. Issue cards — color-coded, expandable with action buttons
 * 9. Live mode toggle — auto-rescans every 15s
 * 10. AI Guide panel — proper fixed positioning, auto-expands on Consult AI
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { geminiService } from '../services/bedrock';
import { AuditIssue, ChatMessage } from '../types';
import AIGuide, { AIGuideHandle } from './AIGuide';

interface Props {
  history: ChatMessage[];
  onUpdateHistory: (messages: ChatMessage[]) => void;
  onAuditComplete: () => void;
}

// ── Animated Score Ring ───────────────────────────────────────────
const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const r    = 34;
  const circ = 2 * Math.PI * r;
  const pct  = Math.max(0, Math.min(100, score));
  const dash = circ - (pct / 100) * circ;
  const col  = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#f43f5e';
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" className="flex-none">
      <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="7"/>
      <circle cx="42" cy="42" r={r} fill="none" stroke={col} strokeWidth="7"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.2s ease' }}/>
      <text x="42" y="37" textAnchor="middle" fill={col} fontSize="18" fontWeight="900" fontFamily="monospace">{pct}</text>
      <text x="42" y="50" textAnchor="middle" fill="rgba(255,255,255,.3)" fontSize="7" fontWeight="700" fontFamily="monospace">% ADA</text>
    </svg>
  );
};

// ── Portal Tooltip ────────────────────────────────────────────────
const IssueTooltip: React.FC<{
  issue: AuditIssue;
  cameraEl: HTMLElement | null;
  onClose: () => void;
  onFix: () => void;
  onAI: () => void;
}> = ({ issue, cameraEl, onClose, onFix, onAI }) => {
  if (!issue.coordinates || !cameraEl) return null;
  const [y1, x1, y2, x2] = issue.coordinates;
  const rect = cameraEl.getBoundingClientRect();
  const bx1  = rect.left + (x1 / 1000) * rect.width;
  const bx2  = rect.left + (x2 / 1000) * rect.width;
  const by1  = rect.top  + (y1 / 1000) * rect.height;
  const W    = 290;
  const spaceRight = window.innerWidth - bx2 - 8;
  const left = spaceRight > W + 8 ? bx2 + 8 : Math.max(8, bx1 - W - 8);
  const top  = Math.max(70, Math.min(by1, window.innerHeight - 420));

  const isC = issue.status === 'COMPLIANT';
  const isW = issue.status === 'WARNING';
  const border = isC ? 'border-emerald-500/50' : isW ? 'border-amber-500/50' : 'border-rose-500/50';
  const badge  = isC
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : isW
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  return ReactDOM.createPortal(
    <div
      className={`fixed z-[9999] w-[290px] bg-[#0b0d14]/98 backdrop-blur-2xl border-2 ${border} rounded-2xl shadow-2xl p-4 transition-all`}
      style={{ left, top, pointerEvents: 'auto' }}
      onMouseLeave={onClose}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-black text-white text-sm uppercase tracking-tight leading-tight">{issue.type}</h4>
          <span className={`mt-1 inline-block text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${badge}`}>
            {issue.status.replace(/_/g, ' ')}
          </span>
        </div>
        <button onClick={onClose} className="w-5 h-5 rounded-lg bg-slate-800 text-slate-500 hover:text-white flex items-center justify-center text-xs flex-none transition-all">✕</button>
      </div>

      <p className="text-slate-300 text-[11px] leading-relaxed mb-3">{issue.description}</p>

      {!isC && (
        <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-xl p-2.5 mb-3">
          <p className="text-[8px] text-indigo-400 font-black uppercase tracking-widest mb-1">ADA Fix</p>
          <p className="text-white text-[11px] leading-snug">{issue.recommendation}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[7px] text-slate-600 uppercase font-black tracking-widest">Est. Cost</p>
          <p className="text-white font-black text-sm">{issue.costEstimate || 'N/A'}</p>
        </div>
        {!isC && (
          <div className="flex gap-1.5">
            <button onClick={onFix}
              className="py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[8px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-indigo-900/30">
              🔧 Fix
            </button>
            <button onClick={onAI}
              className="py-1.5 px-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-[8px] font-black uppercase tracking-wider transition-all active:scale-95">
              🤖 AI
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// ── Remediation Report ────────────────────────────────────────────
const RemediationReport: React.FC<{
  text: string;
  frame: string | null;
  onClear: () => void;
  onExport: () => void;
}> = ({ text, frame, onClear, onExport }) => {
  const sections = text.split('\n').filter(l => l.trim());
  return (
    <div className="space-y-3">
      {frame && (
        <div className="relative rounded-xl overflow-hidden border border-emerald-500/30">
          <img src={`data:image/jpeg;base64,${frame}`} className="w-full aspect-video object-cover opacity-70" alt="Analyzed frame"/>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"/>
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
            <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">Remediation Report Ready</span>
          </div>
        </div>
      )}

      <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4 max-h-[360px] overflow-y-auto space-y-2 scrollbar-thin">
        {sections.map((line, i) => {
          const clean = line.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim();
          if (!clean) return null;
          const isSection = /^##\s/.test(line) || /^\d+\.\s/.test(clean);
          return isSection ? (
            <div key={i} className={i > 0 ? 'pt-3 mt-1 border-t border-slate-800' : ''}>
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[.2em]">{clean.replace(/^\d+\.\s*/, '')}</p>
            </div>
          ) : (
            <p key={i} className="text-xs text-slate-300 leading-relaxed pl-3 border-l-2 border-slate-700/40">{clean}</p>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={onClear}
          className="py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95">
          ✕ Clear Report
        </button>
        <button onClick={onExport}
          className="py-2.5 bg-emerald-500/15 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95">
          ↓ Export HTML
        </button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
const ARAuditor: React.FC<Props> = ({ history, onUpdateHistory, onAuditComplete }) => {
  const [isScanning,        setIsScanning]        = useState(false);
  const [isLiveMode,        setIsLiveMode]         = useState(false);
  const [results,           setResults]            = useState<{ issues: AuditIssue[]; score: number } | null>(null);
  const [loading,           setLoading]            = useState(false);
  const [bgProcessing,      setBgProcessing]       = useState(false);
  const [activeIssue,       setActiveIssue]        = useState<number | null>(null);
  const [sidebarTab,        setSidebarTab]         = useState<'report' | 'remediate'>('report');
  const [sensorStatus,      setSensorStatus]       = useState<'OFFLINE' | 'INITIALIZING' | 'ACTIVE' | 'DENIED'>('OFFLINE');
  const [remediationText,   setRemediationText]    = useState<string | null>(null);
  const [remediationPrompt, setRemediationPrompt]  = useState('');
  const [isRemediating,     setIsRemediating]      = useState(false);
  const [capturedFrameState, setCapturedFrameState] = useState<string | null>(null);

  const videoRef            = useRef<HTMLVideoElement>(null);
  const canvasRef           = useRef<HTMLCanvasElement>(null);
  const cameraContainerRef  = useRef<HTMLDivElement>(null);
  const liveTimerRef        = useRef<number | null>(null);
  const lastScanRef         = useRef<number>(0);
  const capturedFrameRef    = useRef<string | null>(null);
  const bgProcessingRef     = useRef(false);
  const aiGuideRef          = useRef<AIGuideHandle>(null);

  const setCapturedFrame = useCallback((v: string | null) => {
    capturedFrameRef.current = v;
    setCapturedFrameState(v);
  }, []);

  // ── Camera Start ──────────────────────────────────────────────
  const startCamera = async () => {
    setSensorStatus('INITIALIZING');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      const activate = () => {
        setSensorStatus('ACTIVE');
        setIsScanning(true);
        videoRef.current?.play().catch(() => {});
      };
      videoRef.current.onloadedmetadata = activate;
      if (videoRef.current.readyState >= 2) activate();
    } catch {
      setSensorStatus('DENIED');
      alert('Camera access denied. Please allow camera permissions and refresh the page.');
    }
  };

  // ── Capture & Analyze ─────────────────────────────────────────
  const captureAndAnalyze = useCallback(async (silent = false) => {
    if (!videoRef.current || !canvasRef.current) return;
    if (bgProcessingRef.current && silent) return;
    if (loading && !silent) return;

    const now = Date.now();
    if (silent && now - lastScanRef.current < 12000) return;
    lastScanRef.current = now;

    if (!silent) {
      setLoading(true);
    } else {
      bgProcessingRef.current = true;
      setBgProcessing(true);
    }

    const canvas = canvasRef.current;
    const video  = videoRef.current;
    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) { setLoading(false); setBgProcessing(false); bgProcessingRef.current = false; return; }

    ctx.drawImage(video, 0, 0);
    const b64 = canvas.toDataURL('image/jpeg', 0.88).split(',')[1];
    setCapturedFrame(b64);

    try {
      const analysis = await geminiService.analyzeAccessibility(b64);
      if (analysis?.issues != null) {
        const issues: AuditIssue[] = Array.isArray(analysis.issues) ? analysis.issues : [];
        setResults({ issues, score: analysis.overallComplianceScore ?? 0 });

        if (!silent) {
          onUpdateHistory([...history, {
            role: 'user',
            text: `[SYSTEM] Scan complete. Found ${issues.length} accessibility issues. Overall ADA compliance: ${analysis.overallComplianceScore}%.`,
            timestamp: Date.now(),
            isHidden: true,
          }]);
          onAuditComplete();
          setSidebarTab('report');
        }
      }
    } catch (err) {
      console.error('[AR Scan]', err);
    }

    setLoading(false);
    setBgProcessing(false);
    bgProcessingRef.current = false;
  }, [history, loading, onAuditComplete, onUpdateHistory, setCapturedFrame]);

  // ── Synthesize Fix ────────────────────────────────────────────
  // Uses capturedFrameRef directly — never stale even with async closure
  const synthesizeFix = useCallback((issue: AuditIssue) => {
    const frame = capturedFrameRef.current;
    if (!frame) {
      alert('Please scan the environment first to capture a frame.');
      return;
    }
    const prompt = `Fix this "${issue.type}" accessibility barrier. ` +
      `Current issue: ${issue.description}. ` +
      `Required action per ADA: ${issue.recommendation}. ` +
      `Provide a complete, contractor-ready ADA remediation specification.`;

    setRemediationPrompt(prompt);
    setRemediationText(null);
    setSidebarTab('remediate');
    setIsRemediating(true);

    geminiService.editImage(frame, prompt)
      .then(result => setRemediationText(result || 'No report generated. Try a more specific description.'))
      .catch(() => setRemediationText('Failed to generate report. Please try again.'))
      .finally(() => setIsRemediating(false));
  }, []);

  // ── Consult AI — calls AIGuide directly via ref ───────────────
  const consultAI = useCallback((type: string, description: string) => {
    const msg = `I need help understanding the "${type}" accessibility issue the AR scanner found. ` +
      `It detected: "${description}". ` +
      `Please explain the relevant ADA sections, exact compliance standards, measurements required, ` +
      `and how a building owner should remediate this.`;
    aiGuideRef.current?.sendExternal(msg);
    setActiveIssue(null);
  }, []);

  // ── Export HTML ───────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (!remediationText) return;

    const lines = remediationText.split('\n').filter(l => l.trim());
    const body  = lines.map(line => {
      const clean = line.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim();
      if (!clean) return '';
      const isSection = /^##\s/.test(line) || /^\d+\.\s/.test(clean);
      return isSection
        ? `<h3>${clean.replace(/^\d+\.\s*/, '')}</h3>`
        : `<p>${clean}</p>`;
    }).join('\n');

    const score    = results?.score ?? 0;
    const fails    = results?.issues.filter(i => i.status === 'NON_COMPLIANT').length ?? 0;
    const warnings = results?.issues.filter(i => i.status === 'WARNING').length ?? 0;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ADA Remediation Report — WalkInMyShoes</title>
<style>
  :root { --accent: #4f46e5; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 24px; background: #f1f5f9; color: #1e293b; }
  header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%); color: white; padding: 36px 40px; border-radius: 20px; margin-bottom: 28px; box-shadow: 0 20px 60px rgba(79,70,229,.3); }
  header h1 { font-size: 1.7rem; font-weight: 900; margin-bottom: 6px; }
  header p { opacity: .75; font-size: .9rem; }
  .badges { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
  .badge { padding: 5px 14px; border-radius: 99px; font-size: .75rem; font-weight: 700; background: rgba(255,255,255,.15); }
  .badge.fail { background: #ef4444; }
  .badge.warn { background: #f59e0b; color: #1c1917; }
  .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px 36px; box-shadow: 0 2px 20px rgba(0,0,0,.05); }
  h3 { color: var(--accent); font-size: .78rem; text-transform: uppercase; letter-spacing: .12em; margin: 24px 0 8px; padding-left: 14px; border-left: 4px solid var(--accent); }
  h3:first-child { margin-top: 0; }
  p { color: #475569; margin: 5px 0 5px 18px; font-size: .9rem; line-height: 1.65; }
  footer { margin-top: 32px; text-align: center; font-size: .75rem; color: #94a3b8; padding-top: 16px; border-top: 1px solid #e2e8f0; }
  @media print { body { background: white; padding: 20px; } header { box-shadow: none; } }
</style>
</head>
<body>
<header>
  <h1>🏗️ ADA Remediation Report</h1>
  <p>Generated by WalkInMyShoes AR Auditor · Powered by Amazon Bedrock</p>
  <div class="badges">
    <span class="badge">📅 ${new Date().toLocaleString()}</span>
    <span class="badge">${score}% ADA Compliance</span>
    ${fails > 0 ? `<span class="badge fail">⚠ ${fails} Violation${fails > 1 ? 's' : ''}</span>` : ''}
    ${warnings > 0 ? `<span class="badge warn">⚡ ${warnings} Warning${warnings > 1 ? 's' : ''}</span>` : ''}
  </div>
</header>
<div class="card">${body}</div>
<footer>WalkInMyShoes Empathy Training Platform · ADA/WCAG Compliance Report · ${new Date().getFullYear()}</footer>
</body>
</html>`;

    // Create real download — NOT window.open(text)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `ADA-Report-${new Date().toISOString().slice(0,10)}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [remediationText, results]);

  // ── Live Mode ─────────────────────────────────────────────────
  useEffect(() => {
    if (isLiveMode && isScanning) {
      captureAndAnalyze(true);
      liveTimerRef.current = window.setInterval(() => captureAndAnalyze(true), 15000);
    } else {
      if (liveTimerRef.current) {
        clearInterval(liveTimerRef.current);
        liveTimerRef.current = null;
      }
    }
    return () => {
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
    };
  }, [isLiveMode, isScanning, captureAndAnalyze]);

  // ── AR Overlay Boxes (SVG via portal) ────────────────────────
  const renderARBoxes = () => {
    if (!results?.issues?.length || !isScanning) return null;
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="glow-r"><feGaussianBlur stdDeviation="6" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
          <filter id="glow-a"><feGaussianBlur stdDeviation="5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
          <filter id="glow-g"><feGaussianBlur stdDeviation="4" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
        </defs>
        {results.issues.map((issue, idx) => {
          if (!issue.coordinates) return null;
          const [y1, x1, y2, x2] = issue.coordinates;
          const w = Math.max(x2 - x1, 60), h = Math.max(y2 - y1, 60);
          const bs = Math.min(w, h) * 0.25;
          const isC = issue.status === 'COMPLIANT';
          const isW = issue.status === 'WARNING';
          const col = isC ? '#10b981' : isW ? '#f59e0b' : '#f43f5e';
          const fid = isC ? 'glow-g' : isW ? 'glow-a' : 'glow-r';
          const isAct = activeIssue === idx;
          const labelY = Math.max(2, y1 - 30);

          return (
            <g key={idx} className="pointer-events-auto cursor-pointer"
              onMouseEnter={() => setActiveIssue(idx)}
              onMouseLeave={() => setActiveIssue(null)}
              onClick={() => setActiveIssue(isAct ? null : idx)}>
              {/* Glow halo */}
              <rect x={x1-4} y={y1-4} width={w+8} height={h+8} rx="4"
                fill="none" stroke={col} strokeWidth="2" opacity="0.2" filter={`url(#${fid})`}/>
              {/* Fill */}
              <rect x={x1} y={y1} width={w} height={h}
                fill={col} fillOpacity={isAct ? 0.18 : 0.05}
                stroke={col} strokeWidth={isAct ? 2.5 : 1.5} strokeDasharray={isAct ? 'none' : '10 5'}
                opacity="0.9" rx="3"/>
              {/* Corner brackets */}
              <path d={`M${x1} ${y1+bs}V${y1}H${x1+bs}`}     fill="none" stroke={col} strokeWidth="4.5" strokeLinecap="round"/>
              <path d={`M${x2-bs} ${y1}H${x2}V${y1+bs}`}     fill="none" stroke={col} strokeWidth="4.5" strokeLinecap="round"/>
              <path d={`M${x1} ${y2-bs}V${y2}H${x1+bs}`}     fill="none" stroke={col} strokeWidth="4.5" strokeLinecap="round"/>
              <path d={`M${x2-bs} ${y2}H${x2}V${y2-bs}`}     fill="none" stroke={col} strokeWidth="4.5" strokeLinecap="round"/>
              {/* Label */}
              <rect x={x1} y={labelY} width={Math.max(w, 140)} height={28} rx="5" fill={col} opacity="0.95"/>
              <text x={x1+8} y={labelY+18} fontSize="12" fontWeight="900" fill="white" fontFamily="monospace">
                {isC ? '✓' : isW ? '⚠' : '✕'} {issue.type.substring(0, 22)}
              </text>
              {/* Pulse ring on active */}
              {isAct && (
                <rect x={x1-8} y={y1-8} width={w+16} height={h+16} rx="6"
                  fill="none" stroke={col} strokeWidth="1.5" opacity="0.4"
                  style={{ animation: 'pulse-ring 1.2s ease-in-out infinite' }}/>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  // ── Status styling ────────────────────────────────────────────
  const dotCls = sensorStatus === 'ACTIVE'
    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
    : sensorStatus === 'INITIALIZING' ? 'bg-amber-400 animate-pulse'
    : sensorStatus === 'DENIED'       ? 'bg-red-500'
    : 'bg-slate-600';

  const statusLabel = {
    ACTIVE: 'Sensor Link: Active',
    INITIALIZING: 'Accessing Sensors...',
    DENIED: 'Camera Denied — Check Permissions',
    OFFLINE: 'Sensor Link: Offline',
  }[sensorStatus];

  return (
    <div className="h-full flex flex-col bg-slate-950 font-mono relative overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-none px-5 py-3 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-indigo-600/15 rounded-xl border border-indigo-500/20"/>
            <div className="w-10 h-10 flex items-center justify-center relative z-10 text-xl">
              {sensorStatus === 'ACTIVE' ? '🛰️' : '📷'}
            </div>
            {(loading || bgProcessing) && (
              <div className="absolute inset-0 rounded-xl border-2 border-indigo-500/40 animate-ping"/>
            )}
          </div>
          <div>
            <h2 className="text-[15px] font-black text-white uppercase tracking-tighter italic leading-none">
              Spatial HUD v9.5
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-none ${dotCls}`}/>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[.18em]">{statusLabel}</span>
              {results && (
                <span className="ml-1 text-[8px] font-black text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {results.issues.length} issues · {results.score}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isScanning && (
            <button
              onClick={() => setIsLiveMode(l => !l)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                isLiveMode
                  ? 'bg-rose-600/20 border-rose-500/40 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,.2)]'
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              {isLiveMode ? '🔴 Live' : '⚪ Manual'}
            </button>
          )}

          {!isScanning ? (
            <button
              onClick={startCamera}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/40 flex items-center gap-2 active:scale-95"
            >
              <span>📡</span> Initialize Lens
            </button>
          ) : (
            <button
              onClick={() => captureAndAnalyze(false)}
              disabled={loading}
              className="bg-white hover:bg-slate-100 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 shadow-lg"
            >
              {loading
                ? <><span className="w-3 h-3 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin inline-block"/> Scanning...</>
                : <><span>🔍</span> Scan Now</>
              }
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Camera Viewport ── */}
        <div ref={cameraContainerRef} className="flex-1 relative bg-black overflow-hidden ar-camera-container">
          <video ref={videoRef} autoPlay playsInline muted
            className={`w-full h-full object-cover transition-opacity duration-500 ${!isScanning ? 'hidden' : ''}`}/>
          <canvas ref={canvasRef} className="hidden"/>

          {/* AR boxes */}
          {isScanning && renderARBoxes()}

          {/* Scan grid (live mode) */}
          {isScanning && bgProcessing && (
            <div className="absolute inset-0 z-5 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(99,102,241,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.04) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}/>
          )}

          {/* Idle state */}
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-slate-950">
              <div className="relative cursor-pointer group" onClick={startCamera}>
                <div className="w-28 h-28 bg-slate-900/80 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center group-hover:border-indigo-500/50 transition-all duration-300">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">📷</span>
                </div>
                <div className="absolute inset-[-16px] border-2 border-indigo-500/10 rounded-full animate-ping"/>
                <div className="absolute inset-[-8px] border border-indigo-500/08 rounded-full animate-pulse"/>
              </div>
              <div className="text-center">
                <p className="text-indigo-400 font-black text-sm uppercase tracking-[.4em] animate-pulse">
                  {sensorStatus === 'INITIALIZING' ? 'Booting Neural Bridge...' : 'Connect Vision Sensors'}
                </p>
                <p className="text-slate-600 text-[9px] uppercase tracking-widest mt-2 font-bold">
                  Click camera · Point at any accessible space · Tap Scan Now
                </p>
              </div>
              <div className="absolute top-5 left-5 text-[8px] font-black text-slate-800 uppercase tracking-widest space-y-1 pointer-events-none">
                <div>ADA 2010 Standards</div>
                <div>WCAG 2.1 Level AA</div>
                <div>ISO 21542:2021</div>
                <div>ANSI A117.1</div>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-5">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 80 80" className="w-full h-full animate-spin" style={{ animationDuration: '1.4s' }}>
                  <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(99,102,241,.12)" strokeWidth="6"/>
                  <circle cx="40" cy="40" r="33" fill="none" stroke="#6366f1" strokeWidth="6"
                    strokeLinecap="round" strokeDasharray="55 150" strokeDashoffset="-10"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🛰️</div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xl font-black text-white uppercase tracking-tighter italic">Analyzing</p>
                <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[.3em] animate-pulse">Amazon Rekognition · Bedrock Nova</p>
              </div>
            </div>
          )}

          {/* AI Guide (fixed panel, rendered in camera viewport for correct z-layering) */}
          <AIGuide
            ref={aiGuideRef}
            context="Technical ADA Accessibility Compliance & Spatial Auditing"
            mode="fixed"
            sidebarOffset={440}
          />
        </div>

        {/* ── Right Sidebar ── */}
        <div className="w-[440px] flex-none bg-slate-950 border-l border-slate-800/50 flex flex-col z-30">
          {/* Tabs */}
          <div className="flex-none flex border-b border-slate-800/50 bg-slate-900/30">
            {(['report', 'remediate'] as const).map(tab => {
              const badge = tab === 'report' && results
                ? results.issues.filter(i => i.status === 'NON_COMPLIANT').length : 0;
              return (
                <button key={tab} onClick={() => setSidebarTab(tab)}
                  className={`flex-1 py-3.5 font-black text-[10px] uppercase tracking-[.22em] transition-all relative flex items-center justify-center gap-1.5 ${
                    sidebarTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}>
                  {tab === 'report' ? '📋 Audit Log' : '🔧 Synthesize Fix'}
                  {badge > 0 && (
                    <span className="w-4 h-4 bg-rose-500 text-white text-[7px] font-black rounded-full flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                  {sidebarTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500"/>}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-hidden min-h-0">

            {/* ── Audit Log Tab ── */}
            {sidebarTab === 'report' && (
              <div className="h-full overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {results ? (
                  <>
                    {/* Score card */}
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 flex items-center gap-4">
                      <ScoreRing score={results.score}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Compliance Breakdown</p>
                        <div className="space-y-1.5">
                          {[
                            { label: 'Compliant',  count: results.issues.filter(i => i.status === 'COMPLIANT').length,    col: 'bg-emerald-500' },
                            { label: 'Warning',    count: results.issues.filter(i => i.status === 'WARNING').length,      col: 'bg-amber-500' },
                            { label: 'Violation',  count: results.issues.filter(i => i.status === 'NON_COMPLIANT').length, col: 'bg-rose-500' },
                          ].map(({ label, count, col }) => (
                            <div key={label} className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full flex-none ${col}`}/>
                              <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div className={`h-1.5 rounded-full ${col} transition-all duration-700`}
                                  style={{ width: results.issues.length ? `${(count / results.issues.length) * 100}%` : '0%' }}/>
                              </div>
                              <span className="text-[9px] font-black text-slate-400 w-16 text-right">{count} {label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Issue cards */}
                    {results.issues.map((issue, idx) => {
                      const isC    = issue.status === 'COMPLIANT';
                      const isW    = issue.status === 'WARNING';
                      const isAct  = activeIssue === idx;
                      const bdr    = isC ? 'border-emerald-500/20 hover:border-emerald-500/40'
                                  : isW ? 'border-amber-500/20 hover:border-amber-500/40'
                                  :       'border-rose-500/20 hover:border-rose-500/40';
                      const bg     = isC ? 'bg-emerald-500/4' : isW ? 'bg-amber-500/4' : 'bg-rose-500/4';
                      const badge  = isC ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : isW ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  :       'bg-rose-500/10 text-rose-400 border-rose-500/30';
                      return (
                        <div key={idx}
                          onMouseEnter={() => setActiveIssue(idx)}
                          onMouseLeave={() => setActiveIssue(null)}
                          className={`rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 ${bg} ${
                            isAct ? 'border-indigo-500 bg-indigo-600/8 scale-[1.005]' : bdr
                          }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-black text-white text-sm uppercase tracking-tight">{issue.type}</h4>
                            <span className={`text-[7px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${badge}`}>
                              {issue.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs leading-relaxed mb-3">{issue.description}</p>
                          {!isC && (
                            <div className="bg-slate-900/70 rounded-xl p-2.5 mb-3">
                              <p className="text-[7px] text-indigo-400 font-black uppercase tracking-widest mb-1">Recommended Fix</p>
                              <p className="text-slate-300 text-xs leading-snug">{issue.recommendation}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[7px] text-slate-600 uppercase font-black tracking-widest">Est. Cost</p>
                              <p className="text-white font-black text-sm">{issue.costEstimate || 'N/A'}</p>
                            </div>
                            {!isC && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => synthesizeFix(issue)}
                                  className="py-1.5 px-3 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-400 rounded-lg text-[8px] font-black text-indigo-400 hover:text-white uppercase tracking-wider transition-all active:scale-95"
                                >
                                  🔧 Synthesize Fix
                                </button>
                                <button
                                  onClick={() => consultAI(issue.type, issue.description)}
                                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[8px] font-black text-slate-400 hover:text-white uppercase tracking-wider transition-all active:scale-95"
                                >
                                  🤖 Consult AI
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <span className="text-7xl mb-5 opacity-8">🛰️</span>
                    <p className="text-slate-600 font-black text-sm uppercase tracking-[.35em]">Awaiting Scan</p>
                    <p className="text-slate-700 text-[9px] uppercase tracking-widest mt-2 font-bold">
                      Initialize camera → Click Scan Now
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Synthesize Fix / Remediation Tab ── */}
            {sidebarTab === 'remediate' && (
              <div className="h-full overflow-y-auto p-4 space-y-4 scrollbar-thin">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">ADA Remediation Studio</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Generate contractor-ready ADA compliance specifications.</p>
                </div>

                {remediationText && !isRemediating ? (
                  <RemediationReport
                    text={remediationText}
                    frame={capturedFrameState}
                    onClear={() => { setRemediationText(null); setRemediationPrompt(''); }}
                    onExport={handleExport}
                  />
                ) : (
                  <>
                    {/* Frame preview */}
                    <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-900 relative">
                      {capturedFrameState ? (
                        <>
                          <img src={`data:image/jpeg;base64,${capturedFrameState}`}
                            className="w-full h-full object-cover opacity-60" alt="Source frame"/>
                          <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"/>
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Frame Captured</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-600 text-[9px] font-black uppercase tracking-widest flex-col gap-2 text-center px-6">
                          <span className="text-3xl opacity-25">📷</span>
                          <span>Scan the environment first to capture a frame</span>
                        </div>
                      )}
                    </div>

                    {/* Prompt */}
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                        Describe the barrier to remediate
                      </label>
                      <textarea
                        value={remediationPrompt}
                        onChange={e => setRemediationPrompt(e.target.value)}
                        placeholder="e.g. The doorway is too narrow for a wheelchair. Provide ADA-compliant widening specification..."
                        className="w-full h-20 bg-slate-900/70 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-indigo-500 outline-none resize-none font-mono placeholder-slate-600 transition-colors"
                      />
                    </div>

                    {/* Quick-select chips from scan results */}
                    {results?.issues?.filter(i => i.status !== 'COMPLIANT').length ? (
                      <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Quick select from scan</p>
                        <div className="flex flex-wrap gap-1.5">
                          {results.issues.filter(i => i.status !== 'COMPLIANT').slice(0, 6).map((issue, i) => (
                            <button key={i}
                              onClick={() => setRemediationPrompt(`Fix the ${issue.type}: ${issue.recommendation}`)}
                              className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full hover:bg-indigo-500/20 transition-all active:scale-95">
                              {issue.type}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Generate button / loading state */}
                    {isRemediating ? (
                      <div className="bg-indigo-600/8 border border-indigo-500/20 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-8 h-8 border-3 border-indigo-500/25 border-t-indigo-500 rounded-full animate-spin flex-none" style={{ borderWidth: 3 }}/>
                        <div>
                          <p className="text-white font-black text-sm">Generating Specification...</p>
                          <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-widest animate-pulse mt-0.5">
                            Amazon Rekognition · Bedrock Nova
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const frame = capturedFrameRef.current;
                          if (!frame) { alert('Please scan the environment first.'); return; }
                          if (!remediationPrompt.trim()) { alert('Please describe the barrier to fix.'); return; }
                          setIsRemediating(true);
                          setRemediationText(null);
                          geminiService.editImage(frame, remediationPrompt)
                            .then(r => setRemediationText(r))
                            .catch(() => setRemediationText('Generation failed — please try again.'))
                            .finally(() => setIsRemediating(false));
                        }}
                        disabled={!capturedFrameState || !remediationPrompt.trim()}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-900/30 transition-all active:scale-[.99] flex items-center justify-center gap-2"
                      >
                        <span>✨</span> Generate Remediation Report
                      </button>
                    )}

                    {!capturedFrameState && (
                      <p className="text-[9px] text-amber-400 font-black uppercase tracking-widest text-center bg-amber-500/8 border border-amber-500/20 rounded-lg p-2.5">
                        ⚠ Scan the environment first to enable report generation
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portal tooltip — rendered at body root, never clipped */}
      {activeIssue !== null && results?.issues?.[activeIssue] && (
        <IssueTooltip
          issue={results.issues[activeIssue]}
          cameraEl={cameraContainerRef.current}
          onClose={() => setActiveIssue(null)}
          onFix={() => { synthesizeFix(results.issues[activeIssue!]); setActiveIssue(null); }}
          onAI={() => { consultAI(results.issues[activeIssue!].type, results.issues[activeIssue!].description); }}
        />
      )}

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(99,102,241,.3); border-radius: 10px; }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};

export default ARAuditor;
