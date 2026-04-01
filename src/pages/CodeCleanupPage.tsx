/**
 * Code Cleanup Page
 * 
 * Dedicated page for running the Code Cleanup Agent
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle2, Terminal, Cpu, Shield, Zap, Upload, Search, Settings, Save, X, Activity } from 'lucide-react';
import { CodeCleanupPanel } from '../components/CodeCleanupPanel';
import type { CodeFile } from '../services/ai/agent/CodeCleanupAgent';
import { useFirebase } from '../context/FirebaseContext';
import { Header } from '../components/Header';

export default function CodeCleanupPage() {
    const navigate = useNavigate();
    const { config, updateConfig } = useFirebase();
    const [showPanel, setShowPanel] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [activeFiles, setActiveFiles] = useState<CodeFile[]>([]);

    // Local settings state
    const [aiKey, setAiKey] = useState(config.aiApiKey || '');
    const [aiModel, setAiModel] = useState(config.aiModel || 'gemini-pro');

    const handleSaveSettings = () => {
        updateConfig({
            ...config,
            aiApiKey: aiKey,
            aiModel: aiModel
        });
        setShowSettings(false);
    };

    // AI config derived from persisted settings
    const llmConfig = config.aiApiKey ? {
        provider: 'gemini' as const,
        apiKey: config.aiApiKey,
        model: config.aiModel || 'gemini-pro'
    } : undefined;

    const loadDemoFiles = () => {
        const sampleFiles: CodeFile[] = [
            {
                path: 'src/components/DataGrid.tsx',
                language: 'typescriptreact',
                content: `
import React from 'react';

// TODO: Refactor this mess
export function data_grid_component({ data_items }: any) {
    const user_name = "Admin";
    
    // Debugging logic
    console.log("Rendering grid with items:", data_items);
    
    // This is a commented out legacy logic
    // const old_calc = () => { return data_items.length * 1000; }
    
    return (
        <div onClick={() => alert('Row clicked')} className="grid">
            <img src="icon.png" />
            {data_items.map(item => (
                <div className="row">{item.label}</div>
            ))}
            <button className="btn">Process Data</button>
        </div>
    );
}
                `.trim()
            },
            {
                path: 'src/utils/api_helper.ts',
                language: 'typescript',
                content: `
export async function fetch_data(api_url: string) {
    // Missing try-catch block
    const response = await fetch(api_url);
    const result = await response.json();
    
    // Potential null access
    console.log("Fetched data:", result.data.length);
    
    return result;
}

export const CACHE_TIMEOUT = 50000; // Magic number
                `.trim()
            }
        ];

        setActiveFiles(sampleFiles);
        setShowPanel(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        
        const files = Array.from(e.target.files);
        const codeFiles: CodeFile[] = [];

        for (const file of files) {
            const content = await file.text();
            const ext = file.name.split('.').pop() || '';
            const language = ['tsx', 'jsx'].includes(ext) ? 'typescriptreact' : 'typescript';
            
            codeFiles.push({
                path: file.name,
                content,
                language
            });
        }

        setActiveFiles(codeFiles);
        setShowPanel(true);
    };

    const handleApplyFixes = (fixedFiles: Map<string, string>) => {
        console.log('✅ Applied fixes to files:', Array.from(fixedFiles.keys()));
        alert(`Successfully neutralized ${fixedFiles.size} modules. Manual verification recommended.`);
        setShowPanel(false);
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 overflow-hidden font-sans">
            {/* Neural Background Overlay */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0891b210,transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                
                {/* Animated Particles */}
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-500 rounded-full animate-ping shadow-[0_0_15px_#06b6d4]" />
                <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-purple-500 rounded-full animate-ping delay-700 shadow-[0_0_15px_#a855f7]" />
            </div>

            <Header onOpenSettings={() => navigate('/app')} />

            <main className="relative z-10 pt-32 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
                {/* Back Button */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => navigate('/app')}
                        className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all font-bold uppercase tracking-widest text-[10px]"
                    >
                        <div className="p-2 border border-white/5 rounded-lg group-hover:border-white/20 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Return to Command Center
                    </button>

                    <button
                        onClick={() => setShowSettings(true)}
                        className="group flex items-center gap-3 text-zinc-300 hover:text-cyan-400 transition-all font-bold uppercase tracking-widest text-[10px] bg-white/5 border border-white/10 px-6 py-3 rounded-2xl"
                    >
                        <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        Configure AI Lattice
                    </button>
                </div>

                {/* Hero Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md mb-8">
                            <Cpu className="w-4 h-4 text-cyan-400" />
                            <span className="text-[10px] font-black text-cyan-200 uppercase tracking-[0.2em]">Neural Intelligence Subsystem v4.0</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
                            CODE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">CLEANUP</span> AGENT.
                        </h1>
                        <p className="text-xl text-zinc-400 font-medium leading-relaxed">
                            Autonomous diagnostic engine for real-time refactoring. Eliminate tech debt, neutralize bugs, and optimize architecture with surgical precision.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                         <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl backdrop-blur-sm shadow-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className={`w-4 h-4 ${config.aiApiKey ? 'text-emerald-400' : 'text-zinc-600'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">AI Core Status:</span>
                            </div>
                            <div className="text-sm font-bold flex items-center gap-2">
                                {config.aiApiKey ? (
                                    <>
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-emerald-400 uppercase tracking-tighter">Gemini Online [${config.aiModel}]</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 bg-zinc-700 rounded-full" />
                                        <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Heuristics Passive</span>
                                    </>
                                )}
                            </div>
                         </div>
                    </div>
                </div>

                {/* Main Interaction Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    {/* Demo Card */}
                    <div 
                        onClick={loadDemoFiles}
                        className="group relative h-96 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden cursor-pointer hover:border-cyan-500/30 transition-all duration-500 shadow-2xl"
                    >
                         <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-[80px] group-hover:bg-cyan-600/20 transition-all duration-700" />
                         
                         <div className="p-12 relative z-10 flex flex-col h-full">
                            <div className="w-16 h-16 bg-black border border-white/10 rounded-2xl flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-transform">
                                <Zap className="w-8 h-8 text-cyan-400" />
                            </div>
                            <h3 className="text-4xl font-black mb-4">Neural Demo</h3>
                            <p className="text-zinc-500 text-lg mb-auto">Initialize a sandboxed diagnostics run with pre-compiled modules to witness autonomous structural recovery.</p>
                            
                            <div className="flex items-center gap-3 text-cyan-400 font-black uppercase tracking-widest text-xs">
                                <span>Initiate Sequence</span>
                                <Play className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
                            </div>
                         </div>
                    </div>

                    {/* Scan Card */}
                    <div className="group relative h-96 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-2xl">
                         <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                         />
                         <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[80px] group-hover:bg-purple-600/20 transition-all duration-700" />
                         
                         <div className="p-12 relative z-10 flex flex-col h-full">
                            <div className="w-16 h-16 bg-black border border-white/10 rounded-2xl flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-purple-400" />
                            </div>
                            <h3 className="text-4xl font-black mb-4">Deep System Scan</h3>
                            <p className="text-zinc-500 text-lg mb-auto">Inject your own source modules (.ts, .tsx, .js) into the neural lattice for end-to-end diagnostic and repair protocols.</p>
                            
                            <div className="flex items-center gap-3 text-purple-400 font-black uppercase tracking-widest text-xs">
                                <span>Deploy Modules</span>
                                <Search className="w-4 h-4 group-hover:scale-125 transition-transform" />
                            </div>
                         </div>
                    </div>
                </div>

                {/* CLI & Docs Section */}
                <div className="bg-zinc-900/30 border border-white/5 rounded-[3rem] p-12 backdrop-blur-md">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-black rounded-xl border border-white/10">
                            <Terminal className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Command Line Integration</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <p className="text-zinc-400 font-medium">Deploy the diagnostic engine directly in your terminal for integrated CI/CD pipelines and large-scale codebase operations.</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>CI/CD Workflow Support</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>Detailed HTML Visual Reports</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>Git-integrated safe refactoring</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/60 rounded-3xl p-8 border border-white/5 font-mono text-xs overflow-x-auto shadow-inner">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-zinc-600 mb-1"># Execute full system diagnostic</div>
                                    <div className="text-cyan-400">npm run cleanup</div>
                                </div>
                                <div>
                                    <div className="text-zinc-600 mb-1"># Atomic autonomous repair</div>
                                    <div className="text-purple-400">npm run cleanup:fix</div>
                                </div>
                                <div>
                                    <div className="text-zinc-600 mb-1"># Generate neural visual protocol</div>
                                    <div className="text-emerald-400">npm run cleanup:report</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Hidden Scroll Glow */}
            <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />

            {/* AI Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] w-full max-w-lg shadow-[0_0_100px_rgba(6,182,212,0.1)] overflow-hidden">
                        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-black border border-white/10 rounded-xl">
                                    <Activity className="w-5 h-5 text-cyan-400" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">AI Orchestrator</h3>
                            </div>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Protocol Core (API KEY)</label>
                                <input
                                    type="password"
                                    value={aiKey}
                                    onChange={(e) => setAiKey(e.target.value)}
                                    placeholder="Enter Gemini API Key..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-cyan-500/50 focus:ring-1 ring-cyan-500/20 transition-all font-mono text-xs"
                                />
                                <p className="text-[10px] text-zinc-600 font-medium">Inject your Google Gemini credentials here. Key is stored locally in session.</p>
                             </div>

                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Neural Model Tier</label>
                                <select
                                    value={aiModel}
                                    onChange={(e) => setAiModel(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-cyan-500/50 transition-all font-bold text-xs appearance-none"
                                >
                                    <option value="gemini-pro">GEMINI PRO (LATEST)</option>
                                    <option value="gemini-1.5-pro">GEMINI 1.5 PRO (ADVANCED)</option>
                                    <option value="gemini-1.5-flash">GEMINI 1.5 FLASH (SPEED)</option>
                                </select>
                             </div>

                             <div className="pt-4 flex gap-4">
                                <button
                                    onClick={handleSaveSettings}
                                    className="flex-1 bg-white text-black font-black uppercase py-4 rounded-xl text-xs tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl"
                                >
                                    <Save className="w-4 h-4" />
                                    Synchronize Config
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cleanup Panel Overlay */}
            {showPanel && (
                <CodeCleanupPanel
                    files={activeFiles}
                    onClose={() => setShowPanel(false)}
                    onApplyFixes={handleApplyFixes}
                    llmConfig={llmConfig}
                />
            )}
        </div>
    );
}
