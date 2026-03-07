
import React, { useState } from 'react';

interface Props {
  onComplete: () => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Establish Neural Link",
      subtitle: "Welcome to WalkInMyShoes",
      description: "You are about to enter a high-fidelity empathy bridge. Our mission is to transform abstract data into lived experience, fostering a world designed for every body.",
      icon: "🛰️",
      stats: ["Uplink: Active", "Encryption: 256-bit", "Node: Global"]
    },
    {
      title: "Step into Perspective",
      subtitle: "Immersive Simulations",
      description: "Access our VR-enabled environments to navigate the world through diverse disability lenses. Experience how vision loss, hearing impairment, and motor barriers reshape the urban landscape.",
      icon: "🥽",
      stats: ["Latency: 12ms", "Sensory Filter: Active", "Resolution: 4K"]
    },
    {
      title: "Audit the Real World",
      subtitle: "AR Spatial Intelligence",
      description: "Use your device's camera to identify architectural barriers in real-time. Our Amazon Bedrock-powered 'Neural Fix' engine can visually synthesize ADA-compliant solutions instantly.",
      icon: "📷",
      stats: ["AI Model: Amazon Nova 2 Lite", "Audit Rigor: ADA/WCAG", "Synthesis: Enabled"]
    },
    {
      title: "Track Your Impact",
      subtitle: "Expert Guidance & Advocacy",
      description: "Consult with your persistent AI Guide to learn technical standards. Your growth as an advocate is tracked in real-time on your Impact Dashboard.",
      icon: "📊",
      stats: ["Progress: 0%", "Advocacy Level: Ally", "Data Sync: Local"]
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      <div className="relative w-full max-w-4xl bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row h-[700px] animate-in fade-in zoom-in duration-700">
        
        {/* Left Side: Visual/Icon */}
        <div className="md:w-2/5 bg-gradient-to-br from-indigo-600/20 to-cyan-500/10 border-r border-white/5 flex flex-col items-center justify-center p-12 relative">
          <div className="text-9xl mb-12 animate-bounce">{steps[step].icon}</div>
          
          <div className="space-y-4 w-full">
            {steps[step].stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-950/40 px-5 py-3 rounded-2xl border border-white/5 shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_indigo]"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat}</span>
              </div>
            ))}
          </div>

          <div className="absolute bottom-10 flex gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step === i ? 'w-12 bg-indigo-500' : 'w-3 bg-slate-800'}`}></div>
            ))}
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-16 flex flex-col justify-center">
          <div className="mb-12">
            <span className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-4 block">Sequence 0{step + 1} // Calibration</span>
            <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">{steps[step].title}</h2>
            <h3 className="text-xl font-bold text-slate-400 tracking-tight">{steps[step].subtitle}</h3>
          </div>

          <p className="text-lg text-slate-300 leading-relaxed italic opacity-90 mb-16 max-w-lg">
            "{steps[step].description}"
          </p>

          <div className="flex gap-4">
            <button 
              onClick={handleNext}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-600/40 transition-all active:scale-95"
            >
              {step === steps.length - 1 ? "Initialize Experience" : "Confirm & Next"}
            </button>
            {step === 0 && (
              <button 
                onClick={onComplete}
                className="px-8 bg-slate-800 text-slate-500 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Scanline */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[210] opacity-[0.03]">
        <div className="w-full h-1 bg-white absolute animate-[onboarding-scan_8s_linear_infinite]"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes onboarding-scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}} />
    </div>
  );
};

export default Onboarding;
