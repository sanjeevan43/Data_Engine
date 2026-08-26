/**
 * Enhanced Field Mapping Modal with Primary/Foreign Key Selection
 */

import React, { useState } from 'react';
import { X, Key, Link, Database, AlertCircle, Info, Sparkles } from 'lucide-react';

export interface MappingField {
    csvHeader: string;
    firestoreField: string;
    isEnabled: boolean;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    foreignKeyTable?: string;
    foreignKeyField?: string;
    dataType?: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url';
    isRequired?: boolean;
    isUnique?: boolean;
}

interface EnhancedMappingModalProps {
    fileName: string;
    rowCount: number;
    mapping: MappingField[];
    onUpdateMapping: (index: number, updates: Partial<MappingField>) => void;
    onCommit: () => void;
    onCancel: () => void;
    isImporting: boolean;
    collectionName: string;
}

export const EnhancedMappingModal: React.FC<EnhancedMappingModalProps> = ({
    fileName,
    rowCount,
    mapping,
    onUpdateMapping,
    onCommit,
    onCancel,
    isImporting,
    collectionName
}) => {
    const [foreignKeyConfig, setForeignKeyConfig] = useState<{
        fieldIndex: number;
        table: string;
        field: string;
    } | null>(null);

    const primaryKeyCount = mapping.filter(m => m.isPrimaryKey).length;
    const foreignKeyCount = mapping.filter(m => m.isForeignKey).length;
    const enabledCount = mapping.filter(m => m.isEnabled).length;

    const handlePrimaryKeyToggle = (index: number) => {
        const field = mapping[index];

        // If setting as primary key, unset all others
        if (!field.isPrimaryKey) {
            mapping.forEach((_, i) => {
                if (i !== index) {
                    onUpdateMapping(i, { isPrimaryKey: false });
                }
            });
        }

        onUpdateMapping(index, {
            isPrimaryKey: !field.isPrimaryKey,
            isUnique: !field.isPrimaryKey ? true : field.isUnique,
            isRequired: !field.isPrimaryKey ? true : field.isRequired
        });
    };

    const handleForeignKeyToggle = (index: number) => {
        const field = mapping[index];

        if (!field.isForeignKey) {
            setForeignKeyConfig({ fieldIndex: index, table: '', field: '' });
        } else {
            onUpdateMapping(index, {
                isForeignKey: false,
                foreignKeyTable: undefined,
                foreignKeyField: undefined
            });
        }
    };

    const saveForeignKeyConfig = () => {
        if (foreignKeyConfig) {
            onUpdateMapping(foreignKeyConfig.fieldIndex, {
                isForeignKey: true,
                foreignKeyTable: foreignKeyConfig.table,
                foreignKeyField: foreignKeyConfig.field
            });
            setForeignKeyConfig(null);
        }
    };

    const canCommit = enabledCount > 0 && primaryKeyCount <= 1 && !isImporting;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(6,182,212,0.15)] max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
                {/* Visual Glow Ambient */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/5 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/5 blur-[100px] pointer-events-none" />

                {/* Header */}
                <div className="p-8 border-b border-white/10 bg-zinc-900/40 backdrop-blur-xl relative z-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Configure <span className="text-cyan-400">Import</span></h2>
                            </div>
                            <p className="text-zinc-400 text-sm font-medium">
                                {fileName} • <span className="text-cyan-400">{rowCount} rows</span> → {collectionName}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                                    <div className="text-xs font-bold text-zinc-300">{enabledCount} Fields Enabled</div>
                                </div>
                                {primaryKeyCount > 0 && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-yellow-400">
                                        <Key className="w-3.5 h-3.5" />
                                        <div className="text-xs font-bold">Primary Key Set</div>
                                    </div>
                                )}
                                {foreignKeyCount > 0 && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-emerald-400">
                                        <Link className="w-3.5 h-3.5" />
                                        <div className="text-xs font-bold">{foreignKeyCount} Foreign Keys</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2.5 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition-all text-zinc-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="bg-cyan-950/20 border-y border-white/5 px-8 py-4 flex items-start gap-3 relative z-10">
                    <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-zinc-400 leading-relaxed">
                        <strong className="text-zinc-200">Primary Key:</strong> Unique identifier for each record. Only one field can be designated. <br />
                        <strong className="text-zinc-200">Foreign Key:</strong> Maps relationships to parent tables in external data models.
                    </div>
                </div>

                {/* Field Mapping Table */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                <th className="pb-4 pl-2">Enable</th>
                                <th className="pb-4">CSV Header</th>
                                <th className="pb-4">Database Field</th>
                                <th className="pb-4">Data Type</th>
                                <th className="pb-4 text-center">Primary</th>
                                <th className="pb-4 text-center">Foreign</th>
                                <th className="pb-4 text-center">Required</th>
                                <th className="pb-4 text-center">Unique</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mapping.map((field, index) => (
                                <tr
                                    key={index}
                                    className={`hover:bg-white/[0.02] transition-colors ${!field.isEnabled ? 'opacity-40' : ''
                                        }`}
                                >
                                    <td className="py-4 pl-2">
                                        <input
                                            type="checkbox"
                                            checked={field.isEnabled}
                                            onChange={(e) => onUpdateMapping(index, { isEnabled: e.target.checked })}
                                            className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-zinc-950"
                                        />
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="font-mono text-sm text-zinc-300 font-bold block max-w-[150px] truncate" title={field.csvHeader}>
                                            {field.csvHeader}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <input
                                            type="text"
                                            value={field.firestoreField}
                                            onChange={(e) => onUpdateMapping(index, { firestoreField: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-white disabled:opacity-50 transition-all font-medium"
                                            disabled={!field.isEnabled}
                                            placeholder="db_field"
                                        />
                                    </td>
                                    <td className="py-4 pr-4">
                                        <select
                                            value={field.dataType || 'string'}
                                            onChange={(e) => onUpdateMapping(index, { dataType: e.target.value as any })}
                                            className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-white disabled:opacity-50 transition-all font-semibold"
                                            disabled={!field.isEnabled}
                                        >
                                            <option value="string">String</option>
                                            <option value="number">Number</option>
                                            <option value="boolean">Boolean</option>
                                            <option value="date">Date</option>
                                            <option value="email">Email</option>
                                            <option value="url">URL</option>
                                        </select>
                                    </td>
                                    <td className="py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={field.isPrimaryKey || false}
                                            onChange={() => handlePrimaryKeyToggle(index)}
                                            className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-yellow-500 focus:ring-yellow-500/50 focus:ring-offset-zinc-950"
                                            disabled={!field.isEnabled}
                                        />
                                    </td>
                                    <td className="py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={field.isForeignKey || false}
                                                onChange={() => handleForeignKeyToggle(index)}
                                                className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-zinc-950"
                                                disabled={!field.isEnabled}
                                            />
                                            {field.isForeignKey && field.foreignKeyTable && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
                                                    {field.foreignKeyTable}.{field.foreignKeyField}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={field.isRequired || false}
                                            onChange={(e) => onUpdateMapping(index, { isRequired: e.target.checked })}
                                            className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-red-500 focus:ring-red-500/50 focus:ring-offset-zinc-950"
                                            disabled={!field.isEnabled}
                                        />
                                    </td>
                                    <td className="py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={field.isUnique || false}
                                            onChange={(e) => onUpdateMapping(index, { isUnique: e.target.checked })}
                                            className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-purple-500 focus:ring-purple-500/50 focus:ring-offset-zinc-950"
                                            disabled={!field.isEnabled}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Validation Messages */}
                {primaryKeyCount > 1 && (
                    <div className="mx-8 mb-6 bg-red-950/20 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-red-200">
                            <strong>System Error:</strong> Multiple primary key constraints specified. Ensure only one unique identifier is mapped.
                        </div>
                    </div>
                )}

                {primaryKeyCount === 0 && (
                    <div className="mx-8 mb-6 bg-yellow-950/20 border border-yellow-500/20 p-4 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-yellow-200">
                            <strong>Standard Recommendation:</strong> Declaring a primary key field is highly recommended to enable updates/upserts.
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="border-t border-white/10 p-6 bg-zinc-900/20 backdrop-blur-xl flex justify-between items-center relative z-10">
                    <div className="text-xs font-black uppercase tracking-widest text-zinc-500">
                        {enabledCount} of {mapping.length} fields enabled
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="btn-secondary py-2.5 px-6 text-sm"
                            disabled={isImporting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onCommit}
                            disabled={!canCommit}
                            className={`btn-primary py-2.5 px-8 text-sm flex items-center gap-2 ${!canCommit ? 'opacity-40 cursor-not-allowed hover:scale-100 shadow-none' : ''}`}
                        >
                            {isImporting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Database className="w-4 h-4" />
                                    Inject Pipeline
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Foreign Key Configuration Modal */}
            {foreignKeyConfig && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-zinc-950 border border-white/10 rounded-[2rem] p-8 max-w-md w-full relative animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-600/5 blur-[50px] pointer-events-none" />
                        
                        <h3 className="text-xl font-black mb-2 text-white uppercase tracking-tighter flex items-center gap-2">
                            <Link className="w-5 h-5 text-emerald-400" />
                            Reference Relation
                        </h3>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-black mb-6">
                            Field: <span className="text-white font-mono">{mapping[foreignKeyConfig.fieldIndex].csvHeader}</span>
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                                    Target Collection / Table
                                </label>
                                <input
                                    type="text"
                                    value={foreignKeyConfig.table}
                                    onChange={(e) => setForeignKeyConfig({ ...foreignKeyConfig, table: e.target.value })}
                                    placeholder="e.g., users, products"
                                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                                    Target Identifier Field
                                </label>
                                <input
                                    type="text"
                                    value={foreignKeyConfig.field}
                                    onChange={(e) => setForeignKeyConfig({ ...foreignKeyConfig, field: e.target.value })}
                                    placeholder="e.g., id, uid"
                                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={saveForeignKeyConfig}
                                disabled={!foreignKeyConfig.table || !foreignKeyConfig.field}
                                className="flex-1 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-40 disabled:hover:bg-white"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setForeignKeyConfig(null)}
                                className="flex-1 px-6 py-3 bg-transparent text-white font-semibold rounded-xl border border-white/10 hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
