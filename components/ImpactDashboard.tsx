
import React, { useState } from 'react';
import { EmpathyStats, ChatMessage, AppView } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SCENARIOS } from '../constants';

interface Props {
  stats: EmpathyStats;
}

const ImpactDashboard: React.FC<Props> = ({ stats }) => {
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const chartData = [
    { name: 'Knowledge', value: 65 + (stats.scenariosCompleted * 5) },
    { name: 'Awareness', value: 40 + (stats.scenariosCompleted * 10) },
    { name: 'Empathy', value: stats.empathyScore },
    { name: 'Action', value: 20 + (stats.auditReportsGenerated * 15) },
  ];

  const scenarioLogs = (Object.entries(stats.chatHistories) as [string, ChatMessage[]][]).filter(([_, history]) => history.length > 0);

  const getScenarioInfo = (id: string) => {
    if (id === AppView.AR_AUDITOR) {
      return { title: 'AR Spatial Audit', icon: '🛰️' };
    }
    const scenario = SCENARIOS.find(s => s.id === id);
    return scenario ? { title: scenario.title, icon: scenario.icon } : { title: 'Consultation', icon: '🤖' };
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Your Impact Journey</h2>
          <p className="text-slate-400 mt-2">Tracking your growth as an accessibility advocate.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-600/10 text-indigo-400 px-4 py-2 rounded-full border border-indigo-600/20">
          <span className="font-bold">Badge Earned:</span>
          <span>Inclusion Ally</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Scenarios', val: stats.scenariosCompleted, icon: '🎮' },
          { label: 'Empathy Score', val: `${stats.empathyScore}%`, icon: '❤️' },
          { label: 'Audit Reports', val: stats.auditReportsGenerated, icon: '📋' },
          { label: 'Time Spent', val: `${stats.timeSpentMinutes}m`, icon: '⏳' },
        ].map((item, i) => (
          <div key={i} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-2xl font-bold text-white">{item.val}</div>
            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
          <h3 className="text-xl font-bold mb-6">Empathy Development</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
          <h3 className="text-xl font-bold mb-6">Certification Progress</h3>
          <div className="space-y-6">
            {[
              { title: 'Vision Specialist', progress: stats.scenariosCompleted >= 1 ? 100 : 0 },
              { title: 'Hearing Inclusivity', progress: stats.scenariosCompleted >= 2 ? 100 : 0 },
              { title: 'Architectural Barrier Expert', progress: stats.scenariosCompleted >= 3 ? 100 : 0 },
            ].map((cert, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold">{cert.title}</span>
                  <span className="text-slate-500">{cert.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-1000" 
                    style={{ width: `${cert.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-400">Complete all simulations to unlock your LinkedIn-ready certificate.</p>
            <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold opacity-50 cursor-not-allowed">
              Claim Certificate
            </button>
          </div>
        </div>
      </div>

      {/* Conversation Logs Section */}
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>🧠</span> AI Expert Consultations
        </h3>
        
        {scenarioLogs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-500">No consultation records yet. Talk to the AI Guide during your next simulation!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarioLogs.map(([id, history]) => {
              const info = getScenarioInfo(id);
              const historyMsgs = history as ChatMessage[];
              return (
                <button
                  key={id}
                  onClick={() => setSelectedLog(id)}
                  className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-left hover:border-indigo-500/50 transition-all group"
                >
                  <div className="text-3xl mb-3">{info.icon}</div>
                  <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{info.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
                    {historyMsgs.length} Messages
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    View Transcript <span>→</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Transcript Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-2xl h-[80vh] rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-indigo-600/10 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Consultation Log</h2>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">
                  {getScenarioInfo(selectedLog).title} Session
                </p>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/30">
              {stats.chatHistories[selectedLog].map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-500 uppercase font-bold mb-1 px-2">
                    {msg.role === 'user' ? 'You' : 'AI Guide'}
                  </span>
                  <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-800 text-center">
              <button 
                onClick={() => setSelectedLog(null)}
                className="bg-slate-800 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold transition-all"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactDashboard;
