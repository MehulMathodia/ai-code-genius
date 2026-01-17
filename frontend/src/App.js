import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

export default function App() {
  const [code, setCode] = useState("// Enter code to analyze...");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const handleRun = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:8000/analyze', { code, language: 'cpp' });
      setResult(data);
    } catch (e) { alert("Backend Error! Is your Python server running?"); }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      {/* LEFT: EDITOR */}
      <div className="w-1/2 flex flex-col border-r border-slate-800">
        <header className="p-4 bg-slate-900/50 flex justify-between items-center border-b border-slate-800">
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">CODE GENIUS PRO</h1>
          <button onClick={handleRun} disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all">
            {loading ? "Analyzing..." : "Analyze Logic"}
          </button>
        </header>
        <Editor height="100%" theme="vs-dark" defaultLanguage="cpp" value={code} onChange={setCode} options={{ fontSize: 16, minimap: { enabled: false }}} />
      </div>

      {/* RIGHT: MULTI-TAB DASHBOARD */}
      <div className="w-1/2 flex flex-col bg-slate-950">
        {result ? (
          <>
            <div className="flex bg-slate-900 border-b border-slate-800">
              {['summary', 'optimized', 'translation'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'border-b-2 border-blue-400 text-blue-400 bg-blue-400/5' : 'text-slate-500'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8 overflow-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Time Complexity</p>
                      <p className="text-2xl font-mono text-emerald-400">{result.complexity.time}</p>
                    </div>
                    <div className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Space Complexity</p>
                      <p className="text-2xl font-mono text-purple-400">{result.complexity.space}</p>
                    </div>
                  </div>
                  <p className="text-lg leading-relaxed text-slate-300">{result.summary}</p>
                </div>
              )}

              {activeTab === 'optimized' && (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-300 text-sm">
                    <strong>Why this is better:</strong> {result.why_optimized}
                  </div>
                  <div className="bg-black rounded-xl p-4 border border-slate-800 font-mono text-sm overflow-x-auto text-emerald-400">
                    <pre>{result.optimization}</pre>
                  </div>
                </div>
              )}

              {activeTab === 'translation' && (
                <div className="bg-black rounded-xl p-4 border border-slate-800 font-mono text-sm text-cyan-300">
                  <pre>{result.translation}</pre>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-600 italic">Enter code to unlock AI insights...</div>
        )}
      </div>
    </div>
  );
}