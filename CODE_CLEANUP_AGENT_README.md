# 🤖 Code Cleanup Agent - Complete Guide

## Overview

I've created a powerful **AI-powered Code Cleanup Agent** that automatically scans your entire codebase to find and fix:

✅ **Naming Convention Issues** - Inconsistent variable/function names  
✅ **Spelling Mistakes** - Typos in code, comments, and strings  
✅ **Data Errors** - Null/undefined access, missing error handling  
✅ **UI Bugs** - Missing keys, accessibility issues, inline styles  
✅ **Code Quality** - Console.logs, TODOs, long lines, commented code  

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

The agent uses the existing dependencies plus `tsx` for running TypeScript scripts:

```bash
npm install -D tsx
```

### 2. Run the Agent

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

### 3. Access the UI

Visit the web interface:

```bash
npm run dev
# Navigate to http://localhost:5173/cleanup
```

Or click the **"Code Cleanup Agent"** button in the main app header.

---

## 📁 What Was Created

### Core Agent Files

1. **`src/services/ai/agent/CodeCleanupAgent.ts`**
   - Main AI agent class
   - Detects all types of issues
   - Applies automatic fixes
   - Supports AI-powered analysis (optional)

2. **`src/hooks/useCodeCleanup.ts`**
   - React hook for easy integration
   - State management for scanning/fixing
   - Progress tracking
   - Error handling

3. **`src/components/CodeCleanupPanel.tsx`**
   - Beautiful UI component
   - Issue filtering and sorting
   - Visual statistics
   - Export reports
   - Apply fixes with one click

4. **`src/pages/CodeCleanupPage.tsx`**
   - Dedicated page for code cleanup
   - Demo mode with sample files
   - Feature showcase
   - CLI instructions

5. **`scripts/cleanup-code.ts`**
   - CLI tool for running cleanup
   - Batch processing
   - HTML report generation
   - CI/CD integration ready

6. **`docs/CODE_CLEANUP_AGENT.md`**
   - Complete documentation
   - Usage examples
   - Configuration guide
   - Best practices

---

## 🎯 Features

### Automatic Detection

#### 1. Naming Issues
- ❌ `user_name` → ✅ `userName` (snake_case to camelCase)
- ❌ `function myComponent()` → ✅ `function MyComponent()` (component naming)
- ❌ Single letter variables (except i, j, k, id, db)

#### 2. Spelling Mistakes
- ❌ `recieve` → ✅ `receive`
- ❌ `sucessful` → ✅ `successful`
- ❌ `seperator` → ✅ `separator`
- 30+ common misspellings detected

#### 3. Data Errors
- ❌ `data.user.name` without null check
- ❌ `await fetch()` without try-catch
- ❌ Magic numbers (10000, 50000)

#### 4. UI Bugs
- ❌ Missing `key` prop in `.map()`
- ❌ `<img>` without `alt` attribute
- ❌ `<button>` without accessible label
- ❌ `onClick` on `<div>` without `role`
- ❌ Inline styles instead of Tailwind

#### 5. Code Quality
- ❌ `console.log()` statements
- ❌ `TODO` / `FIXME` comments
- ❌ Lines over 120 characters
- ❌ Commented out code

### Automatic Fixes

The agent can automatically fix:

✅ snake_case → camelCase conversion  
✅ Spelling corrections  
✅ Remove console.log statements  
✅ Remove commented code  
✅ Whitespace cleanup  

### Severity Levels

- 🔴 **Critical** - Must fix immediately (security, crashes)
- 🟠 **High** - Should fix soon (bugs, accessibility)
- 🟡 **Medium** - Should fix eventually (code quality)
- 🔵 **Low** - Nice to fix (style, conventions)

---

## 💻 Usage Examples

### CLI Usage

```bash
# Basic scan
npm run cleanup

# Output:
# 🤖 Code Cleanup Agent Starting...
# 📂 Scanning for code files...
#    Found 45 files
# 🔍 Analyzing code...
#    Analysis complete!
# 
# 📊 SUMMARY
# Total Issues Found: 127
# By Severity:
# - Critical: 3
# - High: 15
# - Medium: 42
# - Low: 67
```

```bash
# Apply automatic fixes
npm run cleanup:fix

# Output:
# 🔧 Applying 56 automatic fixes...
#    ✅ Applied fixes to 23 files
```

```bash
# Generate HTML report
npm run cleanup:report

# Output:
# 📄 Report generated: code-cleanup-report.html
```

### Programmatic Usage

