/**
 * Code Cleanup Agent
 * 
 * This AI agent scans the entire codebase to:
 * - Fix data errors and missing values
 * - Correct naming conventions and spelling mistakes
 * - Clean up code quality issues
 * - Identify and report UI bugs
 */

import { GeminiService } from '../GeminiService';
import type { LLMConfig } from '../types';

export interface CodeIssue {
    file: string;
    line?: number;
    type: 'naming' | 'spelling' | 'data-error' | 'ui-bug' | 'code-quality';
    severity: 'critical' | 'high' | 'medium' | 'low';
    issue: string;
    suggestion: string;
    autoFixable: boolean;
}

export interface CleanupResult {
    totalIssues: number;
    issuesByType: Record<string, number>;
    issues: CodeIssue[];
    fixedIssues: CodeIssue[];
    unfixedIssues: CodeIssue[];
    summary: string;
}

export interface CodeFile {
    path: string;
    content: string;
    language: string;
}

export class CodeCleanupAgent {
    private llmService: GeminiService | null = null;

    constructor(llmConfig?: LLMConfig) {
        if (llmConfig?.apiKey) {
            this.llmService = new GeminiService({ apiKey: llmConfig.apiKey });
        }
    }

    /**
     * Analyze a single file for issues
     */
    async analyzeFile(file: CodeFile): Promise<CodeIssue[]> {
        const issues: CodeIssue[] = [];

        // 1. Check naming conventions
        issues.push(...this.checkNamingConventions(file));

        // 2. Check spelling mistakes
        issues.push(...this.checkSpelling(file));

        // 3. Check data errors
        issues.push(...this.checkDataErrors(file));

        // 4. Check UI bugs (for React components)
        if (file.path.endsWith('.tsx') || file.path.endsWith('.jsx')) {
            issues.push(...this.checkUIBugs(file));
        }

        // 5. Check code quality
        issues.push(...this.checkCodeQuality(file));

        // 6. Use AI for advanced analysis (if available)
        if (this.llmService) {
            const aiIssues = await this.analyzeWithAI(file);
            issues.push(...aiIssues);
        }

        return issues;
    }

    /**
     * Check naming conventions
     */
    private checkNamingConventions(file: CodeFile): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const lines = file.content.split('\n');

        lines.forEach((line, index) => {
            // Check for inconsistent variable naming
            const varMatch = line.match(/(?:const|let|var)\s+([a-z_][a-zA-Z0-9_]*)/g);
            if (varMatch) {
                varMatch.forEach(match => {
                    const varName = match.split(/\s+/)[1];
                    
                    // Check for snake_case in JavaScript/TypeScript (should be camelCase)
                    if (varName.includes('_') && !varName.startsWith('_')) {
                        issues.push({
                            file: file.path,
                            line: index + 1,
                            type: 'naming',
                            severity: 'medium',
                            issue: `Variable '${varName}' uses snake_case instead of camelCase`,
                            suggestion: `Rename to '${this.toCamelCase(varName)}'`,
                            autoFixable: true
                        });
                    }

                    // Check for unclear names
                    if (varName.length <= 2 && !['i', 'j', 'k', 'id', 'db'].includes(varName)) {
                        issues.push({
                            file: file.path,
                            line: index + 1,
                            type: 'naming',
                            severity: 'low',
                            issue: `Variable '${varName}' has unclear name`,
                            suggestion: `Use a more descriptive name`,
                            autoFixable: false
                        });
                    }
                });
            }

            // Check component naming (should be PascalCase)
            const componentMatch = line.match(/(?:function|const)\s+([a-z][a-zA-Z0-9]*)\s*(?:=|:|\()/);
            if (componentMatch && file.path.includes('components')) {
                const name = componentMatch[1];
                if (name[0] === name[0].toLowerCase()) {
                    issues.push({
                        file: file.path,
                        line: index + 1,
                        type: 'naming',
                        severity: 'high',
                        issue: `Component '${name}' should start with uppercase`,
                        suggestion: `Rename to '${name[0].toUpperCase() + name.slice(1)}'`,
                        autoFixable: true
                    });
                }
            }
        });

        return issues;
    }

