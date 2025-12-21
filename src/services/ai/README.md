# AI-Assisted Data Entry System

## 🎯 Overview

This module provides an **AI-powered data entry assistant** for the CSV import system. The AI agent analyzes CSV data, intelligently maps fields, validates data integrity, and automatically fixes common issues **WITHOUT ever writing directly to databases**.

## 🏗️ Architecture

```
src/services/ai/
├── index.ts                     # Main exports
├── types.ts                     # TypeScript interfaces
│
├── agent/
│   ├── DataEntryAgent.ts        # 🤖 Main AI Agent (public interface)
│   └── AgentRunner.ts           # Orchestration engine
│
├── tools/
│   ├── analyzeCsvTool.ts        # 📊 CSV structure analysis
│   ├── mapFieldsTool.ts         # 🗺️ Intelligent field mapping
│   ├── validateDataTool.ts      # ✅ Data validation
│   ├── fixDataTool.ts           # 🔧 Automatic data fixing
│   └── schemaTool.ts            # 📋 Schema inference
│
└── prompts/
    ├── system.prompt.ts         # System instructions
    ├── mapping.prompt.ts        # Mapping prompts
    └── validation.prompt.ts     # Validation prompts
```

## ⭐ Key Features

### 1. Intelligent Field Mapping
- Exact match detection (case-insensitive)
- Common variation handling (email ↔ user_email)
- Semantic matching (phone ↔ mobile)
- Confidence scoring (0.0 - 1.0)

### 2. Comprehensive Data Validation
- Required field checks
- Type validation (email, URL, number, date, boolean)
- Format validation (RFC 5322 emails, valid URLs)
- Range and length checks
- Custom validation rules

### 3. Automatic Data Fixing
Safe auto-fixes:
- ✅ Trim whitespace
- ✅ Normalize emails to lowercase
- ✅ Remove thousand separators from numbers
- ✅ Convert yes/no to boolean
- ✅ Standardize date formats
- ✅ Remove duplicate rows

Unsafe fixes (reported, not applied):
- ⚠️ Missing required fields
- ⚠️ Type mismatches with data loss potential
- ⚠️ Invalid formats that can't be auto-corrected

### 4. Schema Inference
- Automatic type detection
- Required field inference (90% threshold)
- Null percentage analysis
- Unique value detection

## 🚀 Usage

### Basic Usage (Quickest Way)

```typescript
import { DataEntryAgent } from './services/ai';

// Create agent
const agent = DataEntryAgent.create({ autoFix: true });

// Process CSV data
const result = await agent.quickProcess(
    csvHeaders,
    csvRows,
    pipelineConfig
);

// Use cleaned data with DataManager
await DataManager.importData(result.cleanedData, pipelineConfig);
```

### Advanced Usage with Custom Schema

```typescript
import { DataEntryAgent } from './services/ai';
import type { CollectionSchema } from './services/ai';

// Define your schema
const schema: CollectionSchema = {
    fields: [
        { name: 'email', type: 'email', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'age', type: 'number', required: false, validation: { min: 0, max: 150 } },
        { name: 'website', type: 'url', required: false }
    ],
    required: ['email', 'name']
};

const agent = DataEntryAgent.create();
const result = await agent.processWithSchema(
    csvHeaders,
    csvRows,
    schema,
    pipelineConfig
);

console.log(`Processed ${result.stats.validRows}/${result.stats.totalRows} rows`);
console.log(`Applied ${result.stats.transformationsApplied} transformations`);
console.log(`Found ${result.errors.length} errors`);
```

### Validation-Only Mode (No Auto-Fix)

```typescript
const agent = DataEntryAgent.create({ autoFix: false });
const result = await agent.validateOnly(
    csvHeaders,
    csvRows,
    schema,
    pipelineConfig
);

// Review errors
result.errors.forEach(error => {
    console.log(`Row ${error.row}, Field ${error.field}: ${error.message}`);
});
```

## 📥 Integration with Existing Hook

The AI agent is **already integrated** into `useCsvImporter` hook:

```typescript
// In your component
const importer = useCsvImporter();

// Enable/disable AI assist
importer.toggleAiAssist(); // Toggle on/off
console.log('AI Assist:', importer.useAiAssist);

// Check AI processing status
if (importer.aiProcessing) {
    console.log('AI is processing...');
}

// Access AI results
if (importer.aiResult) {
    console.log('AI Stats:', importer.aiResult.stats);
    console.log('AI Errors:', importer.aiResult.errors);
    console.log('AI Suggestions:', importer.aiResult.suggestions);
}

// The commit() function automatically uses AI-cleaned data if available
await importer.commit(); // Uses AI result if present, falls back to manual mapping
```

## 📤 Output Structure

The AI agent returns a structured `AIProcessOutput`:

```typescript
{
    mapping: {
        "Email Address": "email",
        "Full Name": "name",
        "Phone": "phone_number"
    },
    
    cleanedData: [
        { email: "john@example.com", name: "John Doe", phone_number: "1234567890" },
        { email: "jane@example.com", name: "Jane Smith", phone_number: "9876543210" }
    ],
    
    errors: [
        {
            row: 5,
            field: "email",
            message: "Invalid email format",
            severity: "error",
            originalValue: "not-an-email",
            suggestedValue: null
        }
    ],
    
    warnings: [
        "Row 10: Age value 150 seems unrealistic",
        "Field 'notes' has no schema match - may be ignored"
    ],
    
    stats: {
        totalRows: 100,
        validRows: 95,
        invalidRows: 5,
        fieldsProcessed: 10,
        transformationsApplied: 47,
        duplicatesRemoved: 3
    },
    
    suggestions: [
        "Field 'phone' has 20% null values - consider making it optional",
        "Mapped 'tel' → 'phone_number' with 85% confidence - please review"
    ]
}
```

