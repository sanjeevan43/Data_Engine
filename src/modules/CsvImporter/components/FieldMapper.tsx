import React from 'react';
import type { ColumnMapping, FieldType } from '../types';
import { ArrowRight, Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface FieldMapperProps {
    headers: string[];
    mappings: ColumnMapping[];
    onMappingChange: (newMappings: ColumnMapping[]) => void;
}

export const FieldMapper: React.FC<FieldMapperProps> = ({ mappings, onMappingChange }) => {

    const updateMapping = (index: number, updates: Partial<ColumnMapping>) => {
        const newMappings = [...mappings];
        newMappings[index] = { ...newMappings[index], ...updates };
        onMappingChange(newMappings);
    };

    return (
        <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-12 gap-4 font-semibold text-sm text-slate-600">
                <div className="col-span-3">CSV Column</div>
                <div className="col-span-1 flex justify-center items-center"><ArrowRight className="w-4 h-4" /></div>
                <div className="col-span-2">Firestore Field</div>
                <div className="col-span-2">Data Type</div>
                <div className="col-span-2 text-center">Required</div>
                <div className="col-span-2 text-center">Actions</div>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {mappings.map((m, idx) => (
                    <div
                        key={idx}
                        className={clsx(
                            "grid grid-cols-12 gap-4 items-center p-3 rounded-md border transition-colors",
                            m.ignore ? "bg-slate-100 border-transparent opacity-60" : "bg-white border-slate-200 hover:border-blue-300"
                        )}
                    >
                        <div className="col-span-3 truncate text-slate-700 font-medium" title={m.csvHeader}>
                            {m.csvHeader}
                        </div>

                        <div className="col-span-1 flex justify-center text-slate-400">
                            <ArrowRight className="w-4 h-4" />
                        </div>

                        <div className="col-span-2">
                            <input
                                type="text"
                                disabled={m.ignore}
                                value={m.firestoreField}
                                onChange={(e) => updateMapping(idx, { firestoreField: e.target.value })}
                                className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
                                placeholder="Field name"
                            />
                        </div>

                        <div className="col-span-2">
                            <select
                                disabled={m.ignore}
                                value={m.type}
                                onChange={(e) => updateMapping(idx, { type: e.target.value as FieldType })}
                                className="w-full px-3 py-2 border rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
                            >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="timestamp">Timestamp</option>
                            </select>
                        </div>

                        <div className="col-span-2 flex justify-center items-center">
                            <input
                                type="checkbox"
                                disabled={m.ignore}
                                checked={m.required || false}
                                onChange={(e) => updateMapping(idx, { required: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                        </div>

                        <div className="col-span-2 flex justify-center">
                            <button
                                onClick={() => updateMapping(idx, { ignore: !m.ignore })}
                                className={clsx(
                                    "p-2 rounded hover:bg-slate-200 transition-colors",
                                    m.ignore ? "text-slate-400" : "text-red-500"
                                )}
                                title={m.ignore ? "Enable column" : "Ignore column"}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