    /**
     * Check for spelling mistakes
     */
    private checkSpelling(file: CodeFile): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const lines = file.content.split('\n');

        // Common misspellings in code
        const misspellings: Record<string, string> = {
            'recieve': 'receive',
            'occured': 'occurred',
            'seperator': 'separator',
            'sucessful': 'successful',
            'sucessfully': 'successfully',
            'sucess': 'success',
            'adress': 'address',
            'lenght': 'length',
            'widht': 'width',
            'heigth': 'height',
            'calender': 'calendar',
            'toogle': 'toggle',
            'visibile': 'visible',
            'avalable': 'available',
            'availible': 'available',
            'definately': 'definitely',
            'seperate': 'separate',
            'occassion': 'occasion',
            'accomodate': 'accommodate',
            'recomend': 'recommend',
            'begining': 'beginning',
            'commited': 'committed',
            'refered': 'referred',
            'transfered': 'transferred',
            'prefered': 'preferred'
        };

        lines.forEach((line, index) => {
            // Check comments and strings for misspellings
            const commentMatch = line.match(/\/\/\s*(.+)$|\/\*\s*(.+?)\s*\*\//);
            const stringMatch = line.match(/['"`]([^'"`]+)['"`]/g);

            const textsToCheck = [
                ...(commentMatch ? [commentMatch[1] || commentMatch[2]] : []),
                ...(stringMatch || [])
            ];

            textsToCheck.forEach(text => {
                if (!text) return;
                
                Object.entries(misspellings).forEach(([wrong, correct]) => {
                    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
                    if (regex.test(text)) {
                        issues.push({
                            file: file.path,
                            line: index + 1,
                            type: 'spelling',
                            severity: 'low',
                            issue: `Misspelled word: '${wrong}'`,
                            suggestion: `Change to '${correct}'`,
                            autoFixable: true
                        });
                    }
                });
            });

            // Check variable/function names for common misspellings
            Object.entries(misspellings).forEach(([wrong, correct]) => {
                const regex = new RegExp(`\\b${wrong}\\b`, 'i');
                if (regex.test(line) && !line.includes('//') && !line.includes('/*')) {
                    issues.push({
                        file: file.path,
                        line: index + 1,
                        type: 'spelling',
                        severity: 'medium',
                        issue: `Possible misspelling in code: '${wrong}'`,
                        suggestion: `Consider changing to '${correct}'`,
                        autoFixable: false
                    });
                }
            });
        });

        return issues;
    }

    /**
     * Check for data errors
     */
    private checkDataErrors(file: CodeFile): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const lines = file.content.split('\n');

        lines.forEach((line, index) => {
            // Check for potential null/undefined access
            if (line.match(/\.\w+/) && !line.includes('?.') && !line.includes('if') && !line.includes('&&')) {
                const hasNullCheck = lines.slice(Math.max(0, index - 3), index).some(l => 
                    l.includes('if') && (l.includes('null') || l.includes('undefined'))
                );
                
                if (!hasNullCheck && line.includes('data.') || line.includes('result.')) {
                    issues.push({
                        file: file.path,
                        line: index + 1,
                        type: 'data-error',
                        severity: 'high',
                        issue: 'Potential null/undefined access without check',
                        suggestion: 'Use optional chaining (?.) or add null check',
                        autoFixable: false
                    });
                }
            }

            // Check for missing error handling
            if (line.includes('await') && !line.includes('try')) {
                const hasTryCatch = lines.slice(Math.max(0, index - 5), index).some(l => l.includes('try'));
                if (!hasTryCatch) {
                    issues.push({
                        file: file.path,
                        line: index + 1,
                        type: 'data-error',
                        severity: 'high',
                        issue: 'Async operation without error handling',
                        suggestion: 'Wrap in try-catch block',
                        autoFixable: false
                    });
                }
            }

            // Check for hardcoded values that should be constants
            const numberMatch = line.match(/\b(100|1000|10000|50000)\b/);
            if (numberMatch && !line.includes('const') && !line.includes('//')) {
                issues.push({
                    file: file.path,
                    line: index + 1,
                    type: 'code-quality',
                    severity: 'low',
                    issue: `Magic number '${numberMatch[1]}' should be a named constant`,
                    suggestion: 'Extract to a named constant',
                    autoFixable: false
                });
            }
        });

        return issues;
    }

    /**
     * Check for UI bugs
     */
    private checkUIBugs(file: CodeFile): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const lines = file.content.split('\n');

        lines.forEach((line, index) => {
            // Check for missing key prop in lists
            if (line.includes('.map(') && !line.includes('key=')) {
                const nextLines = lines.slice(index, Math.min(index + 5, lines.length)).join('\n');
                if (!nextLines.includes('key=')) {
                    issues.push({
                        file: file.path,
                        line: index + 1,
                        type: 'ui-bug',
                        severity: 'high',
                        issue: 'Missing key prop in list rendering',
                        suggestion: 'Add unique key prop to mapped elements',
                        autoFixable: false
                    });
                }
            }

            // Check for inline styles (should use Tailwind)
            if (line.includes('style={{')) {
                issues.push({
                    file: file.path,
                    line: index + 1,
                    type: 'ui-bug',
                    severity: 'low',
                    issue: 'Inline styles used instead of Tailwind classes',
                    suggestion: 'Use Tailwind CSS classes',
                    autoFixable: false
                });
            }

            // Check for accessibility issues
            if (line.includes('<button') && !line.includes('aria-label') && !line.includes('children')) {
                issues.push({
                    file: file.path,
                    line: index + 1,
                    type: 'ui-bug',
                    severity: 'medium',
                    issue: 'Button without accessible label',
                    suggestion: 'Add aria-label or text content',
                    autoFixable: false
                });
            }

            // Check for missing alt text on images
            if (line.includes('<img') && !line.includes('alt=')) {
                issues.push({
                    file: file.path,
                    line: index + 1,
                    type: 'ui-bug',
                    severity: 'high',
                    issue: 'Image without alt text',
                    suggestion: 'Add alt attribute for accessibility',
                    autoFixable: false
                });
            }

            // Check for onClick on non-interactive elements
            if (line.includes('onClick') && (line.includes('<div') || line.includes('<span'))) {
                if (!line.includes('role=') && !line.includes('button')) {
                    issues.push({
                        file: file.path,
                        line: index + 1,
                        type: 'ui-bug',
                        severity: 'medium',
                        issue: 'onClick on non-interactive element without role',
                        suggestion: 'Add role="button" or use <button> element',
                        autoFixable: false
                    });
                }
            }
        });

        return issues;
    }

    /**
     * Check code quality issues
     */
    private checkCodeQuality(file: CodeFile): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const lines = file.content.split('\n');

        lines.forEach((line, index) => {
            // Check for console.log (should be removed in production)
            if (line.includes('console.log') && !line.includes('//')) {
                issues.push({
                    file: file.path,
                    line: index + 1,
                    type: 'code-quality',
                    severity: 'low',
                    issue: 'console.log statement found',
                    suggestion: 'Remove or replace with proper logging',
                    autoFixable: true
                });
            }

            // Check for TODO comments
            if (line.includes('TODO') || line.includes('FIXME')) {
                issues.push({
                    file: file.path,
                    line: index + 1,
                    type: 'code-quality',
                    severity: 'low',
                    issue: 'Unresolved TODO/FIXME comment',
                    suggestion: 'Complete the task or remove comment',
                    autoFixable: false
                });
            }

            // Check for long lines (>120 characters)
            if (line.length > 120 && !line.includes('http')) {
                issues.push({
                    file: file.path,
                    line: index + 1,
                    type: 'code-quality',
                    severity: 'low',
                    issue: `Line too long (${line.length} characters)`,
                    suggestion: 'Break into multiple lines',
                    autoFixable: false
                });
            }

            // Check for commented out code
            if (line.trim().startsWith('//') && line.includes('(') && line.includes(')')) {
                issues.push({
                    file: file.path,
                    line: index + 1,
                    type: 'code-quality',
                    severity: 'low',
                    issue: 'Commented out code found',
                    suggestion: 'Remove if not needed',
                    autoFixable: true
                });
            }
        });

        return issues;
    }

    /**
     * Use AI for advanced analysis
     */
    private async analyzeWithAI(file: CodeFile): Promise<CodeIssue[]> {
        if (!this.llmService) return [];

        const prompt = `Analyze this ${file.language} code for issues:

File: ${file.path}

\`\`\`${file.language}
${file.content.slice(0, 3000)} // Truncated for analysis
\`\`\`

Find:
1. Naming convention issues
2. Spelling mistakes in comments/strings
3. Potential bugs or errors
4. UI/UX issues (if React component)
5. Code quality problems

Return JSON array of issues with format:
[{
  "line": number,
  "type": "naming|spelling|data-error|ui-bug|code-quality",
  "severity": "critical|high|medium|low",
  "issue": "description",
  "suggestion": "how to fix"
}]`;

        try {
            const response = await this.llmService.chat([{ role: 'user', content: prompt }]);
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const aiIssues = JSON.parse(jsonMatch[0]);
                return aiIssues.map((issue: any) => ({
                    file: file.path,
                    line: issue.line,
                    type: issue.type,
                    severity: issue.severity,
                    issue: issue.issue,
                    suggestion: issue.suggestion,
                    autoFixable: false
                }));
            }
        } catch (error) {
            console.error('AI analysis failed:', error);
        }

        return [];
    }

    /**
     * Helper: Convert snake_case to camelCase
     */
    private toCamelCase(str: string): string {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    /**
     * Scan entire codebase
     */
    async scanCodebase(files: CodeFile[]): Promise<CleanupResult> {
        const allIssues: CodeIssue[] = [];

        for (const file of files) {
            const fileIssues = await this.analyzeFile(file);
            allIssues.push(...fileIssues);
        }

        // Categorize issues
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

        const summary = this.generateSummary(allIssues, issuesByType);

        return {
            totalIssues: allIssues.length,
            issuesByType,
            issues: allIssues,
            fixedIssues,
            unfixedIssues,
            summary
        };
    }

    /**
     * Generate summary report
     */
    private generateSummary(issues: CodeIssue[], issuesByType: Record<string, number>): string {
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

    /**
     * Apply automatic fixes
     */
    applyFixes(file: CodeFile, issues: CodeIssue[]): string {
        let content = file.content;
        const lines = content.split('\n');

        // Sort issues by line number (descending) to avoid offset issues
        const sortedIssues = issues
            .filter(i => i.autoFixable && i.file === file.path)
            .sort((a, b) => (b.line || 0) - (a.line || 0));

        sortedIssues.forEach(issue => {
            if (!issue.line) return;

            const lineIndex = issue.line - 1;
            let line = lines[lineIndex];

            switch (issue.type) {
                case 'naming':
                    // Fix snake_case to camelCase
                    if (issue.issue.includes('snake_case')) {
                        const match = issue.issue.match(/'([^']+)'/);
                        if (match) {
                            const oldName = match[1];
                            const newName = this.toCamelCase(oldName);
                            line = line.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
                        }
                    }
                    break;

                case 'spelling':
                    // Fix spelling mistakes
                    const spellingMatch = issue.issue.match(/'([^']+)'/);
                    const suggestionMatch = issue.suggestion.match(/'([^']+)'/);
                    if (spellingMatch && suggestionMatch) {
                        const wrong = spellingMatch[1];
                        const correct = suggestionMatch[1];
                        line = line.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), correct);
                    }
                    break;

                case 'code-quality':
                    // Remove console.log
                    if (issue.issue.includes('console.log')) {
                        line = line.replace(/console\.log\([^)]*\);?/, '');
                    }
                    // Remove commented code
                    if (issue.issue.includes('Commented out code')) {
                        line = '';
                    }
                    break;
            }

            lines[lineIndex] = line;
        });

        return lines.join('\n');
    }

    /**
     * Static factory method
     */
    static create(llmConfig?: LLMConfig): CodeCleanupAgent {
        return new CodeCleanupAgent(llmConfig);
    }
}
