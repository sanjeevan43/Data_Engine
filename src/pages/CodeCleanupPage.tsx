/**
 * Code Cleanup Page
 * 
 * Dedicated page for running the Code Cleanup Agent
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Play, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { CodeCleanupPanel } from '../components/CodeCleanupPanel';
import type { CodeFile } from '../services/ai/agent/CodeCleanupAgent';

export default function CodeCleanupPage() {
    const navigate = useNavigate();
    const [showPanel, setShowPanel] = useState(false);
    const [demoFiles, setDemoFiles] = useState<CodeFile[]>([]);

    // Demo: Load sample files for demonstration
    const loadDemoFiles = () => {
        const sampleFiles: CodeFile[] = [
            {
                path: 'src/demo/example.tsx',
                language: 'typescriptreact',
                content: `
import React from 'react';

// TODO: Fix this component
export function example_component() {
    const user_name = "John";
    const user_email = "john@example.com";
    
    // This is a comentted out code
    // const old_code = "remove this";
    
    console.log("Debug message");
    
    return (
        <div onClick={() => alert('clicked')}>
            <img src="logo.png" />
            {users.map(user => (
                <div>{user.name}</div>
            ))}
            <button>Click Me</button>
        </div>
    );
}
                `.trim()
            },
            {
                path: 'src/demo/utils.ts',
                language: 'typescript',
                content: `
export function calculate_total(items: any[]) {
    let total = 0;
    
    // Iterate thru items
    for (let i = 0; i < items.length; i++) {
        total += items[i].price;
    }
    
    console.log("Total:", total);
    
    return total;
}

export async function fetchData() {
    const response = await fetch('/api/data');
    const data = response.json();
    return data;
}

export const MAX_SIZE = 10000; // Magic number
                `.trim()
            }
        ];

        setDemoFiles(sampleFiles);
        setShowPanel(true);
    };

    const handleApplyFixes = (fixedFiles: Map<string, string>) => {
        console.log('✅ Applied fixes to files:', Array.from(fixedFiles.keys()));
        alert(`Successfully applied fixes to ${fixedFiles.size} files!`);
        setShowPanel(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="mb-12">
                    <button
                        onClick={() => navigate('/app')}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold">Back to App</span>
                    </button>

                    <div className="flex items-center gap-6 mb-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-3xl shadow-2xl">
                            <Sparkles className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black text-white mb-2">Code Cleanup Agent</h1>
                            <p className="text-xl text-purple-200">AI-powered code analysis and automatic fixes</p>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <div className="glass bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                        <div className="bg-green-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-7 h-7 text-green-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Naming Conventions</h3>
                        <p className="text-purple-200">
                            Automatically detect and fix inconsistent variable names, component naming, and more
                        </p>
                    </div>

                    <div className="glass bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                        <div className="bg-blue-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                            <AlertCircle className="w-7 h-7 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Spelling Mistakes</h3>
                        <p className="text-purple-200">
                            Find and correct typos in code, comments, and strings throughout your codebase
                        </p>
                    </div>

                    <div className="glass bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                        <div className="bg-red-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                            <AlertCircle className="w-7 h-7 text-red-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Data Errors</h3>
                        <p className="text-purple-200">
                            Detect potential null access, missing error handling, and data-related bugs
                        </p>
                    </div>

                    <div className="glass bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                        <div className="bg-purple-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                            <Sparkles className="w-7 h-7 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">UI Bugs</h3>
                        <p className="text-purple-200">
                            Find missing keys, accessibility issues, and UI/UX problems in React components
                        </p>
                    </div>

                    <div className="glass bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                        <div className="bg-yellow-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-7 h-7 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Code Quality</h3>
                        <p className="text-purple-200">
                            Remove console.logs, TODOs, commented code, and improve overall code quality
                        </p>
                    </div>

                    <div className="glass bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                        <div className="bg-pink-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                            <Download className="w-7 h-7 text-pink-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Export Reports</h3>
                        <p className="text-purple-200">
                            Generate detailed HTML reports with all issues, suggestions, and statistics
                        </p>
                    </div>
                </div>

                {/* How It Works */}
                <div className="glass bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 mb-12">
                    <h2 className="text-3xl font-black text-white mb-6">How It Works</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="bg-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4">
                                1
                            </div>
                            <h4 className="font-bold text-white mb-2">Scan Codebase</h4>
                            <p className="text-sm text-purple-200">
                                Agent reads all your code files and analyzes them
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4">
                                2
                            </div>
                            <h4 className="font-bold text-white mb-2">Detect Issues</h4>
                            <p className="text-sm text-purple-200">
                                AI identifies naming, spelling, bugs, and quality issues
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4">
                                3
                            </div>
                            <h4 className="font-bold text-white mb-2">Review Results</h4>
                            <p className="text-sm text-purple-200">
                                See all issues categorized by type and severity
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-pink-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4">
                                4
                            </div>
                            <h4 className="font-bold text-white mb-2">Apply Fixes</h4>
                            <p className="text-sm text-purple-200">
                                Automatically fix issues or manually review suggestions
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <button
                        onClick={loadDemoFiles}
                        className="group px-12 py-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-2xl shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all inline-flex items-center gap-4"
                    >
                        <Play className="w-8 h-8" />
                        Run Demo Analysis
                    </button>
                    <p className="text-purple-200 mt-4">
                        Try it with sample code to see how it works
                    </p>
                </div>

                {/* CLI Instructions */}
                <div className="glass bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 mt-12">
                    <h2 className="text-3xl font-black text-white mb-6">CLI Usage</h2>
                    <div className="space-y-4">
                        <div className="bg-slate-900/50 rounded-xl p-4 font-mono text-sm">
                            <div className="text-purple-300 mb-2"># Scan and report issues</div>
                            <div className="text-white">npm run cleanup</div>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 font-mono text-sm">
                            <div className="text-purple-300 mb-2"># Scan and apply automatic fixes</div>
                            <div className="text-white">npm run cleanup:fix</div>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 font-mono text-sm">
                            <div className="text-purple-300 mb-2"># Generate HTML report</div>
                            <div className="text-white">npm run cleanup:report</div>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 font-mono text-sm">
                            <div className="text-purple-300 mb-2"># Do everything (fix + report + verbose)</div>
                            <div className="text-white">npm run cleanup:all</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cleanup Panel */}
            {showPanel && (
                <CodeCleanupPanel
                    files={demoFiles}
                    onClose={() => setShowPanel(false)}
                    onApplyFixes={handleApplyFixes}
                />
            )}
        </div>
    );
}
