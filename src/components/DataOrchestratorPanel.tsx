/**
 * Neural Data Orchestrator Panel
 * 
 * High-tech UI for visualizing AI data orchestration, 
 * schema prediction, and autonomous cleaning.
 */

import React, { useState, useEffect } from 'react';
import { Database, Sparkles, Activity, CheckCircle2, Shield, Info, ArrowRight, Zap, Target } from 'lucide-react';
import type { OrchestrationResult } from '../services/ai/agent/DataOrchestratorAgent';

interface DataOrchestratorPanelProps {
    fileName: string;
    result: OrchestrationResult;
    onApprove: (result: OrchestrationResult) => void;
    onCancel: () => void;
}

export const DataOrchestratorPanel: React.FC<DataOrchestratorPanelProps> = ({
    fileName,
    result,
    onApprove,
    onCancel
}) => {
    const [isThinking, setIsThinking] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setIsThinking(false);
                    return 100;
                }
                return prev + 5;
            });
        }, 50);
        return () => clearInterval(timer);
    }, []);

    const stats = [
        { label: 'Fields Mapped', value: result.fields.length, icon: Database, color: 'text-cyan-400' },
        { label: 'Cleaned Cells', value: result.cleaningStats.cleanedCells, icon: Zap, color: 'text-purple-400' },
        { label: 'Confidence', value: `${(result.confidence * 100).toFixed(0)}%`, icon: Target, color: 'text-emerald-400' },
        { label: 'Integrity', value: 'Verified', icon: Shield, color: 'text-blue-400' }
    ];

    if (isThinking) {
        return (
            <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-12">
                 <div className="relative mb-12">
                     <div className="w-24 h-24 border-4 border-cyan-500/10 rounded-full animate-ping absolute top-0 left-0" />
                     <div className="w-24 h-24 border-t-2 border-cyan-500 rounded-full animate-spin relative flex items-center justify-center">
                         <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
                     </div>
                 </div>
                 
                 <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Neural <span className="text-cyan-400">Orchestrator</span></h3>
                 <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-8 animate-pulse">Analyzing System Sub-Layer: {fileName}</p>
                 
                 <div className="w-64 h-1 bg-zinc-900 rounded-full overflow-hidden mb-6">
                     <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                 </div>
                 
                 <div className="space-y-2 text-center">
                    <p className="text-[10px] font-black text-cyan-400/60 uppercase">Injecting Cleaning Protocols...</p>
                    <p className="text-[10px] font-black text-purple-400/60 uppercase">Architecting Optimal Schema...</p>
                 </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 sm:p-12 overflow-y-auto font-sans">
            <div className="bg-zinc-950 border border-white/10 w-full max-w-5xl rounded-[3rem] shadow-[0_0_100px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500">
                
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/5 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 blur-[120px] pointer-events-none" />

                {/* Header */}
                <div className="p-10 border-b border-white/5 bg-zinc-900/40 backdrop-blur-xl relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-black border border-white/10 rounded-2xl shadow-inner group">
                                <Activity className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Neural <span className="text-cyan-400">Proposal</span></h2>
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">Source Module: {fileName}</p>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Ready for System Injection</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 relative z-10">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all group">
                                <stat.icon className={`w-5 h-5 ${stat.color} mb-4 group-hover:scale-110 transition-transform`} />
                                <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-10">
                        {/* Schema Proposal View */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-xs font-black uppercase text-zinc-400 flex items-center gap-3">
                                <Database className="w-4 h-4" /> 
                                Optimal Structure Proposal
                            </h3>
                            
                            <div className="p-8 bg-black border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
                                    <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center font-black text-cyan-400">T</div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Suggested Table Name</div>
                                        <div className="text-2xl font-black text-white">{result.suggestedTableName}</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {result.fields.map((field, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 rounded-2xl hover:bg-zinc-900/50 transition-all group shadow-inner">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${field.isPrimaryKey ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                    <Database className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-zinc-600 font-mono italic flex items-center gap-2">
                                                        {field.originalHeader}
                                                        <ArrowRight className="w-3 h-3" />
                                                    </div>
                                                    <div className="font-bold flex items-center gap-2">
                                                        <span className="text-white">{field.suggestedName}</span>
                                                        <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-zinc-500 uppercase tracking-widest">{field.dataType}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {field.isPrimaryKey && <span className="text-[8px] font-black uppercase p-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded">Primary</span>}
                                                <span className="text-[8px] font-bold text-zinc-600 bg-white/5 px-2 py-1 rounded max-w-[120px] truncate hidden md:block">{field.reason}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Side: Cleaning Stats & Actions */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase text-zinc-400 flex items-center gap-3">
                                <Activity className="w-4 h-4" /> 
                                Autonomous Cleaning Log
                            </h3>
                            
                            <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                <div className="space-y-3">
                                    {result.cleaningStats.actions.map((action, i) => (
                                        <div key={i} className="flex items-start gap-4 p-3 bg-black/60 rounded-xl border border-white/5 animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shadow-[0_0_5px_#22d3ee]" />
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wide leading-relaxed">{action}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                                     <div className="flex items-center gap-3 text-emerald-400">
                                         <Shield className="w-5 h-5" />
                                         <span className="text-[10px] font-black uppercase tracking-widest">Integrity Standards Met</span>
                                     </div>
                                     <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">The system has aligned 100% of modules with the neural schema proposal.</p>
                                </div>
                            </div>

                            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-[2rem] flex items-center gap-4">
                                <Info className="w-6 h-6 text-blue-400 shrink-0" />
                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-loose">Approving this proposal will synchronize the module with your destination database.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-10 border-t border-white/5 bg-zinc-900/60 backdrop-blur-2xl relative z-10 flex flex-col sm:flex-row gap-6">
                    <button 
                        onClick={() => onApprove(result)}
                        className="flex-1 bg-white text-black font-black uppercase text-xs p-5 rounded-2xl tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                        <Zap className="w-5 h-5 fill-current" />
                        Approve & Neural Import
                    </button>
                    
                    <button 
                        onClick={onCancel}
                        className="px-8 py-5 text-zinc-500 hover:text-white font-black uppercase text-xs tracking-widest transition-all"
                    >
                        Discard Modules
                    </button>
                </div>
            </div>
        </div>
    );
};
