
import React, { useState, useEffect, useRef } from 'react';
import AIGuide from './AIGuide';
import { ChatMessage } from '../types';

interface NPCProps {
  pos: string;
  color: string;
  label: string;
}

const NPC: React.FC<NPCProps> = ({ pos, color, label }) => (
  <a-entity position={pos} animation="property: position; to: ${pos.split(' ')[0]} 0.1 ${parseFloat(pos.split(' ')[2]) + 0.5}; dur: 2000; dir: alternate; loop: true; easing: easeInOutSine">
    <a-cylinder color={color} radius="0.3" height="1.8" shadow="cast: true"></a-cylinder>
    <a-sphere color="#f8fafc" radius="0.25" position="0 1.1 0"></a-sphere>
    <a-text value={label} position="0 1.6 0" align="center" width="2" color="white" font="monoid"></a-text>
  </a-entity>
);

interface PaintingProps {
  pos: string;
  rot: string;
  src: string;
  title: string;
}

const Painting: React.FC<PaintingProps> = ({ pos, rot, src, title }) => (
  <a-entity position={pos} rotation={rot}>
    <a-box width="2.4" height="1.8" depth="0.1" color="#0f172a" shadow="cast: true"></a-box>
    <a-plane position="0 0.1 0.06" width="2.2" height="1.6" src={src}></a-plane>
    <a-text value={title} position="0 -1 0.06" align="center" width="2" color="#334155" font="monoid"></a-text>
  </a-entity>
);

interface Props {
  onComplete: (score: number) => void;
  history: ChatMessage[];
  onUpdateHistory: (messages: ChatMessage[]) => void;
}

type VisionType = 'NORMAL' | 'PROTANOPIA' | 'DEUTERANOPIA' | 'TRITANOPIA' | 'ACHROMATOPSIA';

