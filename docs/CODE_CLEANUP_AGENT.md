# 🤖 Code Cleanup Agent

## Overview

The Code Cleanup Agent is an AI-powered tool that automatically scans your entire codebase to find and fix:

- ✅ **Naming Convention Issues** - Inconsistent variable/function names
- ✅ **Spelling Mistakes** - Typos in code, comments, and strings
- ✅ **Data Errors** - Null/undefined access, missing error handling
- ✅ **UI Bugs** - Missing keys, accessibility issues, inline styles
- ✅ **Code Quality** - Console.logs, TODOs, long lines, commented code

## Features

### 🔍 Automatic Detection

The agent automatically detects:

1. **Naming Issues**
   - snake_case variables (should be camelCase)
   - Lowercase component names (should be PascalCase)
   - Unclear variable names (single letters)

2. **Spelling Mistakes**
   - Common misspellings in code
   - Typos in comments and strings
   - Variable/function name typos

3. **Data Errors**
   - Potential null/undefined access
   - Missing error handling on async operations
   - Magic numbers that should be constants

4. **UI Bugs**
   - Missing key props in lists
   - Inline styles instead of Tailwind
   - Missing accessibility labels
   - Missing alt text on images
   - onClick on non-interactive elements

5. **Code Quality**
   - console.log statements
   - TODO/FIXME comments
   - Lines over 120 characters
   - Commented out code

### 🔧 Automatic Fixes

The agent can automatically fix:

- ✅ snake_case → camelCase conversion
- ✅ Spelling corrections
- ✅ Remove console.log statements
- ✅ Remove commented code
- ✅ Whitespace cleanup

### 📊 Severity Levels

- **Critical** - Must fix immediately (security, crashes)
- **High** - Should fix soon (bugs, accessibility)
- **Medium** - Should fix eventually (code quality)
- **Low** - Nice to fix (style, conventions)

## Usage

### CLI Usage

```bash
# Scan and report issues
npm run cleanup

# Scan and apply automatic fixes
npm run cleanup:fix

# Generate HTML report
npm run cleanup:report

# Do everything (fix + report + verbose)
npm run cleanup:all
```

### Programmatic Usage

```typescript
import { CodeCleanupAgent } from './services/ai/agent/CodeCleanupAgent';
import type { CodeFile } from './services/ai/agent/CodeCleanupAgent';

// Create agent
const agent = CodeCleanupAgent.create();

// Analyze a single file
const file: CodeFile = {
    path: 'src/App.tsx',
    content: fileContent,
    language: 'typescriptreact'
};

const issues = await agent.analyzeFile(file);
console.log(`Found ${issues.length} issues`);

// Scan entire codebase
const files: CodeFile[] = [...]; // Your code files
const result = await agent.scanCodebase(files);

console.log(result.summary);
console.log(`Total issues: ${result.totalIssues}`);
console.log(`Auto-fixable: ${result.fixedIssues.length}`);

// Apply fixes
const fixedContent = agent.applyFixes(file, issues);
```

### React Hook Usage

```typescript
import { useCodeCleanup } from './hooks/useCodeCleanup';

function MyComponent() {
    const cleanup = useCodeCleanup();

    const handleScan = async () => {
        const files = [...]; // Your code files
        const result = await cleanup.scanCodebase(files);
        
        console.log(`Found ${result.totalIssues} issues`);
        
        // Get critical issues
        const critical = cleanup.getIssuesBySeverity('critical');
        
        // Get UI bugs
        const uiBugs = cleanup.getIssuesByType('ui-bug');
        
        // Apply fixes
        if (result.fixedIssues.length > 0) {
            const issuesByFile = new Map();
            result.fixedIssues.forEach(issue => {
                const existing = issuesByFile.get(issue.file) || [];
                existing.push(issue);
                issuesByFile.set(issue.file, existing);
            });
            
            const fixedFiles = await cleanup.applyFixesToAll(files, issuesByFile);
            console.log(`Fixed ${fixedFiles.size} files`);
        }
    };

    return (
        <div>
            <button onClick={handleScan}>
                Scan Codebase
            </button>
            
            {cleanup.isScanning && (
                <div>Scanning... {cleanup.progress}%</div>
            )}
            
            {cleanup.result && (
                <div>
                    <h3>Results</h3>
                    <p>Total Issues: {cleanup.result.totalIssues}</p>
                    <p>Auto-fixable: {cleanup.result.fixedIssues.length}</p>
                </div>
            )}
        </div>
    );
}
```

### UI Component Usage