```typescript
import { CodeCleanupAgent } from './services/ai/agent/CodeCleanupAgent';

// Create agent
const agent = CodeCleanupAgent.create();

// Analyze a single file
const file = {
    path: 'src/App.tsx',
    content: fileContent,
    language: 'typescriptreact'
};

const issues = await agent.analyzeFile(file);
console.log(`Found ${issues.length} issues`);

// Scan entire codebase
const files = [...]; // Your code files
const result = await agent.scanCodebase(files);

console.log(result.summary);
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
        <button onClick={handleScan}>
            {cleanup.isScanning ? 'Scanning...' : 'Scan Codebase'}
        </button>
    );
}
```

### UI Component Usage

```typescript
import { CodeCleanupPanel } from './components/CodeCleanupPanel';

function App() {
    const [showCleanup, setShowCleanup] = useState(false);
    const [files, setFiles] = useState([]);

    return (
        <div>
            <button onClick={() => setShowCleanup(true)}>
                Run Code Cleanup
            </button>

            {showCleanup && (
                <CodeCleanupPanel
                    files={files}
                    onClose={() => setShowCleanup(false)}
                    onApplyFixes={(fixedFiles) => {
                        console.log(`Fixed ${fixedFiles.size} files`);
                    }}
                />
            )}
        </div>
    );
}
```

---

## 🎨 UI Features

The Code Cleanup Panel includes:

- **Real-time Progress** - See scanning progress with percentage
- **Visual Statistics** - Total issues, severity breakdown, auto-fixable count
- **Advanced Filtering** - Filter by type, severity, auto-fixable
- **Issue Details** - Click any issue to see full details
- **One-Click Fixes** - Apply all automatic fixes with one button
- **Export Reports** - Download detailed text reports
- **Beautiful Design** - Matches your app's design system

---

## 🔧 Configuration

### Enable AI-Powered Analysis (Optional)

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

### Customize Detection Rules

Edit `src/services/ai/agent/CodeCleanupAgent.ts` to add custom rules:

```typescript
private checkCustomRules(file: CodeFile): CodeIssue[] {
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
```

---

## 🚀 Integration with CI/CD

### GitHub Actions

Create `.github/workflows/code-cleanup.yml`:

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

Install husky:

```bash
npm install -D husky
npx husky init
```

Create `.husky/pre-commit`:

```bash
#!/bin/sh
npm run cleanup:fix
git add -A
```

---

## 📊 Example Output

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
   src/components/DataGrid.tsx:145 - Potential null/undefined access
   src/hooks/useCsvImporter.ts:89 - Async operation without error handling
   src/services/db/DataManager.ts:234 - Missing error handling

⚠️  HIGH PRIORITY ISSUES:
   src/components/FileUpload.tsx:67 - Missing key prop in list
   src/components/DataGrid.tsx:201 - Image without alt text
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

---

## 🎯 Best Practices

1. **Run Regularly** - Run cleanup weekly or before releases
2. **Fix Critical First** - Address critical/high issues immediately
3. **Review Auto-Fixes** - Always review automatic fixes before committing
4. **Use in CI/CD** - Integrate into your pipeline
5. **Customize Rules** - Add project-specific rules
6. **Track Progress** - Monitor issue trends over time

---

## 🐛 Troubleshooting

### Issue: "Too many files" error

**Solution:** Process files in batches:

```typescript
const batchSize = 50;
for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await agent.scanCodebase(batch);
}
```

### Issue: "Out of memory" error

**Solution:** Increase Node.js memory:

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run cleanup
```

### Issue: False positives

**Solution:** Add ignore patterns:

```typescript
if (issue.file.includes('test') || issue.file.includes('mock')) {
    return; // Skip test files
}
```

---

## 📚 Documentation

- **Full Documentation**: `docs/CODE_CLEANUP_AGENT.md`
- **API Reference**: See TypeScript types in agent files
- **Examples**: Check `src/pages/CodeCleanupPage.tsx` for demo

---

## 🎉 What's Next?

The Code Cleanup Agent is ready to use! Here's what you can do:

1. **Try the Demo** - Visit `/cleanup` and click "Run Demo Analysis"
2. **Scan Your Code** - Run `npm run cleanup` to scan your codebase
3. **Apply Fixes** - Run `npm run cleanup:fix` to automatically fix issues
4. **Generate Report** - Run `npm run cleanup:report` for detailed HTML report
5. **Integrate CI/CD** - Add to your GitHub Actions workflow

---

## 🤝 Contributing

To add new detection rules:

1. Edit `src/services/ai/agent/CodeCleanupAgent.ts`
2. Add detection logic to appropriate method
3. Test with sample files
4. Update documentation

---

## 📝 License

Part of SmartImport - MIT License

---

**Built with ❤️ for clean, maintainable code**

Need help? Check the documentation or open an issue!
