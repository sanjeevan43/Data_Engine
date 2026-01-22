#!/usr/bin/env node
/**
 * Code Cleanup CLI Tool
 * 
 * Run this script to analyze and fix code issues across the entire codebase
 * 
 * Usage:
 *   npm run cleanup              # Scan and report issues
 *   npm run cleanup --fix        # Scan and apply auto-fixes
 *   npm run cleanup --report     # Generate detailed report
 */

import * as fs from 'fs';
import * as path from 'path';
import { CodeCleanupAgent } from '../src/services/ai/agent/CodeCleanupAgent';
import type { CodeFile, CodeIssue } from '../src/services/ai/agent/CodeCleanupAgent';

// Configuration
const SRC_DIR = path.join(process.cwd(), 'src');
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const IGNORE_PATTERNS = ['node_modules', 'dist', 'build', '.git'];

// Parse CLI arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const shouldReport = args.includes('--report');
const verbose = args.includes('--verbose');

/**
 * Recursively get all code files
 */
function getAllFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        // Skip ignored patterns
        if (IGNORE_PATTERNS.some(pattern => filePath.includes(pattern))) {
            return;
        }

        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (EXTENSIONS.some(ext => file.endsWith(ext))) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

/**
 * Read file and create CodeFile object
 */
function readCodeFile(filePath: string): CodeFile {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath);
    const language = ext === '.tsx' || ext === '.jsx' ? 'typescriptreact' : 'typescript';

    return {
        path: path.relative(process.cwd(), filePath),
        content,
        language
    };
}

/**
 * Write fixed content back to file
 */
function writeFixedFile(filePath: string, content: string): void {
    const fullPath = path.join(process.cwd(), filePath);
    fs.writeFileSync(fullPath, content, 'utf-8');
}

/**
 * Generate HTML report
 */
