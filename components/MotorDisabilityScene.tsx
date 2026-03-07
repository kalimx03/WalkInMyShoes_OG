
import React, { useState, useEffect, useRef } from 'react';
import AIGuide from './AIGuide';
import { ChatMessage } from '../types';

interface TreeProps {
  pos: string;
}

const Tree: React.FC<TreeProps> = ({ pos }) => (
  <a-entity position={pos}>
    {/* Realistic Tapered Trunk */}
    <a-cylinder color="#4e342e" radius-bottom="0.3" radius-top="0.15" height="4.5" shadow="cast: true"></a-cylinder>
    
    {/* Procedural Branching Layers */}
    {[0, 120, 240].map((rot) => (
      <a-entity key={rot} position="0 1.5 0" rotation={`15 ${rot} 0`}>
        <a-cylinder color="#4e342e" radius="0.1" height="2.2" position="0 1 0"></a-cylinder>
        <a-entity position="0 2.2 0">
           <a-sphere color="#1b5e20" radius="0.8" opacity="0.9"></a-sphere>
           <a-sphere color="#2e7d32" radius="0.6" position="0.3 0.3 0.3"></a-sphere>
        </a-entity>
      </a-entity>
    ))}
    
    {[60, 180, 300].map((rot) => (
      <a-entity key={`high-${rot}`} position="0 3 0" rotation={`35 ${rot} 0`}>
        <a-cylinder color="#4e342e" radius="0.06" height="1.5" position="0 0.6 0"></a-cylinder>
        <a-sphere color="#388e3c" radius="0.7"></a-sphere>
      </a-entity>
    ))}
    
    {/* Crown */}
    <a-sphere color="#1b5e20" radius="1.2" position="0 4.5 0" shadow="cast: true"></a-sphere>
    <a-sphere color="#4caf50" radius="0.9" position="0.4 4.8 0.4"></a-sphere>
  </a-entity>
);

const Building: React.FC<{ pos: string; width: number; height: number; depth: number; color: string; windows?: boolean }> = ({ pos, width, height, depth, color, windows = true }) => (
  <a-entity position={pos}>
    {/* Main Structure */}
    <a-box width={width} height={height} depth={depth} color={color} shadow="receive: true; cast: true"></a-box>
    
    {/* Architectural Trim */}
    <a-box position={`0 ${height / 2} 0`} width={width + 0.2} height="0.4" depth={depth + 0.2} color="#1e293b"></a-box>
    
    {/* Window Grids */}
    {windows && (
      <a-entity position={`0 0 ${depth / 2 + 0.05}`}>
        {[...Array(Math.floor(height / 2))].map((_, h) => (
          <a-entity key={h} position={`0 ${(h * 2) - (height / 2) + 1} 0`}>
            {[...Array(Math.floor(width / 1.5))].map((_, w) => (
              <a-plane 
                key={w} 
                position={`${(w * 1.5) - (width / 2) + 0.75} 0 0`} 
                width="0.8" height="1.2" 
                material="color: #38bdf8; emissive: #075985; emissiveIntensity: 0.2; opacity: 0.6; transparent: true"
              ></a-plane>
            ))}
          </a-entity>
        ))}
      </a-entity>
    )}
  </a-entity>
);

interface Props {
  onComplete: (score: number) => void;
  history: ChatMessage[];
  onUpdateHistory: (messages: ChatMessage[]) => void;
}

