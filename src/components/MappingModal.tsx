import React from 'react';
import { X, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { MappingField } from '../hooks/useCsvImporter';

interface MappingModalProps {
    fileName: string;
    rowCount: number;
    mapping: MappingField[];
    onUpdateMapping: (index: number, updates: Partial<MappingField>) => void;
    onCommit: () => void;
    onCancel: () => void;
    isImporting: boolean;
    collectionName: string;
}

export const MappingModal: React.FC<MappingModalProps> = ({
    fileName,
    rowCount,
    mapping,
    onUpdateMapping,
    onCommit,
    onCancel,
    isImporting,
    collectionName
}) => {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                <div className="bg-gradient-to-br from-indigo-700 via-blue-700 p-10 text-white flex justify-between items-center">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black">Field Mapping</h2>
                        <p className="text-white/70">Source: {fileName} ({rowCount} rows)</p>
                    </div>
                    <button onClick={onCancel} disabled={isImporting} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all disabled:opacity-50">
                        <X />
                    </button>
                </div>

                <div className="p-10 max-h-[50vh] overflow-y-auto space-y-3 bg-slate-50/50 scrollbar-custom">
                    {mapping.map((f, i) => (
                        <div key={i} className={`flex items-center gap-6 p-4 rounded-2xl border-2 transition-all ${f.isEnabled ? 'bg-white border-blue-50 shadow-sm' : 'bg-slate-100 border-transparent opacity-60'}`}>
                            <div className="flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={f.isEnabled}
                                    onChange={(e) => onUpdateMapping(i, { isEnabled: e.target.checked })}
                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CSV Header</p>
                                <div className="font-bold text-slate-700 truncate" title={f.csvHeader}>{f.csvHeader || '(Empty)'}</div>
                            </div>

                            <ChevronRight className="text-slate-300" />

                            <div className="flex-1">
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Target Field</p>
                                <input
                                    type="text"
                                    value={f.firestoreField}
                                    disabled={!f.isEnabled}
                                    onChange={(e) => onUpdateMapping(i, { firestoreField: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                                    className="w-full bg-slate-50 px-3 py-2 rounded-lg font-bold outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200 transition-all text-slate-700"
                                    placeholder="field_name"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-10 border-t bg-white flex gap-4 z-10 relative">
                    <button
                        onClick={onCommit}
                        disabled={isImporting}
                        className="btn-primary flex-1 py-5 text-lg font-black flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isImporting ? (
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Importing...</span>
                            </div>
                        ) : (
                            <>
                                Commit to {collectionName} <CheckCircle2 />
                            </>
                        )}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isImporting}
                        className="btn-secondary px-8 font-bold disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
