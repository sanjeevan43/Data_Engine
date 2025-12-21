# Migration Guide

## Overview
This guide shows how to update existing code to use the new comprehensive database service layer.

## Before (Old Code)

### Old Import Pattern
```typescript
import { useFirebase } from './context/FirebaseContext';
import { useCsvImporter } from './hooks/useCsvImporter';
import { useCollectionData } from './hooks/useCollectionData';
```

### Old Usage
```typescript
const { db, config, updateConfig } = useFirebase();
const { data, purge } = useCollectionData();
const importer = useCsvImporter();
```

## After (New Code)

### New Import Pattern
```typescript
import { DataManager, ConfigUtils, DataUtils } from './services/db';
import type { PipelineConfig } from './context/FirebaseContext';
```

### New Usage
```typescript
// Configuration management
const config: PipelineConfig = { /* ... */ };
DataManager.saveConfig(config);

// Data operations
const records = await DataManager.fetchData(config);
await DataManager.importData(data, config);
await DataManager.purgeData(config);
```

## Step-by-Step Migration

### 1. Update Configuration Management

**Before:**
```typescript
const { config, updateConfig } = useFirebase();

const handleSave = () => {
    updateConfig(newConfig);
    localStorage.setItem('config', JSON.stringify(newConfig));
};
```

**After:**
```typescript
import { DataManager, ConfigUtils } from './services/db';

// Validate before saving
const validation = DataManager.validateConfig(newConfig);
if (!validation.isValid) {
    alert(validation.errors.join('\n'));
    return;
}

// Save
DataManager.saveConfig(newConfig);

// Or use utilities
const sanitized = {
    ...newConfig,
    collectionName: ConfigUtils.sanitizeCollectionName(newConfig.collectionName)
};
DataManager.saveConfig(sanitized);
```

### 2. Update Data Fetching

**Before:**
```typescript
const { data, error } = useCollectionData();

useEffect(() => {
    // Data updates automatically via hook
}, [data]);
```

**After:**
```typescript
const [data, setData] = useState<DatabaseRecord[]>([]);
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
    try {
        const records = await DataManager.fetchData(config);
        setData(records);
        setError(null);
    } catch (err: any) {
        setError(err.message);
    }
};

useEffect(() => {
    if (config && isConnected) {
        loadData();
    }
}, [config, isConnected]);
```

### 3. Update Data Import

**Before:**
```typescript
const { commit, isImporting, error } = useCsvImporter();

const handleImport = async () => {
    await commit();
};
```

**After:**
```typescript
const [isImporting, setIsImporting] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleImport = async (data: any[]) => {
    setIsImporting(true);
    setError(null);
    
    try {
        const result = await DataManager.importData(
            data,
            config,
            (current, total) => {
                setProgress((current / total) * 100);
            }
        );
        
        if (result.failure > 0) {
            setError(`Failed to import ${result.failure} records`);
        }
        
        // Reload data
        await loadData();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsImporting(false);
    }
};
```

### 4. Update Purge Operation

**Before:**
```typescript
const { purge, isPurging } = useCollectionData();

const handlePurge = async () => {
    if (confirm('Delete all records?')) {
        await purge();
    }
};
```

**After:**
```typescript
const [isPurging, setIsPurging] = useState(false);

const handlePurge = async () => {
    if (!confirm(`Delete all records from "${config.collectionName}"?`)) {
        return;
    }
    
    setIsPurging(true);
    try {
        await DataManager.purgeData(config);
        setData([]);
        alert('All records deleted successfully');
    } catch (err: any) {
        alert(`Purge failed: ${err.message}`);
    } finally {
        setIsPurging(false);
    }
};
```

### 5. Add Export Functionality (New Feature)

```typescript
const handleExport = () => {
    try {
        DataManager.exportToCSV(data, config.collectionName);
    } catch (err: any) {
        alert(`Export failed: ${err.message}`);
    }
};
```

### 6. Add Statistics (New Feature)

```typescript
import { DataManager, FormatUtils } from './services/db';

const Stats = ({ data }: { data: DatabaseRecord[] }) => {
    const stats = DataManager.getDataStats(data);
    
    return (
        <div>
            <p>Total Records: {FormatUtils.formatNumber(stats.totalRecords)}</p>
            <p>Unique Sources: {stats.uniqueSources}</p>
            {stats.dateRange.earliest && (
                <p>Date Range: {FormatUtils.formatDate(stats.dateRange.earliest)} 
                   to {FormatUtils.formatDate(stats.dateRange.latest)}</p>
            )}
        </div>
    );
};
```