```typescript
import { CodeCleanupPanel } from './components/CodeCleanupPanel';
import type { CodeFile } from './services/ai/agent/CodeCleanupAgent';

function App() {
    const [showCleanup, setShowCleanup] = useState(false);
    const [files, setFiles] = useState<CodeFile[]>([]);

    const handleApplyFixes = (fixedFiles: Map<string, string>) => {
        console.log(`Applied fixes to ${fixedFiles.size} files`);
        // Write fixed files back to disk or update state
    };

    return (
        <div>
            <button onClick={() => setShowCleanup(true)}>
                Run Code Cleanup
            </button>

            {showCleanup && (
                <CodeCleanupPanel
                    files={files}
                    onClose={() => setShowCleanup(false)}
                    onApplyFixes={handleApplyFixes}
                />
            )}
        </div>
    );
}
```

## Output Examples

### Console Output

```
🤖 Code Cleanup Agent Starting...

📂 Scanning for code files...
   Found 45 files

📖 Reading files...
   Loaded 45 files

🔍 Analyzing code...
   Analysis complete!

📊 SUMMARY
==================================================
Code Cleanup Analysis Complete
==============================

Total Issues Found: 127

By Severity:
- Critical: 3
- High: 15
- Medium: 42
- Low: 67

By Type:
- Naming Issues: 23
- Spelling Mistakes: 8
- Data Errors: 18
- UI Bugs: 31
- Code Quality: 47

Auto-fixable: 56
Manual fixes needed: 71
==================================================

🚨 CRITICAL ISSUES:
   src/components/DataGrid.tsx:145 - Potential null/undefined access without check
   src/hooks/useCsvImporter.ts:89 - Async operation without error handling
   src/services/db/DataManager.ts:234 - Missing error handling

⚠️  HIGH PRIORITY ISSUES:
   src/components/FileUpload.tsx:67 - Missing key prop in list rendering
   src/components/DataGrid.tsx:201 - Image without alt text
   src/components/MappingModal.tsx:123 - Button without accessible label
   ... and 12 more

🔧 Applying 56 automatic fixes...
   ✅ Applied fixes to 23 files

✅ Code cleanup complete!
```

### HTML Report

The HTML report includes:
- Summary statistics with visual cards
- Color-coded severity badges
- Filterable issue list
- File locations with line numbers
- Suggestions for each issue

## Configuration

### Custom Misspellings Dictionary

Add your own common misspellings:

```typescript
const agent = CodeCleanupAgent.create();

// Extend the misspellings dictionary in checkSpelling method
// Edit: src/services/ai/agent/CodeCleanupAgent.ts
```

### AI-Powered Analysis

Enable AI for advanced analysis:

```typescript
import { CodeCleanupAgent } from './services/ai/agent/CodeCleanupAgent';

const agent = CodeCleanupAgent.create({
    provider: 'gemini',
    apiKey: 'your-api-key',
    model: 'gemini-pro',
    temperature: 0.3
});

// AI will provide additional insights
const result = await agent.scanCodebase(files);
```

### Custom Rules

Add custom detection rules by extending the agent:

```typescript
class CustomCleanupAgent extends CodeCleanupAgent {
    protected checkCustomRules(file: CodeFile): CodeIssue[] {
        const issues: CodeIssue[] = [];
        
        // Your custom rules here
        if (file.content.includes('var ')) {
            issues.push({
                file: file.path,
                type: 'code-quality',
                severity: 'medium',
                issue: 'Use const/let instead of var',
                suggestion: 'Replace var with const or let',
                autoFixable: true
            });
        }
        
        return issues;
    }
}
```

## Integration with CI/CD

### GitHub Actions

```yaml
name: Code Cleanup Check

on: [push, pull_request]

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run cleanup
      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: cleanup-report
          path: code-cleanup-report.html
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
npm run cleanup:fix
git add -A
```

## Best Practices

1. **Run regularly** - Run cleanup weekly or before releases
2. **Fix critical first** - Address critical/high issues immediately
3. **Review auto-fixes** - Always review automatic fixes before committing
4. **Use in CI/CD** - Integrate into your pipeline
5. **Customize rules** - Add project-specific rules
6. **Track progress** - Monitor issue trends over time

## Limitations

- Cannot fix complex logic errors
- May miss context-specific issues
- Auto-fixes are conservative (safe only)
- Large codebases may take time to scan
- AI analysis requires API key (optional)

## Troubleshooting

### "Too many files" error

Increase the file limit or scan directories separately:

```typescript
const srcFiles = getAllFiles('src');
const componentFiles = getAllFiles('src/components');
```

### "Out of memory" error

Process files in batches:

```typescript
const batchSize = 50;
for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await agent.scanCodebase(batch);
}
```

### False positives

Adjust severity thresholds or add ignore patterns:

```typescript
// Ignore specific patterns
if (issue.file.includes('test') || issue.file.includes('mock')) {
    return; // Skip test files
}
```

## Contributing

To add new detection rules:

1. Edit `src/services/ai/agent/CodeCleanupAgent.ts`
2. Add detection logic to appropriate method
3. Add tests
4. Update documentation

## License

Part of SmartImport - MIT License

---

**Built with ❤️ for clean, maintainable code**
