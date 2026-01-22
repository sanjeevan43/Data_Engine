/**
 * React Hook for Code Cleanup Agent
 * 
 * Provides easy access to code cleanup functionality in React components
 */

import { useState } from 'react';
import { CodeCleanupAgent } from '../services/ai/agent/CodeCleanupAgent';
import type { CodeIssue, CleanupResult, CodeFile } from '../services/ai/agent/CodeCleanupAgent';
import type { LLMConfig } from '../services/ai/types';

export const useCodeCleanup = (llmConfig?: LLMConfig) => {
    const [isScanning, setIsScanning] = useState(false);
    const [isFixing, setIsFixing] = useState(false);
    const [result, setResult] = useState<CleanupResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const agent = CodeCleanupAgent.create(llmConfig);

    /**
     * Scan a single file
     */
    const scanFile = async (file: CodeFile): Promise<CodeIssue[]> => {
        setIsScanning(true);
        setError(null);
        
        try {
            const issues = await agent.analyzeFile(file);
            return issues;
        } catch (err: any) {
            setError(`Scan failed: ${err.message}`);
            return [];
        } finally {
            setIsScanning(false);
        }
    };

    /**
     * Scan entire codebase
     */
    const scanCodebase = async (files: CodeFile[]): Promise<CleanupResult> => {
        setIsScanning(true);
        setError(null);
        setProgress(0);

        try {
            const totalFiles = files.length;
            let processedFiles = 0;

            // Process files in batches for progress tracking
            const allIssues: CodeIssue[] = [];
            
            for (const file of files) {
                const fileIssues = await agent.analyzeFile(file);
                allIssues.push(...fileIssues);
                
                processedFiles++;
                setProgress(Math.round((processedFiles / totalFiles) * 100));
            }

            // Generate result
            const issuesByType: Record<string, number> = {
                naming: 0,
                spelling: 0,
                'data-error': 0,
                'ui-bug': 0,
                'code-quality': 0
            };

            allIssues.forEach(issue => {
                issuesByType[issue.type]++;
            });

            const fixedIssues = allIssues.filter(i => i.autoFixable);
            const unfixedIssues = allIssues.filter(i => !i.autoFixable);

            const cleanupResult: CleanupResult = {
                totalIssues: allIssues.length,
                issuesByType,
                issues: allIssues,
                fixedIssues,
                unfixedIssues,
                summary: generateSummary(allIssues, issuesByType)
            };

            setResult(cleanupResult);
            return cleanupResult;
        } catch (err: any) {
            setError(`Codebase scan failed: ${err.message}`);
            throw err;
        } finally {
            setIsScanning(false);
            setProgress(100);
        }
    };

    /**
     * Apply automatic fixes to a file
     */
    const applyFixes = async (file: CodeFile, issues: CodeIssue[]): Promise<string> => {
        setIsFixing(true);
        setError(null);

        try {
            const fixedContent = agent.applyFixes(file, issues);
            return fixedContent;
        } catch (err: any) {
            setError(`Fix failed: ${err.message}`);
            throw err;
        } finally {
            setIsFixing(false);
        }
    };

    /**
     * Apply fixes to multiple files
     */
    const applyFixesToAll = async (
        files: CodeFile[],
        issuesByFile: Map<string, CodeIssue[]>
    ): Promise<Map<string, string>> => {
        setIsFixing(true);
        setError(null);
        setProgress(0);

        try {
            const fixedFiles = new Map<string, string>();
            const totalFiles = files.length;
            let processedFiles = 0;

            for (const file of files) {
                const fileIssues = issuesByFile.get(file.path) || [];
                const fixedContent = agent.applyFixes(file, fileIssues);
                fixedFiles.set(file.path, fixedContent);

                processedFiles++;
                setProgress(Math.round((processedFiles / totalFiles) * 100));
            }

            return fixedFiles;
        } catch (err: any) {
            setError(`Batch fix failed: ${err.message}`);
            throw err;
        } finally {
            setIsFixing(false);
            setProgress(100);
        }
    };

    /**
     * Reset state
     */
    const reset = () => {
        setResult(null);
        setError(null);
        setProgress(0);
        setIsScanning(false);
        setIsFixing(false);
    };

    /**
     * Get issues by severity
     */
    const getIssuesBySeverity = (severity: 'critical' | 'high' | 'medium' | 'low'): CodeIssue[] => {
        if (!result) return [];
        return result.issues.filter(i => i.severity === severity);
    };

    /**
     * Get issues by type
     */
    const getIssuesByType = (type: CodeIssue['type']): CodeIssue[] => {
        if (!result) return [];
        return result.issues.filter(i => i.type === type);
    };

    /**
     * Get issues by file
     */
    const getIssuesByFile = (filePath: string): CodeIssue[] => {
        if (!result) return [];
        return result.issues.filter(i => i.file === filePath);
    };

    return {
        // State
        isScanning,
        isFixing,
        result,
        error,
        progress,

        // Actions
        scanFile,
        scanCodebase,
        applyFixes,
        applyFixesToAll,
        reset,

        // Helpers
        getIssuesBySeverity,
        getIssuesByType,
        getIssuesByFile
    };
};

/**
 * Helper: Generate summary report
 */
function generateSummary(issues: CodeIssue[], issuesByType: Record<string, number>): string {
    const critical = issues.filter(i => i.severity === 'critical').length;
    const high = issues.filter(i => i.severity === 'high').length;
    const medium = issues.filter(i => i.severity === 'medium').length;
    const low = issues.filter(i => i.severity === 'low').length;

    return `
Code Cleanup Analysis Complete
==============================

Total Issues Found: ${issues.length}

By Severity:
- Critical: ${critical}
- High: ${high}
- Medium: ${medium}
- Low: ${low}

By Type:
- Naming Issues: ${issuesByType.naming}
- Spelling Mistakes: ${issuesByType.spelling}
- Data Errors: ${issuesByType['data-error']}
- UI Bugs: ${issuesByType['ui-bug']}
- Code Quality: ${issuesByType['code-quality']}

Auto-fixable: ${issues.filter(i => i.autoFixable).length}
Manual fixes needed: ${issues.filter(i => !i.autoFixable).length}
    `.trim();
}
