
import React, { useState, useEffect, useRef } from 'react';
import AIGuide from './AIGuide';
import { ChatMessage } from '../types';

interface Props {
  onComplete: (score: number) => void;
  history: ChatMessage[];
  onUpdateHistory: (messages: ChatMessage[]) => void;
}

type FilterMode = 'BLUR' | 'CONTRAST' | 'DEUTERANOPIA' | 'PROTANOPIA' | 'TRITANOPIA' | 'ACHROMATOPSIA' | 'GLAUCOMA' | 'MACULAR';

const VisualImpairmentScene: React.FC<Props> = ({ onComplete, history, onUpdateHistory }) => {
  const [stage, setStage] = useState(1);
  const [taskIndex, setTaskIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const [activeFilters, setActiveFilters] = useState<FilterMode[]>(['BLUR']);
  const rigRef = useRef<any>(null);

  const tasks = [
    { text: "Identify the high-contrast 'EXIT' sign", pos: { x: 0, y: 2.5, z: -8 } },
    { text: "Locate the green safety zone near the tree", pos: { x: -5, y: 1.5, z: -12 } },
    { text: "Find the tactile yellow warning strip", pos: { x: 4, y: 0.1, z: -18 } }
  ];

  const getBlurValue = () => {
    if (!activeFilters.includes('BLUR')) return 0;
    switch(stage) {
      case 1: return 2;
      case 2: return 5;
      case 3: return 12;
      case 4: return 24;
      default: return 0;
    }
  };

  const getContrastValue = () => {
    if (!activeFilters.includes('CONTRAST')) return 100;
    return Math.max(10, 100 - (stage * 25));
  };

  const toggleFilter = (filter: FilterMode) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const handleNextTask = () => {
    if (taskIndex < tasks.length - 1) {
      setTaskIndex(taskIndex + 1);
      setStage(Math.min(4, stage + 1));
    } else {
      const duration = (Date.now() - startTime) / 1000;
      onComplete(Math.max(10, 100 - Math.floor(duration / 2)));
    }
  };

  const compositeFilter = () => {
    let filters = [];
    if (activeFilters.includes('BLUR')) filters.push(`blur(${getBlurValue()}px)`);
    if (activeFilters.includes('CONTRAST')) filters.push(`contrast(${getContrastValue()}%)`);
    if (activeFilters.includes('DEUTERANOPIA')) filters.push(`url(#deuteranopia-filter)`);
    if (activeFilters.includes('PROTANOPIA')) filters.push(`url(#protanopia-filter)`);
    if (activeFilters.includes('TRITANOPIA')) filters.push(`url(#tritanopia-filter)`);
    if (activeFilters.includes('ACHROMATOPSIA')) filters.push(`grayscale(1)`);
    
    return filters.join(' ') || 'none';
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black flex flex-col font-mono select-none">
      <svg className="absolute w-0 h-0 invisible">
        <defs>
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0" />
          </filter>
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0" />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0" />
          </filter>
        </defs>
      </svg>

      {/* Spatial Masks for Glaucoma/Macular */}
      <div className="absolute inset-0 pointer-events-none z-[5]">
        {activeFilters.includes('GLAUCOMA') && (
          <div 
            className="absolute inset-0 bg-black transition-opacity duration-1000" 
            style={{ 
              maskImage: 'radial-gradient(circle, transparent 15%, rgba(0,0,0,0.8) 40%, black 60%)',
              WebkitMaskImage: 'radial-gradient(circle, transparent 15%, rgba(0,0,0,0.8) 40%, black 60%)'
            }}
          ></div>
        )}
        {activeFilters.includes('MACULAR') && (
          <div 
            className="absolute inset-0 backdrop-blur-xl transition-opacity duration-1000" 
            style={{ 
              maskImage: 'radial-gradient(circle, black 5%, rgba(0,0,0,0.4) 20%, transparent 45%)',
              WebkitMaskImage: 'radial-gradient(circle, black 5%, rgba(0,0,0,0.4) 20%, transparent 45%)'
            }}
          ></div>
        )}
      </div>

      <div 
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out" 
        style={{ filter: compositeFilter() }}
      >
        <a-scene embedded webxr="requiredFeatures: local-floor; optionalFeatures: bounded-floor" style={{ width: '100%', height: '100%' }} fog="type: exponential; color: #64748b; density: 0.01">
          <a-assets>
             <img id="pavement-tex" src="https://img.freepik.com/free-photo/gray-concrete-floor-textured-background_53876-101737.jpg" crossOrigin="anonymous" />
             <img id="brick-tex" src="https://img.freepik.com/free-photo/brick-wall-texture_1203-3453.jpg" crossOrigin="anonymous" />
             <img id="sky-tex" src="https://img.freepik.com/free-photo/dark-gray-cloudy-sky-background_53876-102554.jpg" crossOrigin="anonymous" />
          </a-assets>

          <a-entity ref={rigRef} position="0 1.6 0">
            <a-camera look-controls="pointerLockEnabled: false" wasd-controls="acceleration: 15">
               <a-entity geometry="primitive: ring; radiusInner: 0.01; radiusOuter: 0.015" material="color: #6366f1; shader: flat" position="0 0 -0.5"></a-entity>
            </a-camera>
          </a-entity>

          <a-sky src="#sky-tex" rotation="0 -90 0"></a-sky>
          <a-light type="ambient" intensity="0.4" color="#cbd5e1"></a-light>
          <a-light type="directional" position="1 10 1" intensity="0.8" castShadow="true" shadow-camera-left="-20" shadow-camera-right="20" shadow-camera-top="20" shadow-camera-bottom="-20"></a-light>

          {/* Environmental Buildings */}
          <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" src="#pavement-tex" repeat="20 20" shadow="receive: true"></a-plane>
          <a-box position="12 10 -15" width="15" height="20" depth="15" src="#brick-tex" repeat="3 4" shadow="cast: true"></a-box>
          <a-box position="-15 15 -25" width="20" height="30" depth="20" color="#1e293b" shadow="cast: true"></a-box>
          <a-box position="0 20 -40" width="40" height="40" depth="10" color="#334155" shadow="cast: true"></a-box>
          
          {/* Detailed Interaction Objects */}
          <a-entity position="-5 0 -12">
            <a-cylinder color="#5d4037" radius="0.2" height="3.5" shadow="cast: true"></a-cylinder>
            <a-sphere color="#1b5e20" radius="2" position="0 4 0" shadow="cast: true"></a-sphere>
            <a-sphere color="#2e7d32" radius="1.8" position="0.5 4.5 0.5" shadow="cast: true"></a-sphere>
            <a-circle position="0 0.02 0" rotation="-90 0 0" radius="4" color="#111" opacity="0.4"></a-circle>
          </a-entity>

          <a-entity position="0 2.5 -8">
            <a-box width="2.5" height="1" depth="0.2" color="#ef4444" shadow="cast: true">
              <a-text value="EXIT" align="center" color="white" width="10" position="0 0 0.12" font="monoid" font-weight="black"></a-text>
            </a-box>
          </a-entity>

          <a-box position="4 0.01 -18" width="8" height="0.6" depth="0.4" rotation="-90 0 0" color="#eab308" material="roughness: 1; metalness: 0"></a-box>

          {/* Enhanced Subtle Task Indicator Location */}
          <a-entity position={`${tasks[taskIndex].pos.x} ${tasks[taskIndex].pos.y} ${tasks[taskIndex].pos.z}`}>
            <a-light type="point" intensity="1.5" distance="6" color="#818cf8" animation="property: light.intensity; to: 3; dur: 1200; dir: alternate; loop: true"></a-light>
            <a-sphere radius="0.3" material="color: #6366f1; shader: flat; transparent: true; opacity: 0.8" 
              animation="property: position; to: 0 0.5 0; dur: 1500; dir: alternate; loop: true; easing: easeInOutSine">
            </a-sphere>
            <a-sphere radius="0.8" material="color: #6366f1; shader: flat; transparent: true; opacity: 0.1" 
              animation="property: scale; to: 1.8 1.8 1.8; dur: 1500; dir: alternate; loop: true; easing: easeOutQuad">
            </a-sphere>
            <a-ring radius-inner="1.0" radius-outer="1.1" color="#818cf8" rotation="-90 0 0" material="shader: flat; transparent: true; opacity: 0.4" 
              animation="property: scale; to: 2.5 2.5 2.5; dur: 1500; dir: alternate; loop: true">
            </a-ring>
          </a-entity>
        </a-scene>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col p-8 md:p-12">
        <div className="flex justify-between items-start h-full">
           <div className="bg-slate-900/95 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] pointer-events-auto shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-4 h-4 bg-indigo-500 rounded-full animate-ping"></div>
                 <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em]">Neural Vision v6.2</span>
              </div>
              <h3 className="text-white font-black text-3xl tracking-tighter uppercase italic mb-8 leading-none">Impairment Node {stage}</h3>
              <div className="grid grid-cols-2 gap-8">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Acuity Loss</span>
                    <span className="text-2xl font-black text-white">{stage * 25}%</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Contrast</span>
                    <span className="text-2xl font-black text-white">{getContrastValue()}%</span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900/95 backdrop-blur-3xl border border-white/10 p-8 rounded-[3rem] pointer-events-auto shadow-2xl w-80 animate-in fade-in slide-in-from-right-4 duration-700 flex flex-col overflow-hidden max-h-full">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-4">Clinical Profiles</h4>
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                 {(['BLUR', 'CONTRAST', 'ACHROMATOPSIA', 'GLAUCOMA', 'MACULAR', 'DEUTERANOPIA', 'PROTANOPIA', 'TRITANOPIA'] as FilterMode[]).map(mode => (
                   <button 
                     key={mode} 
                     onClick={() => toggleFilter(mode)} 
                     className={`w-full flex justify-between items-center px-5 py-4 rounded-2xl text-[10px] font-black transition-all border-2 ${activeFilters.includes(mode) ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/30' : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300'}`}
                   >
                      <span>{mode === 'MACULAR' ? 'MACULAR DEGEN.' : mode}</span>
                      <span className={`w-2 h-2 rounded-full ${activeFilters.includes(mode) ? 'bg-white' : 'bg-slate-700'}`}></span>
                   </button>
                 ))}
              </div>
              <p className="mt-6 text-[9px] text-slate-600 font-bold uppercase tracking-widest italic leading-relaxed">
                Toggles represent common clinical visual conditions.
              </p>
           </div>
        </div>

        <div className="mt-auto self-center w-full max-w-2xl mb-8">
          <div className="bg-slate-950/95 backdrop-blur-3xl border border-white/10 p-12 rounded-[4.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] pointer-events-auto transition-all hover:bg-slate-950 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center gap-8 mb-10">
               <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white flex items-center justify-center font-black text-3xl shadow-xl">
                  {taskIndex + 1}
               </div>
               <div>
                  <p className="text-[11px] text-indigo-400 font-black uppercase tracking-[0.5em] mb-2">Active Navigation Objective</p>
                  <h3 className="text-white font-black text-3xl tracking-tighter leading-tight">{tasks[taskIndex].text}</h3>
               </div>
            </div>
            <button onClick={handleNextTask} className="w-full bg-indigo-600 hover:bg-indigo-500 py-8 rounded-[3rem] font-black text-white transition-all active:scale-95 flex items-center justify-center gap-6 group shadow-2xl shadow-indigo-600/50 text-xl uppercase tracking-widest">
              Confirm Visual Locking <span className="text-3xl group-hover:translate-x-3 transition-transform">🎯</span>
            </button>
          </div>
        </div>
      </div>
      <AIGuide context="Visual Impairment & Design Ethics" history={history} onUpdateHistory={onUpdateHistory} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 10px; }
      `}} />
    </div>
  );
};

export default VisualImpairmentScene;
