/**
 * Database Schema Types
 * Defines Primary Keys, Foreign Keys, and Data Validation
 */

// ============================================
// DATA TYPES
// ============================================

export type DataType =
    | 'string'
    | 'number'
    | 'integer'
    | 'float'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'timestamp'
    | 'email'
    | 'url'
    | 'phone'
    | 'json'
    | 'array'
    | 'geopoint';

// ============================================
// PRIMARY KEY CONFIGURATION
// ============================================

export interface PrimaryKeyConfig {
    /**
     * Type of primary key strategy
     * - 'auto': Database auto-generates unique IDs (recommended for Firebase)
     * - 'csv-column': Use a specific CSV column as primary key
     * - 'composite': Combine multiple columns to create unique key
     */
    type: 'auto' | 'csv-column' | 'composite';

    /**
     * Column name to use as primary key (for 'csv-column' type)
     * Example: 'email', 'user_id', 'product_sku'
     */
    columnName?: string;

    /**
     * Multiple columns to combine for composite key (for 'composite' type)
     * Example: ['first_name', 'last_name', 'birth_date']
     */
    compositeColumns?: string[];

    /**
     * Separator for composite keys
     * Example: '_' results in 'John_Doe_1990-01-01'
     */
    compositeSeparator?: string;

    /**
     * Whether to validate uniqueness before import
     */
    validateUniqueness?: boolean;
}

// ============================================
// FOREIGN KEY CONFIGURATION
// ============================================

export interface ForeignKeyConfig {
    /**
     * Name of the column in current CSV that references another collection
     * Example: 'customer_id' in orders.csv
     */
    sourceColumn: string;

    /**
     * Name of the referenced collection/table
     * Example: 'customers'
     */
    targetCollection: string;

    /**
     * Name of the primary key field in the target collection
     * Example: 'id' or 'customer_id'
     */
    targetPrimaryKey: string;

    /**
     * Action to take when referenced record is deleted
     * - 'cascade': Delete all referencing records
     * - 'set-null': Set foreign key to null
     * - 'restrict': Prevent deletion if references exist
     * - 'no-action': Do nothing (may cause orphaned records)
     */
    onDelete: 'cascade' | 'set-null' | 'restrict' | 'no-action';

    /**
     * Action to take when referenced record's PK is updated
     */
    onUpdate: 'cascade' | 'set-null' | 'restrict' | 'no-action';

    /**
     * Whether this foreign key is required (NOT NULL)
     */
    required?: boolean;

    /**
     * Whether to validate FK references before import
     */
    validateReferences?: boolean;
}

// ============================================
// FIELD VALIDATION
// ============================================

export interface FieldValidation {
    /**
     * Minimum value (for numbers) or length (for strings)
     */
    min?: number;

    /**
     * Maximum value (for numbers) or length (for strings)
     */
    max?: number;

    /**
     * Regular expression pattern for validation
     * Example: '^[A-Z]{2}\\d{4}$' for 'AB1234' format
     */
    pattern?: string;

    /**
     * Allowed values (enum)
     * Example: ['active', 'inactive', 'pending']
     */
    enum?: any[];

    /**
     * Custom validation function
     */
    customValidator?: (value: any) => boolean | string;
}

// ============================================
// FIELD SCHEMA
// ============================================

export interface FieldSchema {
    /**
     * Field name (column name from CSV)
     */
    name: string;

    /**
     * Display name for UI
     */
    displayName?: string;

    /**
     * Data type of the field
     */
    type: DataType;

    /**
     * Whether this field is required (NOT NULL)
     */
    required: boolean;

    /**
     * Whether values must be unique across all records
     */
    unique: boolean;

    /**
     * Default value if not provided
     */
    defaultValue?: any;

    /**
     * Validation rules
     */
    validation?: FieldValidation;

    /**
     * Whether this field is a primary key
     */
    isPrimaryKey?: boolean;

    /**
     * Whether this field is a foreign key
     */
    isForeignKey?: boolean;

    /**
     * Foreign key configuration (if isForeignKey is true)
     */
    foreignKeyConfig?: ForeignKeyConfig;

    /**
     * Description/help text
     */
    description?: string;

    /**
     * Whether to index this field for faster queries
     */
    indexed?: boolean;
}

// ============================================
// COLLECTION SCHEMA
// ============================================

export interface CollectionSchema {
    /**
     * Collection/table name
     */
    collectionName: string;

    /**
     * Display name for UI
     */
    displayName?: string;

    /**
     * Primary key configuration
     */
    primaryKey: PrimaryKeyConfig;

    /**
     * Field definitions
     */
    fields: FieldSchema[];

    /**
     * Foreign key relationships
     */
    foreignKeys?: ForeignKeyConfig[];