const MotorDisabilityScene: React.FC<Props> = ({ onComplete, history, onUpdateHistory }) => {
  const [stamina, setStamina] = useState(100);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>(["Neural link stable.", "Propulsion ready. Move with WASD."]);
  const [isElevatorOpen, setIsElevatorOpen] = useState(false);
  const [isMainDoorOpen, setIsMainDoorOpen] = useState(false);
  const [isMidDoorOpen, setIsMidDoorOpen] = useState(false);
  const rigRef = useRef<any>(null);

  const currentSpeed = stamina > 30 ? 0.08 : 0.03;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stamina <= 1) return;

      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup' || key === 's' || key === 'arrowdown') {
        const direction = (key === 'w' || key === 'arrowup') ? 1 : -1;
        setStamina(prev => Math.max(0, prev - 0.25));
        
        if (rigRef.current) {
          const pos = rigRef.current.getAttribute('position');
          const newZ = pos.z - (currentSpeed * direction);
          rigRef.current.setAttribute('position', { x: pos.x, y: pos.y, z: newZ });
          
          const totalDist = 50;
          const currentDist = 15 - newZ;
          const newProgress = Math.max(0, Math.min(100, (currentDist / totalDist) * 100));
          setProgress(newProgress);

          if (newZ < 10 && !isMainDoorOpen) {
            setIsMainDoorOpen(true);
            setLog(prev => ["Sensor: Opening main lobby doors.", ...prev.slice(0, 4)]);
          }
          if (newZ < -5 && !isMidDoorOpen) {
            setIsMidDoorOpen(true);
            setLog(prev => ["Gate: Transit zone unlocked.", ...prev.slice(0, 4)]);
          }
          if (newZ < -28 && !isElevatorOpen) {
            setIsElevatorOpen(true);
            setLog(prev => ["Elevator: System doors cycling.", ...prev.slice(0, 4)]);
          }

          if (newProgress >= 99) {
            onComplete(94);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stamina, currentSpeed, isElevatorOpen, isMainDoorOpen, isMidDoorOpen, onComplete]);

  const recover = () => {
    setStamina(100);
    setLog(prev => ["Neural link: Propulsion recharged.", ...prev.slice(0, 4)]);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden font-mono">
      <div className="absolute inset-0 z-0">
        <a-scene embedded style={{ width: '100%', height: '100%' }} loading-screen="enabled: false" vr-mode-ui="enabled: true" webxr="requiredFeatures: local-floor; optionalFeatures: bounded-floor" shadow="type: pcfsoft">
          <a-assets>
            <img id="tile" src="https://img.freepik.com/free-photo/gray-concrete-floor-textured-background_53876-101737.jpg" crossOrigin="anonymous" />
            <img id="wall-p" src="https://img.freepik.com/free-photo/white-painted-wall-texture-background_53876-121265.jpg" crossOrigin="anonymous" />
          </a-assets>

          <a-entity id="camera-rig" ref={rigRef} position="0 0.8 15">
            <a-camera look-controls="pointerLockEnabled: false" wasd-controls-enabled="false">
               <a-entity
                  geometry="primitive: ring; radiusInner: 0.1; radiusOuter: 0.12"
                  material="color: #6366f1; opacity: 0.3; transparent: true; shader: flat"
                  position="0 0 -0.2"
                ></a-entity>
            </a-camera>
          </a-entity>

          <a-sky color="#f1f5f9"></a-sky>
          <a-light type="ambient" intensity="0.4"></a-light>
          <a-light type="directional" position="10 25 10" intensity="0.8" castShadow="true" shadow-camera-left="-25" shadow-camera-right="25" shadow-camera-top="25" shadow-camera-bottom="-25"></a-light>
          
          {/* Dynamic Sky Drones */}
          <a-entity position="20 15 -40" animation="property: position; to: -20 15 -40; dur: 30000; loop: true; dir: alternate; easing: linear">
             <a-box width="1" height="0.2" depth="1" color="#1e293b">
                <a-light type="point" color="#38bdf8" intensity="1.5" distance="5"></a-light>
             </a-box>
          </a-entity>

          {/* Environment Floor & Walls */}
          <a-plane position="0 0 -10" rotation="-90 0 0" width="16" height="70" src="#tile" repeat="8 35" shadow="receive: true"></a-plane>
          <a-box position="-8 4 -10" width="0.4" height="8" depth="70" color="#e2e8f0" src="#wall-p" repeat="1 15"></a-box>
          <a-box position="8 4 -10" width="0.4" height="8" depth="70" color="#e2e8f0" src="#wall-p" repeat="1 15"></a-box>
          <a-plane position="0 8 -10" rotation="90 0 0" width="16" height="70" color="#f1f5f9" material="metalness: 0.1; roughness: 0.8"></a-plane>

          {/* Realistic City Elements */}
          {/* Fix: Passing numbers instead of strings for dimension props */}
          <Building pos="-15 10 5" width={10} height={20} depth={10} color="#475569" />
          <Building pos="15 12 -15" width={12} height={25} depth={12} color="#334155" />
          <Building pos="-18 15 -35" width={15} height={30} depth={15} color="#1e293b" />
          
          <Tree pos="-6 0 12" />
          <Tree pos="6.5 0 2" />
          <Tree pos="-5.5 0 -8" />
          <Tree pos="6 0 -18" />
          <Tree pos="-6.2 0 -28" />
          <Tree pos="6.8 0 -38" />

          {/* Dynamic Lobby Doors */}
          <a-entity position="0 0 10">
             <a-box position={isMainDoorOpen ? "-4.5 4 0" : "-2 4 0"} width="4" height="8" depth="0.3" material="color: #38bdf8; opacity: 0.2; transparent: true"
               animation={`property: position; to: ${isMainDoorOpen ? '-4.5 4 0' : '-2 4 0'}; dur: 1500; easing: easeInOutQuad`}>
               <a-box width="0.2" height="8" depth="0.4" position="1.9 0 0" color="#1e293b"></a-box>
             </a-box>
             <a-box position={isMainDoorOpen ? "4.5 4 0" : "2 4 0"} width="4" height="8" depth="0.3" material="color: #38bdf8; opacity: 0.2; transparent: true"
               animation={`property: position; to: ${isMainDoorOpen ? '4.5 4 0' : '2 4 0'}; dur: 1500; easing: easeInOutQuad`}>
               <a-box width="0.2" height="8" depth="0.4" position="-1.9 0 0" color="#1e293b"></a-box>
             </a-box>
          </a-entity>

          {/* Security Transit Zone */}
          <a-entity position="0 0 -5">
             <a-box position={isMidDoorOpen ? "-5 2 0" : "-1.5 2 0"} width="3" height="4" depth="0.2" color="#1e1e1e"
               animation={`property: position; to: ${isMidDoorOpen ? '-5 2 0' : '-1.5 2 0'}; dur: 1200; easing: easeOutCubic`}></a-box>
             <a-box position={isMidDoorOpen ? "5 2 0" : "1.5 2 0"} width="3" height="4" depth="0.2" color="#1e1e1e"
               animation={`property: position; to: ${isMidDoorOpen ? '5 2 0' : '1.5 2 0'}; dur: 1200; easing: easeOutCubic`}></a-box>
             <a-light type="spot" position="0 6 0" rotation="-90 0 0" intensity="1.2" color={isMidDoorOpen ? "#10b981" : "#f43f5e"} angle="45"></a-light>
          </a-entity>

          {/* Intelligent NPCs with Patrol Loops */}
          <a-entity position="-3 0 5" animation="property: position; to: 3 0 5; dur: 10000; dir: alternate; loop: true; easing: linear">
            <a-cylinder color="#334155" radius="0.35" height="1.8" shadow="cast: true"></a-cylinder>
            <a-sphere color="#f1f5f9" radius="0.25" position="0 1.1 0"></a-sphere>
            <a-entity position="0 1.6 0">
               <a-plane width="1.5" height="0.4" color="#0f172a" rotation="0 0 0">
                  <a-text value="STAFF" align="center" width="3" color="white"></a-text>
               </a-plane>
            </a-entity>
          </a-entity>

          <a-entity position="4 0 -15" animation="property: position; to: 4 0 -30; dur: 14000; dir: alternate; loop: true; easing: linear">
            <a-cylinder color="#1e293b" radius="0.35" height="1.8" shadow="cast: true"></a-cylinder>
            <a-sphere color="#cbd5e1" radius="0.25" position="0 1.1 0"></a-sphere>
            <a-text value="VISITOR" position="0 1.6 0.1" align="center" width="2.5" color="white"></a-text>
          </a-entity>

          {/* Hovering Service Bot */}
          <a-entity position="-2 0.8 -10" animation="property: position; to: 4 0.6 -20; dur: 9000; dir: alternate; loop: true; easing: easeInOutSine">
            <a-box width="0.7" height="0.5" depth="0.7" color="#0f172a">
               <a-sphere position="0 -0.25 0" radius="0.1" color="#38bdf8" animation="property: material.opacity; to: 0.1; dur: 600; loop: true; dir: alternate"></a-sphere>
            </a-box>
            <a-text value="UNIT 7" position="0 0.8 0" align="center" width="2" color="#38bdf8"></a-text>
          </a-entity>

          {/* Goal Elevator Area */}
          <a-entity position="0 0 -45">
             <a-box position="0 4 -0.2" width="8" height="8" depth="0.4" color="#1e293b"></a-box>
             <a-box 
              position={isElevatorOpen ? "-2.5 4 0" : "-1.2 4 0"} 
              width="2.5" height="7" depth="0.15" color="#475569"
              animation={`property: position; to: ${isElevatorOpen ? '-2.5 4 0' : '-1.2 4 0'}; dur: 2200; easing: easeInOutBack`}
             ></a-box>
             <a-box 
              position={isElevatorOpen ? "2.5 4 0" : "1.2 4 0"} 
              width="2.5" height="7" depth="0.15" color="#475569"
              animation={`property: position; to: ${isElevatorOpen ? '2.5 4 0' : '1.2 4 0'}; dur: 2200; easing: easeInOutBack`}
             ></a-box>
             <a-text value="EXECUTIVE LEVEL" position="0 7.5 0.1" align="center" width="8" color="#38bdf8" font="monoid"></a-text>
             <a-light type="point" position="0 5 1" color="#38bdf8" intensity={isElevatorOpen ? 2 : 0.5}></a-light>
          </a-entity>
        </a-scene>
      </div>

      <div className="relative z-10 p-10 h-full flex flex-col pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-8 rounded-[2rem] shadow-2xl pointer-events-auto">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner">♿</div>
                <div>
                   <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none italic">Motor Perspective</h2>
                   <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em] mt-2">Spatial Mesh: ACTIVE</p>
                </div>
             </div>
             <div className="flex gap-2 items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Neural Link Synchronized</span>
             </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-8 rounded-[2rem] shadow-2xl pointer-events-auto w-80">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex justify-between">
              <span>Bio-Mechanical Charge</span>
              <span className={stamina < 30 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}>{Math.round(stamina)}%</span>
            </h3>
            <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
              <div 
                className={`h-full transition-all duration-300 ${stamina > 30 ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-rose-600'}`} 
                style={{ width: `${stamina}%` }}
              ></div>
              {stamina < 20 && <div className="absolute inset-0 bg-white/10 animate-pulse"></div>}
            </div>
            <p className="text-[9px] text-slate-600 font-bold uppercase mt-4 tracking-tighter">Efficiency Mode: {stamina > 30 ? 'NOMINAL' : 'CONSERVATIVE'}</p>
          </div>
        </div>

        <div className="mt-auto flex justify-between items-end">
          <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl pointer-events-auto max-w-sm">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-3">Neuro-Tactile Feed</h3>
            <div className="space-y-4">
              {log.map((entry, i) => (
                <div key={i} className={`text-xs flex items-center gap-4 transition-all duration-500 ${i === 0 ? 'text-white translate-x-2' : 'text-slate-600 opacity-60'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-indigo-500 shadow-[0_0_10px_indigo]' : 'bg-slate-800'}`}></div>
                  <span className="font-semibold uppercase tracking-tight">{entry}</span>
                </div>
              ))}
            </div>
            {stamina < 50 && (
              <button 
                onClick={recover}
                className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black text-xs transition-all shadow-xl shadow-indigo-600/30 pointer-events-auto active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="inline-block mr-2 text-lg">⚡</span> RECALIBRATE DRIVE
              </button>
            )}
          </div>

          <div className="flex flex-col items-center gap-6 bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-8 rounded-[2rem] pointer-events-auto shadow-2xl">
             <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DRIVE (W)</span>
                <div className="w-14 h-14 rounded-2xl border-2 border-indigo-500/50 bg-indigo-500/10 flex items-center justify-center font-black text-white text-xl animate-pulse shadow-lg">W</div>
             </div>
             <div className="h-44 w-2.5 bg-slate-950 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-cyan-400 transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  style={{ height: `${progress}%` }}
                ></div>
                {progress > 90 && <div className="absolute top-0 left-0 right-0 h-4 bg-emerald-500/50 animate-pulse"></div>}
             </div>
             <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Target</span>
          </div>
        </div>
      </div>

      <AIGuide context="Motor Disability Simulation & Universal Access" history={history} onUpdateHistory={onUpdateHistory} />
      
      {/* Simulation Scanning Scanline */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-10">
         <div className="w-full h-1 bg-indigo-500 absolute animate-[scan_12s_linear_infinite]"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
      `}} />
    </div>
  );
};

export default MotorDisabilityScene;
