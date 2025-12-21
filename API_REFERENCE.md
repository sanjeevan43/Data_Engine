# Quick API Reference

## Import the Module

```typescript
import { 
    DataManager,
    ConfigUtils,
    DataUtils,
    ValidationUtils,
    FormatUtils,
    DatabaseServiceFactory 
} from './services/db';
```

## Quick Start

### 1. Create Configuration
```typescript
const config = {
    provider: 'Firebase',
    apiKey: 'your-api-key',
    projectId: 'your-project-id',
    appId: 'your-app-id',
    collectionName: 'users'
};
```

### 2. Validate Configuration
```typescript
const { isValid, errors } = DataManager.validateConfig(config);
```

### 3. Test Connection
```typescript
const connected = await DataManager.testConnection(config);
```

### 4. Import Data
```typescript
const result = await DataManager.importData(data, config, (current, total) => {
    console.log(`Progress: ${current}/${total}`);
});
```

### 5. Fetch Data
```typescript
const records = await DataManager.fetchData(config);
```

### 6. Export Data
```typescript
DataManager.exportToCSV(records, 'export-name');
```

### 7. Purge Data
```typescript
await DataManager.purgeData(config);
```

## Configuration Management

```typescript
// Save
DataManager.saveConfig(config);

// Load
const savedConfig = DataManager.loadConfig();

// Clear
DataManager.clearConfig();
```

## Utilities

### Config
```typescript
// Get defaults
const defaultConfig = ConfigUtils.getDefaultConfig('Firebase');

// Sanitize name
const clean = ConfigUtils.sanitizeCollectionName('My Collection!');

// Merge configs
const merged = ConfigUtils.merge(baseConfig, newConfig);
```

### Data
```typescript
// Normalize field names
const normalized = DataUtils.normalizeFieldName('Email Address');

// Add metadata
const withMeta = DataUtils.addMetadata(data, { fileName: 'import.csv' });

// Filter data
const filtered = DataUtils.filterData(records, [
    { field: 'email', operator: 'contains', value: '@gmail.com' }
]);

// Sort data
const sorted = DataUtils.sortData(records, 'name', 'asc');

// Deduplicate
const unique = DataUtils.deduplicate(records, 'email');
```

### Validation
```typescript
// Validate email
const isEmail = ValidationUtils.isValidEmail('test@example.com');

// Validate required fields
const { isValid, errors } = ValidationUtils.validateRequiredFields(
    data,
    ['name', 'email']
);

// Validate data types
const validation = ValidationUtils.validateDataTypes(data, {
    email: 'email',
    age: 'number',
    website: 'url'
});
```

### Format
```typescript
// Format file size
const size = FormatUtils.formatFileSize(1024000); // "1000 KB"

// Format date
const date = FormatUtils.formatDate(new Date());

// Format number
const num = FormatUtils.formatNumber(1000000); // "1,000,000"

// Truncate text
const short = FormatUtils.truncate('Long text...', 20);
```

## Error Handling

```typescript
try {
    const result = await DataManager.importData(data, config);
    if (result.failure > 0) {
        console.error('Failed records:', result.failure);
        console.error('Errors:', result.errors);
    }
} catch (error) {
    console.error('Import failed:', error.message);
}
```

## Provider Configurations

### Firebase
```typescript
{
    provider: 'Firebase',
    apiKey: '',
    projectId: '',
    appId: '',
    collectionName: ''
}
```

### Supabase
```typescript
{
    provider: 'Supabase',
    supabaseUrl: '',
    supabaseAnonKey: '',
    collectionName: ''
}
```

### MongoDB
```typescript
{
    provider: 'MongoDB',
    mongoApiUrl: '',
    mongoApiKey: '',
    mongoDataSource: '',
    mongoDatabaseName: '',
    collectionName: ''
}
```

### Appwrite
```typescript
{
    provider: 'Appwrite',
    appwriteEndpoint: '',
    appwriteProjectId: '',
    appwriteDatabaseId: '',
    collectionName: ''
}
```

### PocketBase
```typescript
{
    provider: 'PocketBase',
    pocketbaseUrl: '',
    collectionName: ''
}
```

## Common Patterns

### Complete Import Flow
```typescript
// 1. Setup
const config = ConfigUtils.getDefaultConfig('Firebase');
Object.assign(config, userInputs);

// 2. Validate
const validation = DataManager.validateConfig(config);
if (!validation.isValid) {
    alert(validation.errors.join('\n'));
    return;
}

// 3. Connect
const connected = await DataManager.testConnection(config);
if (!connected) {
    alert('Connection failed');
    return;
}

// 4. Prepare data
const normalized = DataUtils.addMetadata(csvData, {
    fileName: file.name
});

// 5. Import
const result = await DataManager.importData(
    normalized,
    config,
    (current, total) => {
        updateProgressBar(current / total * 100);
    }
);

// 6. Save config
if (result.success > 0) {
    DataManager.saveConfig(config);
}

// 7. Show results
alert(`Imported ${result.success} records`);
```

### Data Verification Flow
```typescript
// Validate data before import
const validation = ValidationUtils.validateRequiredFields(data, [
    'email', 'name'
]);

if (!validation.isValid) {
    console.error(validation.errors);
    return;
}

const typeValidation = ValidationUtils.validateDataTypes(data, {
    email: 'email',
    age: 'number'
});

if (!typeValidation.isValid) {
    console.error(typeValidation.errors);
    return;
}

// Import if valid
await DataManager.importData(data, config);
```