    /**
     * Indexes for query optimization
     */
    indexes?: IndexConfig[];

    /**
     * Normalization level achieved
     * 1NF, 2NF, 3NF, BCNF, 4NF, 5NF
     */
    normalizationLevel?: '1NF' | '2NF' | '3NF' | 'BCNF' | '4NF' | '5NF';

    /**
     * Description of the collection
     */
    description?: string;

    /**
     * Timestamp fields to auto-populate
     */
    timestamps?: {
        createdAt?: boolean;
        updatedAt?: boolean;
    };
}

// ============================================
// INDEX CONFIGURATION
// ============================================

export interface IndexConfig {
    /**
     * Name of the index
     */
    name: string;

    /**
     * Fields to index
     */
    fields: Array<{
        fieldPath: string;
        order: 'ASCENDING' | 'DESCENDING';
    }>;

    /**
     * Whether this is a unique index
     */
    unique?: boolean;

    /**
     * Query scope (for Firestore)
     */
    queryScope?: 'COLLECTION' | 'COLLECTION_GROUP';
}

// ============================================
// VALIDATION RESULTS
// ============================================

export interface ValidationError {
    /**
     * Row number where error occurred
     */
    row: number;

    /**
     * Field name with error
     */
    field: string;

    /**
     * Error message
     */
    message: string;

    /**
     * Severity level
     */
    severity: 'error' | 'warning' | 'info';

    /**
     * Suggested fix
     */
    suggestedFix?: any;
}

export interface ValidationResult {
    /**
     * Whether validation passed
     */
    valid: boolean;

    /**
     * List of validation errors
     */
    errors: ValidationError[];

    /**
     * Number of rows validated
     */
    totalRows: number;

    /**
     * Number of rows with errors
     */
    errorRows: number;

    /**
     * Validation summary
     */
    summary: {
        primaryKeyViolations: number;
        foreignKeyViolations: number;
        dataTypeErrors: number;
        requiredFieldErrors: number;
        uniqueConstraintViolations: number;
        validationRuleViolations: number;
    };
}

// ============================================
// IMPORT CONFIGURATION
// ============================================

export interface ImportConfig {
    /**
     * Collection schema
     */
    schema: CollectionSchema;

    /**
     * Whether to validate before import
     */
    validateBeforeImport: boolean;

    /**
     * Whether to stop on first error
     */
    stopOnError: boolean;

    /**
     * Batch size for imports
     */
    batchSize: number;

    /**
     * Whether to use transactions
     */
    useTransactions: boolean;

    /**
     * Whether to skip duplicate primary keys
     */
    skipDuplicates: boolean;

    /**
     * Whether to update existing records
     */
    updateExisting: boolean;

    /**
     * Progress callback
     */
    onProgress?: (progress: ImportProgress) => void;

    /**
     * Error callback
     */
    onError?: (error: ValidationError) => void;
}

export interface ImportProgress {
    /**
     * Total rows to import
     */
    total: number;

    /**
     * Rows processed so far
     */
    processed: number;

    /**
     * Rows successfully imported
     */
    success: number;

    /**
     * Rows failed
     */
    failed: number;

    /**
     * Percentage complete
     */
    percentage: number;

    /**
     * Current status message
     */
    status: string;
}

// ============================================
// RELATIONSHIP TYPES
// ============================================

export type RelationshipType =
    | 'one-to-one'    // 1:1 - User → Profile
    | 'one-to-many'   // 1:N - Customer → Orders
    | 'many-to-one'   // N:1 - Orders → Customer
    | 'many-to-many'; // N:M - Students ↔ Courses

export interface Relationship {
    type: RelationshipType;
    fromCollection: string;
    toCollection: string;
    fromField: string;
    toField: string;
    description?: string;
}

// ============================================
// NORMALIZATION HELPERS
// ============================================

export interface NormalizationSuggestion {
    /**
     * Current normalization level
     */
    currentLevel: '1NF' | '2NF' | '3NF' | 'BCNF' | '4NF' | '5NF' | 'Unnormalized';

    /**
     * Suggested normalization level
     */
    suggestedLevel: '1NF' | '2NF' | '3NF' | 'BCNF' | '4NF' | '5NF';

    /**
     * Issues found
     */
    issues: Array<{
        type: 'duplicate-data' | 'partial-dependency' | 'transitive-dependency' | 'multi-valued-dependency';
        description: string;
        affectedFields: string[];
    }>;

    /**
     * Suggested schema changes
     */
    suggestions: Array<{
        action: 'split-table' | 'create-junction-table' | 'move-field' | 'add-foreign-key';
        description: string;
        newSchema?: CollectionSchema;
    }>;
}