function generateHtmlReport(result: any, outputPath: string): void {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Cleanup Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px 12px 0 0; }
        .header h1 { font-size: 32px; margin-bottom: 10px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; background: #f9fafb; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
        .stat-card h3 { font-size: 36px; color: #1f2937; margin-bottom: 5px; }
        .stat-card p { color: #6b7280; font-size: 14px; font-weight: 600; }
        .issues { padding: 30px; }
        .issue { background: #f9fafb; border-left: 4px solid #e5e7eb; padding: 20px; margin-bottom: 15px; border-radius: 8px; }
        .issue.critical { border-left-color: #ef4444; }
        .issue.high { border-left-color: #f97316; }
        .issue.medium { border-left-color: #eab308; }
        .issue.low { border-left-color: #3b82f6; }
        .issue-header { display: flex; gap: 10px; margin-bottom: 10px; }
        .badge { padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge.critical { background: #fee2e2; color: #991b1b; }
        .badge.high { background: #ffedd5; color: #9a3412; }
        .badge.medium { background: #fef3c7; color: #854d0e; }
        .badge.low { background: #dbeafe; color: #1e40af; }
        .badge.auto-fix { background: #d1fae5; color: #065f46; }
        .issue h4 { color: #1f2937; margin-bottom: 8px; font-size: 16px; }
        .issue p { color: #6b7280; margin-bottom: 8px; }
        .issue .file { font-family: 'Courier New', monospace; font-size: 12px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Code Cleanup Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>${result.totalIssues}</h3>
                <p>Total Issues</p>
            </div>
            <div class="stat-card">
                <h3>${result.issuesByType.naming}</h3>
                <p>Naming Issues</p>
            </div>
            <div class="stat-card">
                <h3>${result.issuesByType.spelling}</h3>
                <p>Spelling Mistakes</p>
            </div>
            <div class="stat-card">
                <h3>${result.issuesByType['data-error']}</h3>
                <p>Data Errors</p>
            </div>
            <div class="stat-card">
                <h3>${result.issuesByType['ui-bug']}</h3>
                <p>UI Bugs</p>
            </div>
            <div class="stat-card">
                <h3>${result.fixedIssues.length}</h3>
                <p>Auto-fixable</p>
            </div>
        </div>
        
        <div class="issues">
            <h2 style="margin-bottom: 20px; color: #1f2937;">Issues Found</h2>
            ${result.issues.map((issue: CodeIssue) => `
                <div class="issue ${issue.severity}">
                    <div class="issue-header">
                        <span class="badge ${issue.severity}">${issue.severity}</span>
                        <span class="badge">${issue.type}</span>
                        ${issue.autoFixable ? '<span class="badge auto-fix">Auto-fixable</span>' : ''}
                    </div>
                    <h4>${issue.issue}</h4>
                    <p><strong>Suggestion:</strong> ${issue.suggestion}</p>
                    <p class="file">${issue.file}${issue.line ? `:${issue.line}` : ''}</p>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `.trim();

    fs.writeFileSync(outputPath, html, 'utf-8');
}

/**
 * Main execution
 */
async function main() {
    console.log('🤖 Code Cleanup Agent Starting...\n');

    // Get all code files
    console.log('📂 Scanning for code files...');
    const filePaths = getAllFiles(SRC_DIR);
    console.log(`   Found ${filePaths.length} files\n`);

    // Read all files
    console.log('📖 Reading files...');
    const codeFiles = filePaths.map(readCodeFile);
    console.log(`   Loaded ${codeFiles.length} files\n`);

    // Create agent
    const agent = CodeCleanupAgent.create();

    // Scan codebase
    console.log('🔍 Analyzing code...');
    const result = await agent.scanCodebase(codeFiles);
    console.log('   Analysis complete!\n');

    // Display summary
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(result.summary);
    console.log('='.repeat(50));
    console.log('');

    // Display issues by severity
    const critical = result.issues.filter(i => i.severity === 'critical');
    const high = result.issues.filter(i => i.severity === 'high');
    const medium = result.issues.filter(i => i.severity === 'medium');
    const low = result.issues.filter(i => i.severity === 'low');

    if (critical.length > 0) {
        console.log('\n🚨 CRITICAL ISSUES:');
        critical.forEach(issue => {
            console.log(`   ${issue.file}:${issue.line || '?'} - ${issue.issue}`);
        });
    }

    if (high.length > 0) {
        console.log('\n⚠️  HIGH PRIORITY ISSUES:');
        high.slice(0, 10).forEach(issue => {
            console.log(`   ${issue.file}:${issue.line || '?'} - ${issue.issue}`);
        });
        if (high.length > 10) {
            console.log(`   ... and ${high.length - 10} more`);
        }
    }

    // Apply fixes if requested
    if (shouldFix && result.fixedIssues.length > 0) {
        console.log(`\n🔧 Applying ${result.fixedIssues.length} automatic fixes...`);
        
        const issuesByFile = new Map<string, CodeIssue[]>();
        result.fixedIssues.forEach(issue => {
            const existing = issuesByFile.get(issue.file) || [];
            existing.push(issue);
            issuesByFile.set(issue.file, existing);
        });

        let fixedCount = 0;
        codeFiles.forEach(file => {
            const fileIssues = issuesByFile.get(file.path);
            if (fileIssues && fileIssues.length > 0) {
                const fixedContent = agent.applyFixes(file, fileIssues);
                writeFixedFile(file.path, fixedContent);
                fixedCount++;
                if (verbose) {
                    console.log(`   ✓ Fixed ${file.path}`);
                }
            }
        });

        console.log(`   ✅ Applied fixes to ${fixedCount} files`);
    }

    // Generate report if requested
    if (shouldReport) {
        const reportPath = path.join(process.cwd(), 'code-cleanup-report.html');
        generateHtmlReport(result, reportPath);
        console.log(`\n📄 Report generated: ${reportPath}`);
    }

    // Exit with appropriate code
    const hasErrors = critical.length > 0 || high.length > 0;
    if (hasErrors) {
        console.log('\n❌ Code cleanup found critical/high priority issues');
        process.exit(1);
    } else {
        console.log('\n✅ Code cleanup complete!');
        process.exit(0);
    }
}

// Run
main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