### 7. Update Connection Testing

**Before:**
```typescript
const { isConnected, error } = useFirebase();

if (!isConnected) {
    return <div>Database offline</div>;
}
```

**After:**
```typescript
const [isConnected, setIsConnected] = useState(false);
const [isTestingConnection, setIsTestingConnection] = useState(false);

const testConnection = async () => {
    setIsTestingConnection(true);
    try {
        const connected = await DataManager.testConnection(config);
        setIsConnected(connected);
        return connected;
    } catch (err) {
        setIsConnected(false);
        return false;
    } finally {
        setIsTestingConnection(false);
    }
};

useEffect(() => {
    if (config) {
        testConnection();
    }
}, [config]);
```

## Complete Component Example

### Before
```typescript
const MyComponent = () => {
    const { config } = useFirebase();
    const { data, purge } = useCollectionData();
    const importer = useCsvImporter();
    
    return (
        <div>
            <button onClick={importer.commit}>Import</button>
            <button onClick={purge}>Purge</button>
            <div>{data.length} records</div>
        </div>
    );
};
```

### After
```typescript
const MyComponent = () => {
    const [config] = useState(() => DataManager.loadConfig());
    const [data, setData] = useState<DatabaseRecord[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [isPurging, setIsPurging] = useState(false);
    
    const loadData = async () => {
        if (!config) return;
        const records = await DataManager.fetchData(config);
        setData(records);
    };
    
    const handleImport = async (csvData: any[]) => {
        if (!config) return;
        setIsImporting(true);
        try {
            await DataManager.importData(csvData, config);
            await loadData();
        } finally {
            setIsImporting(false);
        }
    };
    
    const handlePurge = async () => {
        if (!config || !confirm('Delete all?')) return;
        setIsPurging(true);
        try {
            await DataManager.purgeData(config);
            setData([]);
        } finally {
            setIsPurging(false);
        }
    };
    
    const handleExport = () => {
        if (!config) return;
        DataManager.exportToCSV(data, config.collectionName);
    };
    
    useEffect(() => {
        loadData();
    }, [config]);
    
    return (
        <div>
            <button onClick={handleImport} disabled={isImporting}>
                {isImporting ? 'Importing...' : 'Import'}
            </button>
            <button onClick={handlePurge} disabled={isPurging}>
                {isPurging ? 'Purging...' : 'Purge'}
            </button>
            <button onClick={handleExport}>Export CSV</button>
            <div>{FormatUtils.formatNumber(data.length)} records</div>
        </div>
    );
};
```

## Benefits of Migration

### 1. **Better Type Safety**
- Full TypeScript support
- No implicit any types
- Better IDE autocomplete

### 2. **Multi-Provider Support**
- Easy switching between databases
- Unified interface
- Provider-specific optimizations

### 3. **Enhanced Features**
- CSV export
- Data statistics
- Validation utilities
- Format helpers

### 4. **Better Error Handling**
- Detailed error messages
- Error collection during batch operations
- Graceful fallbacks

### 5. **Configuration Management**
- Built-in validation
- Persistence helpers
- Sanitization utilities

### 6. **Performance**
- Optimized batch sizes
- Concurrent operations where beneficial
- Progress tracking

### 7. **Maintainability**
- Clear separation of concerns
- Comprehensive documentation
- Easy to extend

## Testing Your Migration

1. **Test Configuration**
   ```typescript
   const validation = DataManager.validateConfig(config);
   console.assert(validation.isValid, validation.errors);
   ```

2. **Test Connection**
   ```typescript
   const connected = await DataManager.testConnection(config);
   console.assert(connected, 'Connection failed');
   ```

3. **Test Import**
   ```typescript
   const testData = [{ test: 'value' }];
   const result = await DataManager.importData(testData, config);
   console.assert(result.success === 1, 'Import failed');
   ```

4. **Test Fetch**
   ```typescript
   const records = await DataManager.fetchData(config);
   console.assert(records.length > 0, 'No records fetched');
   ```

5. **Test Export**
   ```typescript
   DataManager.exportToCSV(records, 'test');
   // Check if file downloads
   ```

## Backwards Compatibility

The existing hooks (`useFirebase`, `useCsvImporter`, `useCollectionData`) still work! You can:
- Migrate gradually, component by component
- Keep using hooks for React state management
- Use DataManager for one-off operations

## Need Help?

Refer to:
- **API_REFERENCE.md** - Quick API guide
- **src/services/db/README.md** - Detailed documentation
- **IMPLEMENTATION_SUMMARY.md** - Complete feature list
