
import React, { useState, useEffect, useRef } from 'react';
import AIGuide from './AIGuide';
import { ChatMessage } from '../types';

interface Props {
  onComplete: (score: number) => void;
  history: ChatMessage[];
  onUpdateHistory: (messages: ChatMessage[]) => void;
}

const HearingLossScene: React.FC<Props> = ({ onComplete, history, onUpdateHistory }) => {
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [stage, setStage] = useState(1);
  const [isDone, setIsDone] = useState(false);
  
  const currentText = [
    "Welcome to today's accessibility seminar.",
    "We will discuss the impact of inclusive design on modern urban infrastructure.",
    "It is crucial to understand that design barriers are not just physical, but systemic.",
    "Did you know that 466 million people worldwide have disabling hearing loss?",
    "Always remember to face the person you are speaking to and provide captions for digital media."
  ];

  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex(prev => {
        if (prev < currentText.length - 1) return prev + 1;
        setIsDone(true);
        return prev;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [currentText.length]);

  const handleFinish = () => {
    onComplete(85);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 p-6 items-center justify-center relative overflow-hidden">
      <div className="max-w-4xl w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
        {/* "Video" Presentation Area */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <span className="text-4xl">👨‍🏫</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Accessibility Awareness Seminar</h2>
            <div className={`mt-8 space-y-2 text-slate-400 transition-opacity duration-500 ${stage > 1 ? 'opacity-20' : 'opacity-100'}`}>
                <div className="h-2 w-48 bg-slate-800 rounded mx-auto"></div>
                <div className="h-2 w-64 bg-slate-800 rounded mx-auto"></div>
                <div className="h-2 w-32 bg-slate-800 rounded mx-auto"></div>
            </div>
        </div>

        {/* Caption Layer */}
        {captionsEnabled && (
          <div className="absolute bottom-12 left-0 right-0 px-12">
            <div className="bg-black/80 backdrop-blur p-4 rounded-lg text-center border border-white/10">
              <p className="text-xl font-medium text-white">{currentText[textIndex]}</p>
            </div>
          </div>
        )}

        {!captionsEnabled && (
           <div className="absolute bottom-12 left-0 right-0 flex justify-center opacity-50">
             <div className="w-8 h-8 border-2 border-slate-700 rounded-full animate-ping"></div>
           </div>
        )}
      </div>

      <div className="mt-12 max-w-md w-full grid grid-cols-1 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-cyan-400 uppercase">Simulation Status</span>
            <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] rounded uppercase font-bold">Muffled Audio Active</span>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            We are simulating high-frequency hearing loss. Notice how the ambient noise feels distant and speech clarity is reduced.
          </p>
          
          <div className="flex gap-3">
             <button 
                onClick={() => setCaptionsEnabled(!captionsEnabled)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${captionsEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                {captionsEnabled ? 'Turn Captions OFF' : 'Turn Captions ON'}
              </button>
              {isDone && (
                <button 
                  onClick={handleFinish}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold"
                >
                  Finish Session
                </button>
              )}
          </div>
        </div>
      </div>

      {/* AI Guide Integration */}
      <AIGuide context="Hearing Loss" history={history} onUpdateHistory={onUpdateHistory} />
    </div>
  );
};

export default HearingLossScene;
