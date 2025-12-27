# Data Engine - AI-Powered CSV Importer

A powerful web application for importing CSV data to multiple databases with intelligent AI-powered data cleaning and validation.

![Data Engine](public/logo.png)

## ✨ Features

- 🤖 **Real AI-Powered Processing** - Uses Transformers.js for intelligent semantic matching
- 📤 **Multiple File Upload** - Upload and process many CSV files at once
- 🗄️ **Multi-Database Support** - Firebase, Supabase, MongoDB, AWS Amplify, Appwrite, PocketBase
- 📊 **Smart Field Mapping** - AI-powered CSV header to database field matching
- ✅ **Data Validation** - Comprehensive validation with detailed error reporting
- 📈 **Real-time Statistics** - Track import progress and data quality
- 🆓 **100% Free** - No API keys needed, runs entirely in your browser

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📖 Documentation

**See [DOCUMENTATION.md](DOCUMENTATION.md) for complete guide including:**
- Detailed setup instructions
- AI system overview
- Database configuration
- Deployment guide
- API reference
- Project structure

## 🎯 How It Works

1. **Upload CSV Files** - Drag & drop or browse to select files
2. **AI Processing** - Automatic data cleaning and validation
3. **Review Results** - Check cleaned data and field mappings
4. **Import** - One-click import to your database

## 🤖 AI Capabilities

**Powered by Transformers.js** - Real machine learning models running in your browser!

The AI system automatically:
- ✅ Uses semantic similarity for intelligent field matching
- ✅ Detects data types with ML models
- ✅ Maps CSV headers using embeddings
- ✅ Validates email formats, URLs, numbers
- ✅ Fixes common issues (whitespace, case, types)
- ✅ Removes duplicate rows
- ✅ Reports unfixable errors
- ✅ **No API keys or external services needed!**

## 🗄️ Supported Databases

- Firebase Firestore
- Supabase
- MongoDB
- AWS Amplify
- Appwrite
- PocketBase

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
# Quick deploy
git init
git add .
git commit -m "Initial commit"
git push

# Then import to Vercel
```

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **AI**: Transformers.js (browser-based ML)
- **CSV Parser**: PapaParse
- **Database**: Firebase SDK + others

## 📊 Example

```typescript
import { DataEntryAgent } from './services/ai';

// Create AI agent
const agent = DataEntryAgent.create({ autoFix: true });

// Process CSV
const result = await agent.quickProcess(headers, rows, config);

// Import clean data
await DataManager.importData(result.cleanedData, config);
```

## 🎨 Screenshots

### Home Page
Beautiful landing page with feature highlights

### Upload Interface
Drag & drop multiple CSV files

### AI Processing
Real-time data cleaning and validation

### Data Grid
View and manage imported data

## 📝 License

MIT License - Free to use for any project

## 🤝 Contributing

Contributions welcome! Please read [DOCUMENTATION.md](DOCUMENTATION.md) first.

## 📞 Support

- 📖 Read the [Documentation](DOCUMENTATION.md)
- 🐛 Report issues on GitHub
- 💬 Ask questions in discussions

---

**Built with ❤️ using React, TypeScript, and AI**

**[View Full Documentation →](DOCUMENTATION.md)**
