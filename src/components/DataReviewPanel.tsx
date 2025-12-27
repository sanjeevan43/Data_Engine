/**
 * Professional Data Cleaning Component
 * Shows AI fixes for human review before import
 */

import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Edit2, X, Check } from 'lucide-react';

interface DataIssue {
    row: number;
    field: string;
    issue: string;
    originalValue: any;
    suggestedFix: any;
    severity: 'error' | 'warning' | 'info';
    autoFixable: boolean;
}

interface DataReviewProps {
    data: Array<Record<string, any>>;
    issues: DataIssue[];
    onAcceptFix: (issueIndex: number) => void;
    onRejectFix: (issueIndex: number) => void;
    onManualEdit: (row: number, field: string, value: any) => void;
    onAcceptAll: () => void;
    onProceed: () => void;
}

export const DataReviewPanel: React.FC<DataReviewProps> = ({
    data,
    issues,
    onAcceptFix,
    onRejectFix,
    onManualEdit,
    onAcceptAll,
    onProceed
}) => {
    const [editingCell, setEditingCell] = useState<{ row: number; field: string } | null>(null);
    const [editValue, setEditValue] = useState('');

    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const fixableCount = issues.filter(i => i.autoFixable).length;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                    <h2 className="text-3xl font-black mb-2">AI Data Review</h2>
                    <p className="text-blue-100">Review AI suggestions before importing to database</p>

                    <div className="mt-6 flex gap-4">
                        <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
                            <div className="text-2xl font-black">{data.length}</div>
                            <div className="text-xs text-blue-100">Total Rows</div>
                        </div>
                        <div className="bg-red-500/30 backdrop-blur px-4 py-2 rounded-xl">
                            <div className="text-2xl font-black">{errorCount}</div>
                            <div className="text-xs text-blue-100">Errors</div>
                        </div>
                        <div className="bg-yellow-500/30 backdrop-blur px-4 py-2 rounded-xl">
                            <div className="text-2xl font-black">{warningCount}</div>
                            <div className="text-xs text-blue-100">Warnings</div>
                        </div>
                        <div className="bg-green-500/30 backdrop-blur px-4 py-2 rounded-xl">
                            <div className="text-2xl font-black">{fixableCount}</div>
                            <div className="text-xs text-blue-100">Auto-Fixable</div>
                        </div>
                    </div>
                </div>

                {/* Issues List */}
                <div className="flex-1 overflow-y-auto p-8">
                    {issues.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Issues Found!</h3>
                            <p className="text-slate-600">Your data is clean and ready to import.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {issues.map((issue, index) => (
                                <div
                                    key={index}
                                    className={`border-2 rounded-2xl p-6 ${issue.severity === 'error'
                                            ? 'border-red-200 bg-red-50'
                                            : issue.severity === 'warning'
                                                ? 'border-yellow-200 bg-yellow-50'
                                                : 'border-blue-200 bg-blue-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                {issue.severity === 'error' && (
                                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                                )}
                                                {issue.severity === 'warning' && (
                                                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                                )}
                                                <span className="font-bold text-slate-900">
                                                    Row {issue.row}, Field: {issue.field}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${issue.severity === 'error'
                                                        ? 'bg-red-500 text-white'
                                                        : issue.severity === 'warning'
                                                            ? 'bg-yellow-500 text-white'
                                                            : 'bg-blue-500 text-white'
                                                    }`}>
                                                    {issue.severity.toUpperCase()}
                                                </span>
                                            </div>

                                            <p className="text-slate-700 mb-4">{issue.issue}</p>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-xs font-bold text-slate-500 mb-1">Original Value</div>
                                                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 font-mono text-sm">
                                                        {String(issue.originalValue)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-500 mb-1">AI Suggestion</div>
                                                    <div className="bg-green-100 px-4 py-2 rounded-lg border border-green-300 font-mono text-sm text-green-900">
                                                        {String(issue.suggestedFix)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 ml-4">
                                            <button
                                                onClick={() => onAcceptFix(index)}
                                                className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition flex items-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => onRejectFix(index)}
                                                className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingCell({ row: issue.row, field: issue.field });
                                                    setEditValue(String(issue.originalValue));
                                                }}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition flex items-center gap-2"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="border-t border-slate-200 p-6 bg-slate-50 flex justify-between items-center">
                    <div className="text-sm text-slate-600">
                        {fixableCount > 0 && (
                            <span>💡 {fixableCount} issues can be auto-fixed</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {fixableCount > 0 && (
                            <button
                                onClick={onAcceptAll}
                                className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition"
                            >
                                Accept All Fixes ({fixableCount})
                            </button>
                        )}
                        <button
                            onClick={onProceed}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition"
                        >
                            Proceed to Import
                        </button>
                    </div>
                </div>
            </div>

            {/* Manual Edit Modal */}
            {editingCell && (
                <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold mb-4">Edit Value</h3>
                        <p className="text-slate-600 mb-4">
                            Row {editingCell.row}, Field: {editingCell.field}
                        </p>
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none mb-6"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    onManualEdit(editingCell.row, editingCell.field, editValue);
                                    setEditingCell(null);
                                }}
                                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditingCell(null)}
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
