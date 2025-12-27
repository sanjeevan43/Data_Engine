/**
 * Enhanced Field Mapping Modal with Primary/Foreign Key Selection
 */

import React, { useState } from 'react';
import { X, Key, Link, Database, AlertCircle, Info } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-3xl font-black mb-2">Configure Import</h2>
                            <p className="text-blue-100 mb-4">
                                {fileName} • {rowCount} rows → {collectionName}
                            </p>
                            <div className="flex gap-3">
                                <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
                                    <div className="text-sm font-bold">{enabledCount} Fields</div>
                                </div>
                                {primaryKeyCount > 0 && (
                                    <div className="bg-yellow-500/30 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2">
                                        <Key className="w-4 h-4" />
                                        <div className="text-sm font-bold">Primary Key Set</div>
                                    </div>
                                )}
                                {foreignKeyCount > 0 && (
                                    <div className="bg-green-500/30 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2">
                                        <Link className="w-4 h-4" />
                                        <div className="text-sm font-bold">{foreignKeyCount} Foreign Keys</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-white/20 rounded-xl transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                        <strong>Primary Key:</strong> Unique identifier for each row (like ID). Only one field can be primary key.
                        <br />
                        <strong>Foreign Key:</strong> References data in another table. Can have multiple foreign keys.
                    </div>
                </div>

                {/* Field Mapping Table */}
                <div className="flex-1 overflow-y-auto p-6">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-slate-100 z-10">
                            <tr className="text-left">
                                <th className="p-3 font-bold text-slate-700">Enable</th>
                                <th className="p-3 font-bold text-slate-700">CSV Header</th>
                                <th className="p-3 font-bold text-slate-700">Database Field</th>
                                <th className="p-3 font-bold text-slate-700">Type</th>
                                <th className="p-3 font-bold text-slate-700 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Key className="w-4 h-4" />
                                        Primary
                                    </div>
                                </th>
                                <th className="p-3 font-bold text-slate-700 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link className="w-4 h-4" />
                                        Foreign
                                    </div>
                                </th>
                                <th className="p-3 font-bold text-slate-700 text-center">Required</th>
                                <th className="p-3 font-bold text-slate-700 text-center">Unique</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mapping.map((field, index) => (
                                <tr
                                    key={index}
                                    className={`border-b border-slate-200 hover:bg-slate-50 transition ${!field.isEnabled ? 'opacity-50' : ''
                                        }`}
                                >
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={field.isEnabled}
                                            onChange={(e) => onUpdateMapping(index, { isEnabled: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="p-3 font-mono text-sm text-slate-600">
                                        {field.csvHeader}
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="text"
                                            value={field.firestoreField}
                                            onChange={(e) => onUpdateMapping(index, { firestoreField: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                            disabled={!field.isEnabled}
                                        />
                                    </td>
                                    <td className="p-3">
                                        <select
                                            value={field.dataType || 'string'}
                                            onChange={(e) => onUpdateMapping(index, { dataType: e.target.value as any })}
                                            className="px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
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
                                    <td className="p-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={field.isPrimaryKey || false}
                                            onChange={() => handlePrimaryKeyToggle(index)}
                                            className="w-5 h-5 rounded border-slate-300 text-yellow-600 focus:ring-yellow-500"
                                            disabled={!field.isEnabled}
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={field.isForeignKey || false}
                                                onChange={() => handleForeignKeyToggle(index)}
                                                className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                                                disabled={!field.isEnabled}
                                            />
                                            {field.isForeignKey && field.foreignKeyTable && (
                                                <span className="text-xs text-green-600">
                                                    → {field.foreignKeyTable}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={field.isRequired || false}
                                            onChange={(e) => onUpdateMapping(index, { isRequired: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                                            disabled={!field.isEnabled}
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={field.isUnique || false}
                                            onChange={(e) => onUpdateMapping(index, { isUnique: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
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
                    <div className="mx-6 mb-4 bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div className="text-sm text-red-900">
                            <strong>Error:</strong> Only one field can be set as primary key. Please uncheck the others.
                        </div>
                    </div>
                )}

                {primaryKeyCount === 0 && (
                    <div className="mx-6 mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        <div className="text-sm text-yellow-900">
                            <strong>Recommended:</strong> Set a primary key field for better data integrity.
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="border-t border-slate-200 p-6 bg-slate-50 flex justify-between items-center">
                    <div className="text-sm text-slate-600">
                        {enabledCount} of {mapping.length} fields enabled
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition"
                            disabled={isImporting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onCommit}
                            disabled={!canCommit}
                            className={`px-8 py-3 rounded-xl font-bold transition flex items-center gap-2 ${canCommit
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            {isImporting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Database className="w-5 h-5" />
                                    Import to Database
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Foreign Key Configuration Modal */}
            {foreignKeyConfig && (
                <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Link className="w-6 h-6 text-green-600" />
                            Configure Foreign Key
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Field: <strong>{mapping[foreignKeyConfig.fieldIndex].csvHeader}</strong>
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Referenced Table
                                </label>
                                <input
                                    type="text"
                                    value={foreignKeyConfig.table}
                                    onChange={(e) => setForeignKeyConfig({ ...foreignKeyConfig, table: e.target.value })}
                                    placeholder="e.g., users, products"
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-green-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Referenced Field
                                </label>
                                <input
                                    type="text"
                                    value={foreignKeyConfig.field}
                                    onChange={(e) => setForeignKeyConfig({ ...foreignKeyConfig, field: e.target.value })}
                                    placeholder="e.g., id, user_id"
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-green-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={saveForeignKeyConfig}
                                disabled={!foreignKeyConfig.table || !foreignKeyConfig.field}
                                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setForeignKeyConfig(null)}
                                className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300"
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
