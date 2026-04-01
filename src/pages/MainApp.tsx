import { useState, useMemo } from 'react';
import { Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { FileUpload } from '../components/FileUpload';
import { Header } from '../components/Header';
import { SettingsModal } from '../components/SettingsModal';
import { EnhancedMappingModal } from '../components/EnhancedMappingModal';
import { DataOrchestratorPanel } from '../components/DataOrchestratorPanel';
import { Stats } from '../components/Stats';
import { DataGrid } from '../components/DataGrid';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { useFirebase } from '../context/FirebaseContext';
import { useCsvImporter } from '../hooks/useCsvImporter';
import { useCollectionData } from '../hooks/useCollectionData';
import { DataOrchestratorAgent, type OrchestrationResult } from '../services/ai/agent/DataOrchestratorAgent';

/**
 * Main application page – displayed after the user clicks "Get Started" on the landing page.
 * It contains the full CSV‑import workflow: upload, preview, stats, and a button to commit the data.
 */
export default function MainApp() {
    const { config, isConnected } = useFirebase();
    const { data, error: dataError, isPurging, purge } = useCollectionData();
    const importer = useCsvImporter();

    const [showSettings, setShowSettings] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    
    // Orchestration State
    const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResult | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    const orchestrator = useMemo(() => new DataOrchestratorAgent({
        apiKey: config.aiApiKey,
        model: config.aiModel
    }), [config.aiApiKey, config.aiModel]);

    // Derived state – unique file count for stats
    const uniqueFilesCount = useMemo(
        () => new Set(data.map(row => (row as any)._fileName || 'Cloud Source')).size,
        [data],
    );

    // Handlers ----------------------------------------------------------
    const handleFileSelect = async (files: File[]) => {
        if (files.length === 0) return;
        
        setPendingFiles(files);
        
        // Use the first file for orchestration demo (batch orchestration can be added later)
        const file = files[0];
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(l => l.trim());
            const headers = lines[0].split(',').map(h => h.trim());
            const rows = lines.slice(1).map(l => l.split(',').map(v => v.trim()));
            
            const result = await orchestrator.orchestrate(file.name, headers, rows);
            setOrchestrationResult(result);
        };
        
        reader.readAsText(file);
    };

    const handleApproveOrchestration = async (result: OrchestrationResult) => {
        // 1. Prepare the processed files for the importer
        await importer.parseMultipleFiles(pendingFiles);
        
        // 2. Apply the orchestration suggestions to the importer's first file mapping
        if (importer.processedFiles.length > 0) {
            const neuralMapping = result.fields.map(f => ({
                csvHeader: f.originalHeader,
                firestoreField: f.suggestedName,
                isEnabled: true,
                isPrimaryKey: f.isPrimaryKey,
                dataType: f.dataType,
                isRequired: f.isPrimaryKey,
                isUnique: f.isPrimaryKey
            }));
            
            importer.updateMapping(0, neuralMapping);
        }
        
        setOrchestrationResult(null);
    };

    const handleCommit = async () => {
        await importer.commit();
        if (!importer.error) {
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 5000);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative lg:overflow-x-hidden selection:bg-cyan-500/30">
            {/* Ultra Modern Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none" />
            
            {/* Ambient Glow */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Neural Orchestrator Panel – shown before mapping */}
            {orchestrationResult && (
                <DataOrchestratorPanel 
                    fileName={pendingFiles[0]?.name || 'dataset.csv'}
                    result={orchestrationResult}
                    onApprove={handleApproveOrchestration}
                    onCancel={() => {
                        setOrchestrationResult(null);
                        setPendingFiles([]);
                    }}
                />
            )}

            {/* Enhanced Mapping modal – appears after orchestration is approved or skipped */}
            {!orchestrationResult && importer.processedFiles.length > 0 && (
                <EnhancedMappingModal
                    processedFiles={importer.processedFiles}
                    onUpdateMapping={(fileIndex, mappingIndex, updates) => {
                        if (importer.processedFiles.length > fileIndex) {
                            const cur = importer.processedFiles[fileIndex].mapping;
                            const newMap = cur.map((field, i) => (i === mappingIndex ? { ...field, ...updates } : field));
                            importer.updateMapping(fileIndex, newMap);
                        }
                    }}
                    onCommit={handleCommit}
                    onCancel={importer.reset}
                    isImporting={importer.isImporting}
                    collectionName={config.collectionName}
                />
            )}

            {showSettings && (
                <SettingsModal onClose={() => setShowSettings(false)} />
            )}

            {/* Success toast */}
            {showSuccessToast && importer.successCount && (
                <div className="fixed top-8 right-8 z-[120] animate-in slide-in-from-right-full">
                    <div className="glass bg-zinc-900/90 rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] p-6 flex items-center gap-5">
                        <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl shadow-lg">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Import Successful</h4>
                            <p className="text-cyan-400 font-medium text-sm">{importer.successCount} records securely synchronized.</p>
                        </div>
                    </div>
                </div>
            )}

            <Header onOpenSettings={() => setShowSettings(true)} />

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 -mt-20 space-y-12">
                {/* Error banner */}
                {(importer.error || dataError) && (
                    <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 p-6 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-top-6 w-full max-w-4xl mx-auto">
                        <div className="flex items-center gap-6">
                            <div className="bg-red-500/20 p-5 rounded-2xl">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-black text-white text-xl mb-1">System Alert</h3>
                                <p className="text-red-200 font-medium">{importer.error || dataError}</p>
                            </div>
                        </div>
                        {!isConnected && (
                            <button onClick={() => setShowSettings(true)} className="px-8 py-4 bg-slate-800/80 text-red-500 rounded-2xl font-black hover:bg-slate-800 transition-all transform hover:scale-105 shadow-xl border border-red-500/20">
                                Fix Settings
                            </button>
                        )}
                    </div>
                )}

                {/* File upload area */}
                <div className="w-full max-w-5xl mx-auto rounded-[2rem] p-px bg-gradient-to-b from-white/10 to-transparent">
                    <div className="bg-zinc-950/80 backdrop-blur-xl p-3 rounded-[2rem]">
                        <FileUpload onFileSelect={handleFileSelect} />
                    </div>
                </div>

                {/* Offline warning */}
                {!isConnected && (
                    <div className="w-full max-w-4xl mx-auto bg-zinc-900/30 backdrop-blur-xl p-16 rounded-[2rem] text-center border border-white/5 shadow-2xl space-y-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="inline-block p-6 bg-black rounded-2xl border border-white/10 mb-2 relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <Database className="w-10 h-10 text-cyan-400 group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all" />
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-white">Project Unlinked</h2>
                        <p className="text-zinc-400 max-w-lg mx-auto text-lg">
                            Configure your pipeline destination to enable edge sync and structured dataset mapping.
                        </p>
                        <button onClick={() => setShowSettings(true)} className="btn-primary py-4 px-10 text-lg">
                            Setup Connection
                        </button>
                    </div>
                )}

                {/* When DB is connected – stats, import button, grid */}
                {isConnected && (
                    <div className="w-full max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700 relative z-20">
                        <Stats
                            isDbConnected={isConnected}
                            totalStorage={data.length}
                            collectionName={config.collectionName}
                            uniqueFilesCount={uniqueFilesCount}
                        />
                        {/* Import Data button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleCommit}
                                className="group relative px-6 py-3 bg-white text-black rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Execute Sync Pipeline <CheckCircle2 className="w-5 h-5 group-hover:text-cyan-600 transition-colors" />
                                </span>
                            </button>
                        </div>
                        <DataGrid data={data} onPurge={purge} isPurging={isPurging} collectionName={config.collectionName} />
                    </div>
                )}
            </main>

            {/* Privacy Notice */}
            <PrivacyNotice />

            {/* Page footer */}
            <footer className="bg-black py-16 border-t border-white/5 mt-32 relative z-20">
                <div className="max-w-7xl mx-auto px-10 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Database className="w-6 h-6 text-cyan-400" />
                        <span className="text-2xl font-bold text-white tracking-tight">Omni<span className="text-cyan-400">Flow</span></span>
                    </div>
                    <p className="text-zinc-500 font-medium tracking-wide text-sm flex items-center gap-4">
                        Enterprise Data Infrastructure • 2026
                        <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                        <a href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