## 🔧 Configuration

```typescript
import type { AgentConfig } from './services/ai';

const config: AgentConfig = {
    autoFix: true,              // Enable automatic fixes
    strictValidation: false,    // Strict mode (fail on warnings)
    maxRetries: 3,              // Max retries for failed operations
    timeout: 30000,             // Timeout in milliseconds
    llm: {                      // Optional: LLM configuration (future)
        provider: 'gemini',
        apiKey: 'your-key',
        model: 'gemini-pro',
        temperature: 0.3
    }
};

const agent = DataEntryAgent.create(config);
```

## 🛡️ Safety Guarantees

### What the AI Agent CAN Do:
✅ Analyze CSV structure  
✅ Map fields intelligently  
✅ Validate data  
✅ Fix common issues  
✅ Generate reports  
✅ Return structured data  

### What the AI Agent CANNOT Do:
🚫 Write to databases directly  
🚫 Access credentials or environment variables  
🚫 Make external API calls  
🚫 Delete or modify existing database records  
🚫 Execute arbitrary code  

**The AI agent is READ-ONLY and DATA-PREPARATION-ONLY.**

Only `DataManager.importData()` can write to databases, and only when explicitly called by the user.

## 🎨 Example: Full Workflow

```typescript
import { DataEntryAgent, DataManager } from './services';

async function importCsvWithAI(file: File, config: PipelineConfig) {
    // 1. Parse CSV
    const { headers, rows } = await parseCSV(file);
    
    // 2. Run AI processing
    const agent = DataEntryAgent.create({ autoFix: true });
    const aiResult = await agent.quickProcess(headers, rows, config);
    
    // 3. Review AI results
    console.log('AI Processing Complete!');
    console.log(`✅ Valid: ${aiResult.stats.validRows} rows`);
    console.log(`❌ Invalid: ${aiResult.stats.invalidRows} rows`);
    console.log(`🔧 Fixes: ${aiResult.stats.transformationsApplied}`);
    
    // 4. Show errors to user
    if (aiResult.errors.length > 0) {
        console.warn('Errors found:', aiResult.errors);
        // Ask user if they want to proceed despite errors
    }
    
    // 5. Import clean data (ONLY database write)
    const result = await DataManager.importData(
        aiResult.cleanedData,
        config,
        (current, total) => console.log(`Importing: ${current}/${total}`)
    );
    
    console.log(`✅ Imported ${result.success} records`);
    if (result.failure > 0) {
        console.error(`❌ Failed ${result.failure} records`);
    }
}
```

## 📊 Tool Details

### AnalyzeCsvTool
- Detects data types (email, URL, number, date, boolean, string)
- Counts null values per column
- Counts unique values
- Generates recommendations

### MapFieldsTool
- Exact matching (case-insensitive)
- Synonym mapping (phone ↔ mobile, email ↔ user_email)
- Partial matching
- Confidence scoring

### ValidateDataTool
- Required field validation
- Type validation
- Format validation (email, URL patterns)
- Range validation (min/max)
- Length validation (minLength/maxLength)
- Pattern matching (regex)

### FixDataTool
- Whitespace trimming
- Email normalization
- Number parsing (remove $, commas)
- Boolean conversion
- Date normalization
- Duplicate removal

### SchemaTool
- Type inference from data
- Required field detection (90% threshold)
- Schema validation
- Schema merging

## 🧪 Testing

```typescript
// Test AI agent independently
import { DataEntryAgent } from './services/ai';

const testData = [
    ['john@example.com', 'John Doe', '25'],
    ['invalid-email', 'Jane Smith', 'not-a-number']
];

const agent = DataEntryAgent.create({ autoFix: true });
const result = await agent.quickProcess(
    ['email', 'name', 'age'],
    testData,
    { provider: 'Firebase', collectionName: 'users' }
);

console.assert(result.stats.totalRows === 2);
console.assert(result.errors.length === 2); // invalid email, invalid age
console.assert(result.cleanedData.length === 2);
```

## 🚦 Processing Flow

```
1. User uploads CSV
   ↓
2. Papa Parse extracts headers + rows
   ↓
3. AI Agent processes:
   ├─ Analyze structure
   ├─ Infer/use schema
   ├─ Map fields
   ├─ Transform data
   ├─ Validate rows
   └─ Fix issues
   ↓
4. Return: { mapping, cleanedData, errors, stats }
   ↓
5. User reviews results
   ↓
6. User commits
   ↓
7. DataManager.importData() writes to DB
```

## 📝 Future Enhancements

- [ ] LLM integration for advanced field mapping
- [ ] ML-based duplicate detection
- [ ] Custom validation rule engine
- [ ] Data transformation pipelines
- [ ] Real-time validation streaming
- [ ] Multi-language support
- [ ] Advanced schema inference from database

## 📄 License

Part of the Firebase CSV Importer Module.

---

**Built with ❤️ for intelligent data entry**
