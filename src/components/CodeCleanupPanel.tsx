/**
 * Code Cleanup Panel Component
 * 
 * UI for the Code Cleanup Agent - displays issues and allows fixes
 */

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Sparkles, FileCode, Bug, Type, Database, Zap, X, Download } from 'lucide-react';
import { useCodeCleanup } from '../hooks/useCodeCleanup';
import type { CodeIssue, CodeFile } from '../services/ai/agent/CodeCleanupAgent';
import type { LLMConfig } from '../services/ai/types';

interface CodeCleanupPanelProps {
    files: CodeFile[];
    onClose?: () => void;
    onApplyFixes?: (fixedFiles: Map<string, string>) => void;
    llmConfig?: LLMConfig;
}

export const CodeCleanupPanel: React.FC<CodeCleanupPanelProps> = ({ files, onClose, onApplyFixes, llmConfig }) => {
    const cleanup = useCodeCleanup(llmConfig);
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-10 select-none">
            <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col relative transition-all duration-500 animate-in fade-in zoom-in duration-300">
                
                {/* Orbital Background Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
                </div>

                {/* Header */}
                <div className="relative border-b border-white/5 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/50 backdrop-blur-xl">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity animate-pulse" />
                            <div className="relative bg-black border border-white/10 p-5 rounded-2xl shadow-2xl">
                                <Sparkles className="w-8 h-8 text-cyan-400" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Cleaner</span></h2>
                                {cleanup.isScanning && (
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                                    </div>
                                )}
                            </div>
                            <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">System Protocol: Active Analysis</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {cleanup.isScanning && (
                            <div className="hidden md:flex flex-col items-end mr-4">
                                <span className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-tighter">Scanning Core Modules</span>
                                <div className="w-32 bg-white/5 h-1 rounded-full overflow-hidden">
                                     <div 
                                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                                        style={{ width: `${cleanup.progress}%` }}
                                     />
                                </div>
                            </div>
                        )}
                         {onClose && (
                            <button
                                onClick={onClose}
                                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:rotate-90"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Bar */}
                {cleanup.result && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-white/5 border-b border-white/5 relative z-10">
                        <div className="p-6 bg-zinc-950 text-center">
                            <div className="text-3xl font-black text-white">{cleanup.result.totalIssues}</div>
                            <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Anomalies Detected</div>
                        </div>
                        <div className="p-6 bg-zinc-950 text-center border-l border-white/5">
                            <div className="text-3xl font-black text-red-500">
                                {cleanup.getIssuesBySeverity('critical').length + cleanup.getIssuesBySeverity('high').length}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Critical Priority</div>
                        </div>
                        <div className="p-6 bg-zinc-950 text-center border-l border-white/5">
                            <div className="text-3xl font-black text-emerald-400">{cleanup.result.fixedIssues.length}</div>
                            <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Autonomous Fixes</div>
                        </div>
                        <div className="p-6 bg-zinc-950 text-center border-l border-white/5">
                            <div className="text-3xl font-black text-purple-400">{cleanup.result.unfixedIssues.length}</div>
                            <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Manual Resolution</div>
                        </div>
                        <div className="p-6 bg-zinc-950 text-center border-l border-white/5 hidden md:block">
                            <div className="text-3xl font-black text-cyan-400">{files.length}</div>
                            <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Modules Parsed</div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                {cleanup.result && (
                    <div className="px-8 py-4 bg-black/40 border-b border-white/5 flex items-center gap-6 flex-wrap relative z-10">
                        <div className="flex items-center gap-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Type Filter:</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white px-3 py-2 outline-none focus:border-cyan-500/50 transition-colors"
                            >
                                <option value="all">ALL CLASSES</option>
                                <option value="naming">NAMING</option>
                                <option value="spelling">SPELLING</option>
                                <option value="data-error">DATA LOGIC</option>
                                <option value="ui-bug">UI/UX BUGS</option>
                                <option value="code-quality">CODE OPTIMIZATION</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Severity:</label>
                            <select
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value as any)}
                                className="bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white px-3 py-2 outline-none focus:border-cyan-500/50 transition-colors"
                            >
                                <option value="all">ALL SEVERITIES</option>
                                <option value="critical">CRITICAL</option>
                                <option value="high">HIGH</option>
                                <option value="medium">MEDIUM</option>
                                <option value="low">LOW</option>
                            </select>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer group">
                             <div className={`w-5 h-5 rounded-md border border-white/20 flex items-center justify-center transition-all ${showAutoFixableOnly ? 'bg-cyan-500 border-cyan-500' : 'bg-transparent'}`}>
                                <input
                                    type="checkbox"
                                    checked={showAutoFixableOnly}
                                    onChange={(e) => setShowAutoFixableOnly(e.target.checked)}
                                    className="hidden"
                                />
                                {showAutoFixableOnly && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                             </div>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">Autonomous Fixes Only</span>
                        </label>

                        <div className="ml-auto flex gap-3">
                            <button
                                onClick={exportReport}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-[10px] text-zinc-300 uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Export Protocol
                            </button>
                            {cleanup.result.fixedIssues.length > 0 && (
                                <button
                                    onClick={handleApplyFixes}
                                    disabled={cleanup.isFixing}
                                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
                                >
                                    <Zap className="w-3.5 h-3.5" />
                                    {cleanup.isFixing ? 'RESTRUCTURING...' : `Execute ${cleanup.result.fixedIssues.length} Fixes`}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Issues List */}
                <div className="flex-1 overflow-y-auto p-8 bg-zinc-950/30">
                    {cleanup.error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-8 mb-8 flex items-center gap-6 animate-in slide-in-from-top duration-500">
                             <div className="p-4 bg-red-500/20 rounded-2xl">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                             </div>
                            <div>
                                <h4 className="font-black text-red-400 text-lg uppercase tracking-tighter">System Malfunction</h4>
                                <p className="text-red-300/70 font-mono text-sm mt-1">{cleanup.error}</p>
                            </div>
                        </div>
                    )}

                    {cleanup.isScanning && !cleanup.result && (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-cyan-500/20 blur-3xl animate-pulse" />
                                <Sparkles className="w-20 h-20 text-cyan-400 animate-spin-slow relative" />
                            </div>
                            <p className="text-xl font-black text-white uppercase tracking-[0.3em] animate-pulse">Deep Coding Analysis in progress</p>
                            <p className="text-zinc-500 font-mono text-sm mt-4 tracking-widest">NEURAL OVERLAY: STAGE ${Math.floor(cleanup.progress / 25) + 1}</p>
                        </div>
                    )}

                    {cleanup.result && filteredIssues.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 group">
                             <div className="relative mb-8 group-hover:scale-110 transition-transform duration-500">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl" />
                                <CheckCircle2 className="w-20 h-20 text-emerald-400 relative" />
                             </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Protocol Perfect</h3>
                            <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs">No anomalies detected in the current scope</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {filteredIssues.map((issue, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedIssue(issue)}
                                className={`group relative border border-white/5 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:border-white/20 overflow-hidden ${
                                    selectedIssue === issue ? 'bg-white/5 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'bg-white/[0.02] hover:bg-white/[0.04]'
                                }`}
                            >
                                {/* Glow effect */}
                                {selectedIssue === issue && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                                )}

                                <div className="flex items-start gap-6 relative z-10">
                                    <div className={`p-4 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${
                                        issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                        issue.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                        issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-blue-500/20 text-blue-400'
                                    }`}>
                                        {getTypeIcon(issue.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-current opacity-70 ${
                                                issue.severity === 'critical' ? 'text-red-400' :
                                                issue.severity === 'high' ? 'text-orange-400' :
                                                issue.severity === 'medium' ? 'text-yellow-400' :
                                                'text-blue-400'
                                            }`}>
                                                {issue.severity}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-white/10 text-zinc-400">
                                                {issue.type}
                                            </span>
                                            {issue.autoFixable && (
                                                <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-400 animate-pulse">
                                                    Autonomous Fix
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-white text-base mb-1 group-hover:text-cyan-400 transition-colors truncate">{issue.issue}</h4>
                                        <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-4 line-clamp-2">{issue.suggestion}</p>
                                        
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                             <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono truncate max-w-[70%]">
                                                <FileCode className="w-3 h-3" />
                                                <span className="truncate">{issue.file}</span>
                                                {issue.line && <span className="text-zinc-500">L:{issue.line}</span>}
                                            </div>
                                            <button className="text-[10px] font-black text-cyan-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Details ⟶</button>
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
