# 🚀 AI System Quick Start Guide

## ⚡ 30-Second Setup

The AI system is **ALREADY INTEGRATED** - no additional setup required!

## 💡 How to Use

### Option 1: Automatic (Recommended)

```typescript
// In your React component
import { useCsvImporter } from './hooks/useCsvImporter';

function MyComponent() {
    const importer = useCsvImporter();
    
    // AI is enabled by default!
    const handleUpload = async (file: File) => {
        await importer.parseFile(file);
        // AI runs automatically and cleans data
        
        // Check results
        if (importer.aiResult) {
            console.log('AI Stats:', importer.aiResult.stats);
            console.log('Errors:', importer.aiResult.errors);
        }
        
        // Commit (uses AI-cleaned data automatically)
        await importer.commit();
    };
    
    return (
        <div>
            <input type="file" onChange={(e) => {
                if (e.target.files) handleUpload(e.target.files[0]);
            }} />
            {importer.aiProcessing && <p>AI is processing...</p>}
        </div>
    );
}
```

### Option 2: Standalone Agent

```typescript
import { DataEntryAgent } from './services/ai';

// Create agent
const agent = DataEntryAgent.create({ autoFix: true });

// Process data
const result = await agent.quickProcess(
    ['email', 'name', 'age'],
    [
        ['john@example.com', 'John', '25'],
        ['jane@example.com', 'Jane', '30']
    ],
    { provider: 'Firebase', collectionName: 'users' }
);

// Use results
console.log(result.cleanedData);
console.log(result.errors);
console.log(result.stats);
```

## 🎛️ Controls

### Toggle AI On/Off

```typescript
const importer = useCsvImporter();

// Toggle
importer.toggleAiAssist();

// Check status
console.log('AI Enabled:', importer.useAiAssist);
```

### Access AI Results

```typescript
if (importer.aiResult) {
    // Field mapping
    console.log(importer.aiResult.mapping);
    
    // Cleaned data
    console.log(importer.aiResult.cleanedData);
    
    // Errors
    importer.aiResult.errors.forEach(error => {
        console.log(`Row ${error.row}, Field ${error.field}: ${error.message}`);
    });
    
    // Statistics
    const stats = importer.aiResult.stats;
    console.log(`${stats.validRows}/${stats.totalRows} valid`);
    console.log(`${stats.transformationsApplied} fixes applied`);
    
    // Suggestions
    importer.aiResult.suggestions.forEach(s => console.log(s));
}
```

## 📊 What the AI Does

1. **Analyzes** CSV structure and detects types
2. **Maps** CSV headers to database fields intelligently
3. **Validates** every row against schema rules
4. **Fixes** common issues automatically:
   - Trims whitespace
   - Normalizes emails to lowercase
   - Converts yes/no to true/false
   - Removes duplicates
   - Parses numbers from strings

5. **Reports** errors it can't fix

## 🎯 Common Patterns

### Pattern 1: Review Before Import

```typescript
const result = await agent.quickProcess(headers, rows, config);

// Show user the errors
if (result.errors.length > 0) {
    alert(`Found ${result.errors.length} errors. Review before importing.`);
    displayErrors(result.errors);
}

// User confirms, then import
if (userConfirms) {
    await DataManager.importData(result.cleanedData, config);
}
```

### Pattern 2: Custom Schema

```typescript
const schema = {
    fields: [
        { name: 'email', type: 'email', required: true },
        { name: 'age', type: 'number', validation: { min: 0, max: 120 } }
    ],
    required: ['email']
};

const result = await agent.processWithSchema(headers, rows, schema, config);
```

### Pattern 3: Validation Only (No Auto-Fix)

```typescript
const agent = DataEntryAgent.create({ autoFix: false });
const result = await agent.validateOnly(headers, rows, schema, config);

// Only errors, no automatic fixes
console.log(result.errors);
```

## 🛡️ Safety

The AI agent:
- ✅ **CANNOT write to databases** (read-only)
- ✅ **CANNOT access credentials** (no env vars)
- ✅ **CANNOT make network calls** (offline)
- ✅ Only prepares data for your review

Only `DataManager.importData()` writes to the database, and only when you call it.

## 📚 Full Documentation

- **[AI README](src/services/ai/README.md)** - Complete guide
- **[Implementation Summary](AI_IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[Types](src/services/ai/types.ts)** - TypeScript interfaces

## 🎉 That's It!

The AI is already running in your CSV importer. Just upload a file and watch it work!

**Need help?** Check the full documentation in `src/services/ai/README.md`
