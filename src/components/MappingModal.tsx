import React, { useState } from 'react';
import { X, ChevronRight, CheckCircle2, FileText, Settings2 } from 'lucide-react';
import type { MappingField, ProcessedFile } from '../hooks/useCsvImporter';

interface MappingModalProps {
    processedFiles: ProcessedFile[];
    onUpdateMapping: (fileIndex: number, mappingIndex: number, updates: Partial<MappingField>) => void;
    onCommit: () => void;
    onCancel: () => void;
    isImporting: boolean;
    collectionName: string;
}

export const MappingModal: React.FC<MappingModalProps> = ({
    processedFiles,
    onUpdateMapping,
    onCommit,
    onCancel,
    isImporting,
    collectionName
}) => {
    const [selectedFileIdx, setSelectedFileIdx] = useState(0);

    if (!processedFiles || processedFiles.length === 0) return null;

    const currentFile = processedFiles[selectedFileIdx];
    const mapping = currentFile.mapping || [];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="w-full max-w-5xl bg-zinc-950 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 relative flex flex-col max-h-[90vh]">
                {/* Top Glowing Edge */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-20" />
                
                <div className="bg-black p-8 text-white flex justify-between items-center border-b border-white/5 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-cyan-500/10 p-3 rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                            <Settings2 className="text-cyan-400 w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black tracking-tight">Schema Mapping</h2>
                            <p className="text-zinc-500 font-medium text-sm">Review AI inferences and finalize database schemas.</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10">
                        <X size={24} className="text-zinc-400 hover:text-white" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar - File List if multiple */}
                    {processedFiles.length > 1 && (
                        <div className="w-1/3 border-r border-white/5 bg-zinc-950 flex flex-col overflow-y-auto scrollbar-custom p-6 space-y-3">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 pl-2">Uploaded Files</h3>
                            {processedFiles.map((pf, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedFileIdx(idx)}
                                    className={`flex flex-col gap-1 p-4 rounded-2xl border text-left transition-all ${selectedFileIdx === idx
                                        ? 'bg-cyan-500/10 border-cyan-500/30'
                                        : 'bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <FileText className={`w-5 h-5 shrink-0 ${selectedFileIdx === idx ? 'text-cyan-400' : 'text-zinc-500'}`} />
                                        <span className={`font-bold truncate text-sm ${selectedFileIdx === idx ? 'text-white' : 'text-zinc-400'}`}>
                                            {pf.file.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-zinc-600 font-medium pl-8">{pf.file.data.length} rows processed</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Right Side - Mapping for Selected File */}
                    <div className="flex-1 flex flex-col min-w-0 bg-black">
                        <div className="p-6 border-b border-white/5 bg-zinc-900/30 shrink-0">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                Mapping for <span className="text-cyan-400 truncate max-w-[200px]">{currentFile.file.name}</span>
                            </h3>
                            <p className="text-xs text-zinc-500 font-medium mt-1">Found {mapping.length} potential fields to index.</p>
                        </div>
                        
                        <div className="p-8 flex-1 overflow-y-auto space-y-3 scrollbar-custom border-b border-white/5">
                            {mapping.map((f, i) => (
                                <div key={i} className={`flex items-center gap-6 p-4 rounded-2xl border transition-all duration-300 ${f.isEnabled ? 'bg-zinc-950 border-cyan-500/20 shadow-[0_4px_20px_rgba(6,182,212,0.05)]' : 'bg-black/50 border-white/5 opacity-50'}`}>
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={f.isEnabled}
                                            onChange={(e) => onUpdateMapping(selectedFileIdx, i, { isEnabled: e.target.checked })}
                                            className="w-5 h-5 rounded text-cyan-600 focus:ring-cyan-500 border-gray-300"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">CSV Header</p>
                                        <div className="font-bold text-zinc-200 truncate" title={f.csvHeader}>{f.csvHeader || '(Empty)'}</div>
                                    </div>

                                    <ChevronRight className="text-cyan-500/50" />

                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1">Target Field</p>
                                        <input
                                            type="text"
                                            value={f.firestoreField}
                                            disabled={!f.isEnabled}
                                            onChange={(e) => onUpdateMapping(selectedFileIdx, i, { firestoreField: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                                            className="input-premium py-2 w-full font-mono text-sm bg-black border-white/10 text-white"
                                            placeholder="field_name"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-zinc-950 flex flex-col sm:flex-row gap-4 shrink-0 justify-end z-10 border-t border-white/5">
                    <button
                        onClick={onCancel}
                        disabled={isImporting}
                        className="btn-secondary px-8 font-bold disabled:opacity-50 w-full sm:w-auto"
                    >
                        Cancel All
                    </button>
                    <button
                        onClick={onCommit}
                        disabled={isImporting}
                        className="btn-primary py-4 px-10 text-lg font-black flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed bg-cyan-600 hover:bg-cyan-500 text-black w-full sm:w-auto"
                    >
                        {isImporting ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-4 border-black/30 border-t-black rounded-full animate-spin"></div>
                                <span>Running Pipeline...</span>
                            </div>
                        ) : (
                            <>
                                Commit {processedFiles.length > 1 ? `${processedFiles.length} Files` : ''} to {collectionName} <CheckCircle2 />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
