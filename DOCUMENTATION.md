# 📚 Data Engine - Complete Documentation

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Features](#features)
3. [AI System](#ai-system)
4. [Database Setup](#database-setup)
5. [Deployment](#deployment)
6. [API Reference](#api-reference)
7. [Project Structure](#project-structure)

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/firebase-csv-importer.git

# Install dependencies
cd firebase-csv-importer
npm install

# Start development server
npm run dev
```

### Basic Usage

1. **Configure Database**
   - Click "Settings" button
   - Select your database provider (Firebase, Supabase, etc.)
   - Enter your credentials
   - Click "Save"

2. **Upload CSV Files**
   - Drag & drop CSV files or click to browse
   - Upload single or multiple files
   - AI automatically processes and cleans data

3. **Review & Import**
   - Check AI-cleaned data
   - Review field mappings
   - Click "Commit" to import to database

---

## ✨ Features

### Core Features

- **🤖 AI-Powered Data Cleaning**
  - Automatic type detection
  - Smart field mapping
  - Data validation
  - Error fixing
  - Duplicate removal

- **📤 Multiple File Upload**
  - Upload many files at once
  - Upload files multiple times
  - Batch processing

- **🗄️ Multi-Database Support**
  - Firebase Firestore
  - Supabase
  - MongoDB
  - AWS Amplify
  - Appwrite
  - PocketBase

- **📊 Data Management**
  - View imported data
  - Export to CSV
  - Purge data
  - Real-time statistics

### AI Capabilities

1. **Data Cleaning**
   - Trim whitespace
   - Normalize emails (lowercase)
   - Convert data types (yes/no → true/false)
   - Parse numbers (remove commas)
   - Remove duplicates

2. **Validation**
   - Email format (RFC 5322)
   - URL format
   - Number ranges
   - Required fields
   - Type checking

3. **Field Mapping**
   - Exact matching
   - Synonym detection (phone ↔ mobile)
   - Confidence scoring
   - Smart suggestions

---

## 🤖 AI System

### How It Works

```
CSV Upload → AI Analysis → Field Mapping → Validation → Fixing → Clean Data → Import
```

### AI Tools

1. **AnalyzeCsvTool**
   - Detects data types
   - Counts null values
   - Finds unique values
   - Generates recommendations

2. **MapFieldsTool**
   - Maps CSV headers to database fields
   - Uses exact, variation, and semantic matching
   - Provides confidence scores

3. **ValidateDataTool**
   - Validates against schema rules
   - Checks types, formats, ranges
   - Reports errors with severity

4. **FixDataTool**
   - Automatically fixes common issues
   - Tracks transformations
   - Reports unfixable errors

5. **SchemaTool**
   - Infers database schema
   - Validates schema
   - Manages field definitions

### Usage Example

```typescript
import { DataEntryAgent } from './services/ai';

// Create AI agent
const agent = DataEntryAgent.create({ autoFix: true });

// Process CSV data
const result = await agent.quickProcess(
  csvHeaders,
  csvRows,
  databaseConfig
);

// Review results
console.log('Clean data:', result.cleanedData);
console.log('Errors:', result.errors);
console.log('Stats:', result.stats);

// Import to database
await DataManager.importData(result.cleanedData, config);
```

### Sample Output

```json
{
  "mapping": {
    "Email Address": "email",
    "Full Name": "name",
    "Age": "age"
  },
  "cleanedData": [
    {
      "email": "john@example.com",
      "name": "John Doe",
      "age": 28
    }
  ],
  "errors": [],
  "stats": {
    "totalRows": 10,
    "validRows": 9,
    "transformationsApplied": 15,
    "duplicatesRemoved": 1
  }
}
```

---

## 🗄️ Database Setup

### Firebase

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Get credentials:
   - Project ID
   - API Key
   - App ID
4. Enter in Settings modal

### Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Get credentials:
   - Project URL
   - Anon Key
3. Enter in Settings modal

### MongoDB

1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Enter in Settings modal

### AWS Amplify

1. Install AWS Amplify CLI: `npm install -g @aws-amplify/cli`
2. Configure: `amplify configure`
3. Initialize: `amplify init`
4. Add API: `amplify add api`
5. Deploy: `amplify push`

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

#### Quick Deploy (5 minutes)

1. **Prepare Code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**
   - Go to [github.com/new](https://github.com/new)
   - Name: `firebase-csv-importer`
   - Don't initialize with README

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/firebase-csv-importer.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your live URL!

#### Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

If using Firebase or other services:

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID`
   - etc.
4. Redeploy

### Build Configuration

The project includes `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## 📚 API Reference

### Hooks

#### `useCsvImporter()`

Main hook for CSV import functionality.

```typescript
const {
  processedFiles,      // Array of processed files
  isImporting,         // Import in progress
  progress,            // Import progress (0-100)
  error,               // Error message
  successCount,        // Number of imported records
  parseFile,           // Parse single file
  parseMultipleFiles,  // Parse multiple files
  updateMapping,       // Update field mapping
  removeFile,          // Remove file from queue
  commit,              // Import to database
  reset,               // Reset state
  aiProcessing,        // AI processing status
  useAiAssist,         // AI enabled/disabled
  toggleAiAssist       // Toggle AI
} = useCsvImporter();
```

#### `useFirebase()`

Database connection hook.

```typescript
const {
  config,              // Database configuration
  isConnected,         // Connection status
  updateConfig,        // Update configuration
  testConnection       // Test database connection
} = useFirebase();
```

### Components

#### `<HomePage />`

Landing page with features and CTA.

```typescript
<HomePage onGetStarted={() => setShowHomePage(false)} />
```

#### `<FileUpload />`

File upload component with drag & drop.

```typescript
<FileUpload onFileSelect={(files) => handleFiles(files)} />
```

#### `<MappingModal />`

Field mapping interface.

```typescript
<MappingModal
  fileName="data.csv"
  rowCount={100}
  mapping={mapping}
  onUpdateMapping={updateMapping}
  onCommit={handleCommit}
  onCancel={handleCancel}
  isImporting={false}
  collectionName="users"
/>
```

### Services

#### `DataEntryAgent`

Main AI agent for data processing.

```typescript
// Create agent
const agent = DataEntryAgent.create({ autoFix: true });

// Quick process
const result = await agent.quickProcess(headers, rows, config);

// Process with schema
const result = await agent.processWithSchema(headers, rows, schema, config);

// Validation only
const result = await agent.validateOnly(headers, rows, schema);
```

#### `DataManager`

Database operations manager.

```typescript
// Import data
const result = await DataManager.importData(
  data,
  config,
  (current, total) => console.log(`${current}/${total}`)
);

// Fetch data
const data = await DataManager.fetchData(config);

// Purge data
await DataManager.purgeData(config);
```

---

## 📁 Project Structure

```
firebase-csv-importer/
├── src/
│   ├── components/           # React components
│   │   ├── HomePage.tsx      # Landing page
│   │   ├── FileUpload.tsx    # File upload
│   │   ├── Header.tsx        # App header
│   │   ├── DataGrid.tsx      # Data table
│   │   ├── MappingModal.tsx  # Field mapping
│   │   ├── SettingsModal.tsx # Database config
│   │   ├── Stats.tsx         # Statistics
│   │   └── SupportedDatabases.tsx
│   │
│   ├── hooks/                # React hooks
│   │   ├── useCsvImporter.ts # CSV import logic
│   │   ├── useFirebase.ts    # Database connection
│   │   └── useCollectionData.ts
│   │
│   ├── services/
│   │   ├── ai/               # AI system
│   │   │   ├── agent/        # AI orchestration
│   │   │   │   ├── DataEntryAgent.ts
│   │   │   │   └── AgentRunner.ts
│   │   │   ├── tools/        # AI tools
│   │   │   │   ├── analyzeCsvTool.ts
│   │   │   │   ├── mapFieldsTool.ts
│   │   │   │   ├── validateDataTool.ts
│   │   │   │   ├── fixDataTool.ts
│   │   │   │   └── schemaTool.ts
│   │   │   ├── prompts/      # AI prompts
│   │   │   ├── types.ts      # TypeScript types
│   │   │   └── index.ts      # Exports
│   │   │
│   │   └── db/               # Database services
│   │       ├── DataManager.ts
│   │       ├── DatabaseServiceFactory.ts
│   │       ├── FirebaseService.ts
│   │       ├── SupabaseService.ts
│   │       └── utils.ts
│   │
│   ├── context/              # React context
│   │   └── FirebaseContext.tsx
│   │
│   ├── App.tsx               # Main app
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
│
├── public/
│   └── logo.png              # App logo
│
├── index.html                # HTML template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite config
├── tailwind.config.js        # Tailwind config
├── vercel.json               # Vercel config
└── README.md                 # Project overview
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit

# Lint code
npm run lint
```

### Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **CSV Parser**: PapaParse
- **Database**: Firebase SDK (+ others)

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit
```

### Import Fails

- Check database credentials
- Verify collection name
- Check network connection
- Review error messages in console

### AI Not Working

- AI works locally (no API key needed)
- Check browser console for errors
- Verify CSV format is correct

---

## 📝 License

MIT License - feel free to use for any project!

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

For issues or questions:
- Check this documentation
- Review code comments
- Open an issue on GitHub

---

**Built with ❤️ using React, TypeScript, and AI**
