# 🚀 Quick Start Guide - Database Functions

## Get Started in 5 Minutes

### 1️⃣ Import the Module
```typescript
import { DataManager } from './services/db';
```

### 2️⃣ Create Configuration
```typescript
const config = {
    provider: 'Firebase',
    apiKey: 'YOUR_API_KEY',
    projectId: 'YOUR_PROJECT_ID',
    appId: 'YOUR_APP_ID',
    collectionName: 'my_collection'
};
```

### 3️⃣ Use It!
```typescript
// Test connection
const connected = await DataManager.testConnection(config);

// Import data
const result = await DataManager.importData(myData, config);

// Fetch data
const records = await DataManager.fetchData(config);

// Export data
DataManager.exportToCSV(records, 'export');

// Purge data
await DataManager.purgeData(config);
```

## 📖 Need More Info?

- **Quick Reference** → See `API_REFERENCE.md`
- **Full Documentation** → See `src/services/db/README.md`
- **Migration Help** → See `MIGRATION_GUIDE.md`
- **Complete Details** → See `IMPLEMENTATION_SUMMARY.md`

## 🎯 Common Tasks

### Import CSV Data
```typescript
import { DataManager, DataUtils } from './services/db';

// Add metadata
const data = DataUtils.addMetadata(csvRows, {
    fileName: 'import.csv'
});

// Import with progress
const result = await DataManager.importData(
    data,
    config,
    (current, total) => {
        console.log(`${current}/${total}`);
    }
);

console.log(`Success: ${result.success}, Failed: ${result.failure}`);
```

### Validate Before Import
```typescript
import { DataManager, ValidationUtils } from './services/db';

// Validate config
const configCheck = DataManager.validateConfig(config);
if (!configCheck.isValid) {
    alert(configCheck.errors.join('\n'));
    return;
}

// Validate data
const dataCheck = ValidationUtils.validateRequiredFields(data, ['email', 'name']);
if (!dataCheck.isValid) {
    alert(dataCheck.errors.join('\n'));
    return;
}

// Proceed with import
await DataManager.importData(data, config);
```

### Filter and Export
```typescript
import { DataManager, DataUtils } from './services/db';

// Fetch all data
const allRecords = await DataManager.fetchData(config);

// Filter
const filtered = DataUtils.filterData(allRecords, [
    { field: 'email', operator: 'contains', value: '@gmail.com' }
]);

// Sort
const sorted = DataUtils.sortData(filtered, 'name', 'asc');

// Export
DataManager.exportToCSV(sorted, 'gmail-users');
```

## 🔧 Provider Setup

### Firebase
```typescript
{
    provider: 'Firebase',
    apiKey: 'AIzaSy...',
    projectId: 'my-project',
    appId: '1:123...',
    collectionName: 'users'
}
```

### Supabase
```typescript
{
    provider: 'Supabase',
    supabaseUrl: 'https://xxx.supabase.co',
    supabaseAnonKey: 'eyJhbG...',
    collectionName: 'users'
}
```

### MongoDB
```typescript
{
    provider: 'MongoDB',
    mongoApiUrl: 'https://data.mongodb-api.com/app/xxx',
    mongoApiKey: 'abc123...',
    mongoDataSource: 'Cluster0',
    mongoDatabaseName: 'mydb',
    collectionName: 'users'
}
```

## 💡 Pro Tips

1. **Always validate** config before using
2. **Test connection** before large imports
3. **Use progress callbacks** for user feedback
4. **Save config** after successful operations
5. **Handle errors** with try-catch blocks

## 🆘 Troubleshooting

### Import Fails
```typescript
const result = await DataManager.importData(data, config);
if (result.failure > 0) {
    console.error('Errors:', result.errors);
}
```

### Connection Issues
```typescript
const validation = DataManager.validateConfig(config);
if (!validation.isValid) {
    console.error('Config errors:', validation.errors);
}

const connected = await DataManager.testConnection(config);
if (!connected) {
    console.error('Connection test failed');
}
```

## 📞 Support

Check the documentation:
1. `API_REFERENCE.md` - Quick snippets
2. `src/services/db/README.md` - Full docs
3. `MIGRATION_GUIDE.md` - Upgrade guide
4. `IMPLEMENTATION_SUMMARY.md` - Complete details

---

**Happy Coding!** 🎉
