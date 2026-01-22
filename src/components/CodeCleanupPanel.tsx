/**
 * Code Cleanup Panel Component
 * 
 * UI for the Code Cleanup Agent - displays issues and allows fixes
 */

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Sparkles, FileCode, Bug, Type, Database, Zap, X, Download } from 'lucide-react';
import { useCodeCleanup } from '../hooks/useCodeCleanup';
import type { CodeIssue, CodeFile } from '../services/ai/agent/CodeCleanupAgent';

interface CodeCleanupPanelProps {
    files: CodeFile[];
    onClose?: () => void;
    onApplyFixes?: (fixedFiles: Map<string, string>) => void;
}

export const CodeCleanupPanel: React.FC<CodeCleanupPanelProps> = ({ files, onClose, onApplyFixes }) => {
    const cleanup = useCodeCleanup();
    const [selectedIssue, setSelectedIssue] = useState<CodeIssue | null>(null);
    const [filterType, setFilterType] = useState<'all' | CodeIssue['type']>('all');
    const [filterSeverity, setFilterSeverity] = useState<'all' | CodeIssue['severity']>('all');
    const [showAutoFixableOnly, setShowAutoFixableOnly] = useState(false);

    // Auto-scan on mount
    useEffect(() => {
        if (files.length > 0) {
            cleanup.scanCodebase(files);
        }
    }, [files]);

    const filteredIssues = cleanup.result?.issues.filter(issue => {
        if (filterType !== 'all' && issue.type !== filterType) return false;
        if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
        if (showAutoFixableOnly && !issue.autoFixable) return false;
        return true;
    }) || [];

    const handleApplyFixes = async () => {
        if (!cleanup.result) return;

        const issuesByFile = new Map<string, CodeIssue[]>();
        cleanup.result.fixedIssues.forEach(issue => {
            const existing = issuesByFile.get(issue.file) || [];
            existing.push(issue);
            issuesByFile.set(issue.file, existing);
        });

        const fixedFiles = await cleanup.applyFixesToAll(files, issuesByFile);
        onApplyFixes?.(fixedFiles);
    };

    const getSeverityColor = (severity: CodeIssue['severity']) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    const getTypeIcon = (type: CodeIssue['type']) => {
        switch (type) {
            case 'naming': return <Type className="w-5 h-5" />;
            case 'spelling': return <FileCode className="w-5 h-5" />;
            case 'data-error': return <Database className="w-5 h-5" />;
            case 'ui-bug': return <Bug className="w-5 h-5" />;
            case 'code-quality': return <Zap className="w-5 h-5" />;
        }
    };

    const exportReport = () => {
        if (!cleanup.result) return;

        const report = `
CODE CLEANUP REPORT
Generated: ${new Date().toLocaleString()}

${cleanup.result.summary}

DETAILED ISSUES
===============

${cleanup.result.issues.map((issue, idx) => `
${idx + 1}. ${issue.file}:${issue.line || '?'}
   Type: ${issue.type}
   Severity: ${issue.severity}
   Issue: ${issue.issue}
   Suggestion: ${issue.suggestion}
   Auto-fixable: ${issue.autoFixable ? 'Yes' : 'No'}
`).join('\n')}
        `.trim();

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code-cleanup-report-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-4 rounded-2xl">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black">Code Cleanup Agent</h2>
                                <p className="text-purple-100">AI-powered code analysis and fixes</p>
                            </div>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Progress */}
                    {cleanup.isScanning && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold">Scanning codebase...</span>
                                <span className="text-sm">{cleanup.progress}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <div
                                    className="bg-white h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${cleanup.progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats */}
                {cleanup.result && (
                    <div className="grid grid-cols-5 gap-4 p-6 bg-slate-50 border-b">
                        <div className="text-center">
                            <div className="text-3xl font-black text-slate-900">{cleanup.result.totalIssues}</div>
                            <div className="text-sm text-slate-600 font-semibold">Total Issues</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-red-600">
                                {cleanup.getIssuesBySeverity('critical').length + cleanup.getIssuesBySeverity('high').length}
                            </div>
                            <div className="text-sm text-slate-600 font-semibold">Critical/High</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-green-600">{cleanup.result.fixedIssues.length}</div>
                            <div className="text-sm text-slate-600 font-semibold">Auto-fixable</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-orange-600">{cleanup.result.unfixedIssues.length}</div>
                            <div className="text-sm text-slate-600 font-semibold">Manual Fix</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-blue-600">{files.length}</div>
                            <div className="text-sm text-slate-600 font-semibold">Files Scanned</div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                {cleanup.result && (
                    <div className="p-6 bg-white border-b flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-slate-700">Type:</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="px-4 py-2 border rounded-xl text-sm font-medium"
                            >
                                <option value="all">All Types</option>
                                <option value="naming">Naming</option>
                                <option value="spelling">Spelling</option>
                                <option value="data-error">Data Errors</option>
                                <option value="ui-bug">UI Bugs</option>
                                <option value="code-quality">Code Quality</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-slate-700">Severity:</label>
                            <select
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value as any)}
                                className="px-4 py-2 border rounded-xl text-sm font-medium"
                            >
                                <option value="all">All Severities</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showAutoFixableOnly}
                                onChange={(e) => setShowAutoFixableOnly(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-semibold text-slate-700">Auto-fixable only</span>
                        </label>

                        <div className="ml-auto flex gap-2">
                            <button
                                onClick={exportReport}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export Report
                            </button>
                            {cleanup.result.fixedIssues.length > 0 && (
                                <button
                                    onClick={handleApplyFixes}
                                    disabled={cleanup.isFixing}
                                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {cleanup.isFixing ? 'Applying...' : `Apply ${cleanup.result.fixedIssues.length} Fixes`}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Issues List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {cleanup.error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 flex items-center gap-4">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                            <div>
                                <h4 className="font-bold text-red-900">Error</h4>
                                <p className="text-red-700">{cleanup.error}</p>
                            </div>
                        </div>
                    )}

                    {cleanup.isScanning && !cleanup.result && (
                        <div className="text-center py-12">
                            <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
                            <p className="text-lg font-semibold text-slate-700">Analyzing your code...</p>
                        </div>
                    )}

                    {cleanup.result && filteredIssues.length === 0 && (
                        <div className="text-center py-12">
                            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-black text-slate-900 mb-2">No Issues Found!</h3>
                            <p className="text-slate-600">Your code looks great with the current filters.</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {filteredIssues.map((issue, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedIssue(issue)}
                                className={`border-2 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg ${
                                    selectedIssue === issue ? 'border-purple-500 bg-purple-50' : 'border-slate-200 bg-white'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${getSeverityColor(issue.severity)}`}>
                                        {getTypeIcon(issue.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityColor(issue.severity)}`}>
                                                {issue.severity}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-700">
                                                {issue.type}
                                            </span>
                                            {issue.autoFixable && (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700">
                                                    Auto-fixable
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-slate-900 mb-1">{issue.issue}</h4>
                                        <p className="text-sm text-slate-600 mb-2">{issue.suggestion}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <FileCode className="w-3 h-3" />
                                            <span className="font-mono">{issue.file}</span>
                                            {issue.line && <span>Line {issue.line}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
