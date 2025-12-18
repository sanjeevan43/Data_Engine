# Firebase CSV Importer - Setup Guide

## Prerequisites

1. **Node.js** (v20.19.0 or higher)
2. **Firebase Project** with Firestore enabled
3. **Firebase Authentication** enabled (Anonymous auth for demo)

## Installation

1. **Clone and Install Dependencies**
   ```bash
   cd firebase-csv-importer
   npm install
   ```

2. **Configure Firebase**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Firebase project credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

3. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Firebase Setup

### 1. Enable Authentication
- Go to Firebase Console → Authentication → Sign-in method
- Enable "Anonymous" authentication

### 2. Create Firestore Database
- Go to Firebase Console → Firestore Database
- Create database in production mode
- Deploy the security rules from `firestore.rules`

### 3. Security Rules
The included rules ensure:
- Only authenticated users can import data
- Metadata is enforced on all imports
- Import logs are properly secured

## Usage

1. **Sign In**: Click "Sign In Anonymously" 
2. **Upload CSV**: Drag & drop or browse for `.csv` file
3. **Map Fields**: 
   - Rename Firestore field names
   - Set data types (String, Number, Boolean, Timestamp)
   - Mark fields as required
   - Ignore unwanted columns
4. **Import**: Click "Start Import" and monitor progress
5. **Review**: Check import summary and error details

## Features

### ✅ File Upload
- Drag & drop interface
- CSV validation (UTF-8 encoding)
- File size limits

### ✅ Dynamic Field Mapping
- Auto-generate field names from CSV headers
- Support for 4 data types: String, Number, Boolean, Timestamp
- Required field validation
- Column ignore functionality

### ✅ Data Validation
- Email format validation (for string fields containing @)
- Number format validation
- Boolean format validation (true/false, 1/0, yes/no)
- Date/timestamp parsing
- Required field checking

### ✅ Batch Processing
- Firestore batch writes (500 docs max per batch)
- Progress tracking
- Error handling per batch

### ✅ Security
- Firebase Authentication required
- Firestore security rules
- Metadata tracking (createdAt, createdBy, sourceFileName)

### ✅ Import Reporting
- Success/failure counts
- Detailed error log with row numbers
- Expandable error details

## Sample Data

Use `sample_users.csv` to test the importer:
- Contains valid and invalid data
- Tests different data types
- Demonstrates error handling

## Architecture

```
src/modules/CsvImporter/
├── components/          # React UI components
├── hooks/              # Custom React hooks
├── utils/              # Pure utility functions
├── types.ts            # TypeScript definitions
└── index.tsx           # Main module export
```

## Customization

### Adding New Data Types
1. Update `FieldType` in `types.ts`
2. Add validation logic in `validators.ts`
3. Add normalization in `normalizeValue()`
4. Update UI dropdown in `FieldMapper.tsx`

### Custom Validation Rules
Modify `validateCell()` in `utils/validators.ts`

### Batch Size Configuration
Change `BATCH_SIZE` in `utils/firestoreWriter.ts`

## Production Considerations

1. **File Size Limits**: Add client-side file size validation
2. **Rate Limiting**: Implement server-side rate limiting
3. **User Permissions**: Replace anonymous auth with proper user management
4. **Error Logging**: Add server-side error logging
5. **Progress Persistence**: Store import progress in case of interruption
6. **Duplicate Prevention**: Add unique constraint checking

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check Firestore security rules
   - Ensure user is authenticated

2. **CSV parsing errors**
   - Verify UTF-8 encoding
   - Check for malformed CSV structure

3. **Import failures**
   - Check Firebase quotas
   - Verify network connectivity
   - Review error logs in import summary

### Debug Mode
Set `console.log` statements in:
- `utils/csvParser.ts` for parsing issues
- `utils/firestoreWriter.ts` for write failures
- `hooks/useCsvImporter.ts` for state management