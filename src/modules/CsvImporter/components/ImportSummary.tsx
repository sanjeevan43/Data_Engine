import React from 'react';
import type { ImportSummary as SummaryType } from '../types';
import { CheckCircle, AlertTriangle, FileText, ChevronDown, ChevronRight } from 'lucide-react';

interface ImportSummaryProps {
    summary: SummaryType;
    onReset: () => void;
}

export const ImportSummary: React.FC<ImportSummaryProps> = ({ summary, onReset }) => {
    const [showErrors, setShowErrors] = React.useState(false);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle className="text-green-500" /> Import Complete
                    </h2>
                </div>

                <div className="grid grid-cols-3 divide-x divide-slate-100">
                    <div className="p-6 text-center">
                        <div className="text-2xl font-bold text-slate-900">{summary.totalRows}</div>
                        <div className="text-sm text-slate-500">Total Rows</div>
                    </div>
                    <div className="p-6 text-center bg-green-50">
                        <div className="text-2xl font-bold text-green-600">{summary.successCount}</div>
                        <div className="text-sm text-green-900">Success</div>
                    </div>
                    <div className="p-6 text-center bg-red-50">
                        <div className="text-2xl font-bold text-red-600">{summary.failureCount}</div>
                        <div className="text-sm text-red-900">Failed</div>
                    </div>
                </div>

                {summary.errors.length > 0 && (
                    <div className="border-t border-slate-100">
                        <button
                            onClick={() => setShowErrors(!showErrors)}
                            className="w-full px-6 py-4 flex items-center justify-between text-slate-600 hover:bg-slate-50"
                        >
                            <span className="flex items-center gap-2 font-medium">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                View Error Log ({summary.errors.length})
                            </span>
                            {showErrors ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        {showErrors && (
                            <div className="bg-slate-50 p-4 max-h-60 overflow-y-auto text-sm space-y-2">
                                {summary.errors.map((err, idx) => (
                                    <div key={idx} className="flex gap-2 text-slate-600 border-b border-slate-200 pb-2 last:border-0">
                                        <span className="font-mono text-xs bg-slate-200 px-1 rounded h-fit">Row {err.row}</span>
                                        <span>{err.error}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={onReset}
                className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center justify-center gap-2"
            >
                <FileText className="w-4 h-4" /> Import Another File
            </button>
        </div>
    );
};
