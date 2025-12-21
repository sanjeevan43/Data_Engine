# Database Service Layer Documentation

This document describes the comprehensive database service layer for the Firebase CSV Importer application.

## Overview

The database service layer provides a unified interface for working with multiple database providers including Firebase, Supabase, Appwrite, MongoDB, and PocketBase.

## Architecture

```
services/db/
├── index.ts                     # Main export file
├── types.ts                     # TypeScript interfaces
├── DatabaseServiceFactory.ts    # Service factory
├── DataManager.ts              # Unified data operations
└── providers/
    ├── FirebaseService.ts
    ├── SupabaseService.ts
    ├── AppwriteService.ts
    ├── MongoDBService.ts
    └── PocketBaseService.ts
```

## Core Components

### 1. DatabaseServiceFactory

Factory class for creating and managing database service instances.

**Methods:**
- `getService(provider: DatabaseProvider): IDatabaseService` - Get service instance
- `validateConfig(config: PipelineConfig): ValidationResult` - Validate configuration
- `clearCache(): void` - Clear cached service instances

### 2. DataManager

Unified interface for all database operations.

**Methods:**

#### Connection Management
```typescript
// Test database connection
await DataManager.testConnection(config);

// Validate configuration
const validation = DataManager.validateConfig(config);
if (!validation.isValid) {
    console.error(validation.errors);
}
```

#### Data Operations
```typescript
// Import data
const result = await DataManager.importData(
    data,
    config,
    (count, total) => {
        console.log(`Imported ${count}/${total}`);
    }
);

// Fetch data
const records = await DataManager.fetchData(config);

// Purge all data
await DataManager.purgeData(config);
```

#### Configuration Management
```typescript
// Save configuration
DataManager.saveConfig(config);

// Load configuration
const config = DataManager.loadConfig();

// Clear configuration
DataManager.clearConfig();
```

#### Export & Statistics
```typescript
// Export data as CSV
DataManager.exportToCSV(records, 'my-export');

// Get statistics
const stats = DataManager.getDataStats(records);
console.log(stats.totalRecords);
console.log(stats.uniqueSources);
```

### 3. IDatabaseService Interface

All database providers implement this interface.

```typescript
interface IDatabaseService {
    testConnection(config: PipelineConfig): Promise<boolean>;
    importData(data: any[], config: PipelineConfig, onProgress?: (count: number) => void): Promise<ImportResult>;
    fetchData(config: PipelineConfig): Promise<any[]>;
    purgeData?(config: PipelineConfig): Promise<void>;
}
```

## Database Providers

### Firebase/Firestore

**Required Configuration:**
- `apiKey` - Firebase API Key
- `projectId` - Firebase Project ID
- `appId` - Firebase App ID
- `collectionName` - Firestore collection name

**Optional:**
- `authDomain`
- `storageBucket`
- `messagingSenderId`
- `measurementId`

### Supabase

**Required Configuration:**
- `supabaseUrl` - Supabase project URL
- `supabaseAnonKey` - Supabase anonymous key
- `collectionName` - Table name

### Appwrite

**Required Configuration:**
- `appwriteEndpoint` - Appwrite API endpoint
- `appwriteProjectId` - Project ID
- `appwriteDatabaseId` - Database ID
- `collectionName` - Collection name

### MongoDB (Data API)

**Required Configuration:**
- `mongoApiUrl` - MongoDB Data API URL
- `mongoApiKey` - API Key
- `mongoDataSource` - Data source name
- `mongoDatabaseName` - Database name
- `collectionName` - Collection name

### PocketBase

**Required Configuration:**
- `pocketbaseUrl` - PocketBase instance URL
- `collectionName` - Collection name

## Usage Examples

### Basic Import Flow

```typescript
import { DataManager } from './services/db/DataManager';
import type { PipelineConfig } from './context/FirebaseContext';

// 1. Define configuration
const config: PipelineConfig = {
    provider: 'Firebase',
    apiKey: 'your-api-key',
    projectId: 'your-project-id',
    appId: 'your-app-id',
    collectionName: 'users'
};

// 2. Validate configuration
const validation = DataManager.validateConfig(config);
if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
}

// 3. Test connection
const isConnected = await DataManager.testConnection(config);
if (!isConnected) {
    throw new Error('Connection failed');
}

// 4. Import data
const csvData = [
    { name: 'John', email: 'john@example.com', age: 30 },
    { name: 'Jane', email: 'jane@example.com', age: 25 }
];

const result = await DataManager.importData(
    csvData,
    config,
    (current, total) => {
        console.log(`Progress: ${current}/${total}`);
    }
);

console.log(`Success: ${result.success}, Failed: ${result.failure}`);
if (result.errors.length > 0) {
    console.error('Errors:', result.errors);
}
```

### Fetching and Exporting Data

```typescript
// Fetch data
const records = await DataManager.fetchData(config);

// Get statistics
const stats = DataManager.getDataStats(records);
console.log(`Total: ${stats.totalRecords}`);
console.log(`Sources: ${stats.uniqueSources}`);

// Export to CSV
DataManager.exportToCSV(records, 'my-data-export');
```

### Configuration Persistence

```typescript
// Save configuration
DataManager.saveConfig(config);

// Later, load configuration
const savedConfig = DataManager.loadConfig();
if (savedConfig) {
    // Use saved configuration
}

// Clear configuration and cache
DataManager.clearConfig();
```

## Error Handling

All methods throw descriptive errors. Always wrap in try-catch:

```typescript
try {
    await DataManager.importData(data, config);
} catch (error) {
    console.error('Import failed:', error.message);
    // Handle error appropriately
}
```

## Import Results

The `importData` method returns an `ImportResult`:

```typescript
interface ImportResult {
    success: number;    // Number of successful imports
    failure: number;    // Number of failed imports
    errors: any[];     // Array of error details
}
```

## Best Practices

1. **Always validate configuration** before using it
2. **Test connection** before importing large datasets
3. **Use progress callbacks** for user feedback on large imports
4. **Handle errors** appropriately with try-catch blocks
5. **Batch large imports** - services automatically handle batching
6. **Confirm before purging** - purge operations are irreversible

## Performance Considerations

- **Firebase**: Batches of 450 documents (Firestore limit is 500)
- **Supabase**: Batches of 1000 rows
- **MongoDB**: Batches of 1000 documents
- **Appwrite**: Concurrency of 5 (documents created individually)
- **PocketBase**: Concurrency of 10 (documents created individually)

## Security Notes

- Never expose API keys or credentials in client-side code
- Use environment variables for sensitive configuration
- Implement proper database security rules
- Validate and sanitize all imported data
- Use appropriate authentication methods for each provider

## Future Enhancements

- Support for AWS Amplify
- Real-time data synchronization
- Advanced query capabilities
- Data transformation pipelines
- Scheduled imports
- Webhook support