const ColorBlindnessScene: React.FC<Props> = ({ onComplete, history, onUpdateHistory }) => {
  const [visionType, setVisionType] = useState<VisionType>('NORMAL');
  const [isHires, setIsHires] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [progress, setProgress] = useState(0);
  const rigRef = useRef<any>(null);

  useEffect(() => {
    const handleNavigation = () => {
      if (rigRef.current) {
        const pos = rigRef.current.getAttribute('position');
        const currentProgress = Math.min(100, Math.max(0, ((15 - pos.z) / 55) * 100));
        setProgress(currentProgress);
      }
    };
    const interval = setInterval(handleNavigation, 100);
    return () => clearInterval(interval);
  }, []);

  const getFilterClass = () => {
    switch(visionType) {
      case 'PROTANOPIA': return 'url(#protanopia-m)';
      case 'DEUTERANOPIA': return 'url(#deuteranopia-m)';
      case 'TRITANOPIA': return 'url(#tritanopia-m)';
      case 'ACHROMATOPSIA': return 'grayscale(1)';
      default: return 'none';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden font-mono select-none">
      {/* Scientifically Derived SVG Color Matrices */}
      <svg className="hidden">
        <defs>
          <filter id="protanopia-m">
            <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0" />
          </filter>
          <filter id="deuteranopia-m">
            <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0" />
          </filter>
          <filter id="tritanopia-m">
            <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0" />
          </filter>
        </defs>
      </svg>

      {/* Immersive 3D Engine Viewport */}
      <div className="absolute inset-0 z-0 transition-all duration-1000" style={{ filter: getFilterClass() }}>
        <a-scene embedded style={{ width: '100%', height: '100%' }} loading-screen="enabled: false" vr-mode-ui="enabled: true" webxr="requiredFeatures: local-floor; optionalFeatures: bounded-floor" shadow="type: pcfsoft">
          <a-assets>
            <img id="pavilion-floor" src="https://img.freepik.com/free-photo/gray-pavement-texture_1203-3450.jpg" crossOrigin="anonymous" />
            <img id="pavilion-wall" src="https://img.freepik.com/free-photo/white-painted-wall-texture_53876-121265.jpg" crossOrigin="anonymous" />
            <img id="vibrant-1" src="https://img.freepik.com/free-vector/abstract-watercolor-background_23-2149015093.jpg" crossOrigin="anonymous" />
            <img id="vibrant-2" src="https://img.freepik.com/free-vector/watercolor-texture-background_23-2148491321.jpg" crossOrigin="anonymous" />
            <img id="vibrant-3" src="https://img.freepik.com/free-vector/summer-abstract-background_23-2148530365.jpg" crossOrigin="anonymous" />
          </a-assets>

          <a-entity id="camera-rig" ref={rigRef} position="0 1.6 15" movement-controls="speed: 0.2">
            <a-camera look-controls="pointerLockEnabled: false">
               <a-entity geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03" material="color: #6366f1; shader: flat" position="0 0 -1" opacity="0.6"></a-entity>
            </a-camera>
          </a-entity>

          <a-sky color="#f8fafc"></a-sky>
          <a-light type="ambient" intensity="0.7"></a-light>
          <a-light type="directional" position="10 20 10" intensity="0.9" castShadow="true"></a-light>
          <a-light type="point" position="0 6 -15" intensity="0.6" color="#38bdf8"></a-light>

          <a-plane rotation="-90 0 0" width="120" height="120" src="#pavilion-floor" repeat="30 30" shadow="receive: true"></a-plane>

          {/* High-Contrast Market Zone */}
          <a-entity position="-6 0 2">
             <a-box width="4.5" height="3.5" depth="3.5" color="#f43f5e" shadow="cast: true; receive: true"></a-box>
             <a-text value="COLOR ZONE: RED" position="0 2.2 1.8" align="center" width="6" visible={showLabels} font="monoid"></a-text>
             <a-sphere position="-1.2 0.8 1.8" radius="0.35" color="#ff0000" shadow="cast: true"></a-sphere>
             <a-sphere position="0 0.8 1.8" radius="0.35" color="#ef4444" shadow="cast: true"></a-sphere>
             <a-sphere position="1.2 0.8 1.8" radius="0.35" color="#dc2626" shadow="cast: true"></a-sphere>
          </a-entity>

          <a-entity position="6 0 -3">
             <a-box width="4.5" height="3.5" depth="3.5" color="#10b981" shadow="cast: true"></a-box>
             <a-text value="COLOR ZONE: GREEN" position="0 2.2 1.8" align="center" width="6" visible={showLabels} font="monoid"></a-text>
             <a-box position="0 0.8 1.8" width="0.7" height="0.7" depth="0.7" color="#00ff00" shadow="cast: true"></a-box>
          </a-entity>

          {/* The Chromagenic Art Gallery */}
          <a-entity position="0 0 -20">
            <a-box position="-9 4.5 0" width="0.5" height="9" depth="25" color="#f1f5f9" src="#pavilion-wall" repeat="1 2" shadow="receive: true"></a-box>
            <a-box position="9 4.5 0" width="0.5" height="9" depth="25" color="#f1f5f9" src="#pavilion-wall" repeat="1 2" shadow="receive: true"></a-box>
            
            <Painting pos="-8.7 3 -8" rot="0 90 0" src="#vibrant-1" title="Abstract Wavelength A" />
            <Painting pos="-8.7 3 0" rot="0 90 0" src="#vibrant-2" title="Spectral Shift B" />
            <Painting pos="-8.7 3 8" rot="0 90 0" src="#vibrant-3" title="Chroma Flow C" />

            <Painting pos="8.7 3 -8" rot="0 -90 0" src="#vibrant-2" title="Deuterano Focus" />
            <Painting pos="8.7 3 0" rot="0 -90 0" src="#vibrant-1" title="Protanopia Dream" />
            <Painting pos="8.7 3 8" rot="0 -90 0" src="#vibrant-3" title="Tritanopia Coast" />

            <a-text value="CHROMAGENIC GALLERY" position="0 8 0" align="center" width="14" color="#1e293b" font="monoid" opacity="0.6"></a-text>
          </a-entity>

          {/* Interactive NPCs */}
          <NPC pos="-4 0 12" color="#f43f5e" label="MARKET STAFF" />
          <NPC pos="5 0 6" color="#10b981" label="PATRON" />
          <NPC pos="-5 0 -12" color="#3b82f6" label="ART CRITIC" />
          <NPC pos="6 0 -25" color="#f59e0b" label="GALLERY DOCENT" />

          {/* Concourse Goal */}
          <a-entity position="0 0 -45">
             <a-box width="12" height="0.3" depth="12" color="#0f172a" shadow="receive: true"></a-box>
             <a-torus position="0 5 0" radius="4" radius-tubular="0.08" color="#6366f1" animation="property: rotation; to: 0 360 0; dur: 12000; loop: true; easing: linear"></a-torus>
             <a-text value="CONCOURSE BRIDGE" position="0 1.8 0" align="center" width="12" color="#6366f1" font="monoid"></a-text>
          </a-entity>
        </a-scene>
      </div>

      {/* Futuristic AR HUD */}
      <div className="relative z-10 p-12 h-full flex flex-col pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl pointer-events-auto max-w-sm">
             <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center text-3xl shadow-2xl">
                  🌈
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none italic">Optical Link</h2>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.4em] mt-3">Active Simulation</p>
                </div>
             </div>

             <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_indigo]"></span> Spectrum Profiles
               </p>
               {(['NORMAL', 'PROTANOPIA', 'DEUTERANOPIA', 'TRITANOPIA', 'ACHROMATOPSIA'] as VisionType[]).map(type => (
                 <button 
                  key={type}
                  onClick={() => setVisionType(type)}
                  className={`w-full text-left px-6 py-4 rounded-2xl text-[11px] font-black transition-all border-2 ${
                    visionType === type 
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl scale-[1.02]' 
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300'
                  }`}
                 >
                   {type}
                 </button>
               ))}
             </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl pointer-events-auto w-80">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Simulation Config</h3>
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">Super-Sampling</p>
                      <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Res: {isHires ? 'Native 4K' : 'Standard'}</p>
                    </div>
                    <button onClick={() => setIsHires(!isHires)} className={`w-14 h-7 rounded-full transition-all relative ${isHires ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                       <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isHires ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">Spatial Labels</p>
                      <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">AR Helper Overlay</p>
                    </div>
                    <button onClick={() => setShowLabels(!showLabels)} className={`w-14 h-7 rounded-full transition-all relative ${showLabels ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                       <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${showLabels ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
               </div>
               <div className="mt-10 pt-8 border-t border-white/5">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress to Concourse</span>
                    <span className="text-lg font-black text-indigo-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
                  </div>
               </div>
            </div>

            {progress > 95 && (
              <button 
                onClick={() => onComplete(100)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs pointer-events-auto shadow-2xl shadow-indigo-600/30 animate-bounce transition-all active:scale-95"
              >
                Complete Session
              </button>
            )}
          </div>
        </div>

        <div className="mt-auto flex justify-between items-end">
          <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-12 rounded-[4rem] shadow-2xl pointer-events-auto max-w-xl">
             <div className="flex items-center gap-5 mb-8">
               <span className="text-4xl">💡</span>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Perspective Node</h3>
             </div>
             <p className="text-base text-slate-300 leading-relaxed italic opacity-90">
               "Color vision deficiency affects environmental navigation and art appreciation in profound ways. In the gallery, notice how certain 'spectral shifts' in the paintings completely lose their high-chroma impact depending on your chosen profile."
             </p>
             <div className="mt-10 flex items-center gap-4 bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-3xl">
                <div className="w-3 h-3 rounded-full bg-indigo-400 animate-ping"></div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Haptic Interface: Optimal Sync</span>
             </div>
          </div>

          <div className="bg-slate-900/90 p-10 border border-white/10 rounded-[3rem] shadow-2xl pointer-events-auto flex flex-col items-center gap-6">
             <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Drive System</span>
                <div className="grid grid-cols-3 gap-3">
                   <div></div>
                   <div className="w-12 h-12 border-2 border-indigo-500/40 rounded-xl flex items-center justify-center font-black text-white text-sm">W</div>
                   <div></div>
                   <div className="w-12 h-12 border-2 border-slate-700 rounded-xl flex items-center justify-center font-black text-slate-600 text-sm">A</div>
                   <div className="w-12 h-12 border-2 border-indigo-500/40 rounded-xl flex items-center justify-center font-black text-white text-sm">S</div>
                   <div className="w-12 h-12 border-2 border-slate-700 rounded-xl flex items-center justify-center font-black text-slate-600 text-sm">D</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <AIGuide context="Chromagenic Environments & Digital Inclusion" history={history} onUpdateHistory={onUpdateHistory} />
      
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[100] opacity-10">
        <div className="w-full h-1 bg-indigo-500 absolute animate-[scanline_10s_linear_infinite]"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}} />
    </div>
  );
};

export default ColorBlindnessScene;
