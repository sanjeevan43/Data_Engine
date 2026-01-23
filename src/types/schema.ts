/**
 * Schema Types for Database Validation
 */

export interface CollectionSchema {
    name: string;
    fields: FieldSchema[];
    primaryKey: PrimaryKeyConfig;
    foreignKeys?: ForeignKeyConfig[];
    indexes?: IndexConfig[];
    constraints?: ConstraintConfig[];
}

export interface FieldSchema {
    name: string;
    type: 'string' | 'number' | 'integer' | 'float' | 'boolean' | 'date' | 'datetime' | 'timestamp' | 'email' | 'url' | 'phone' | 'json' | 'array';
    required?: boolean;
    unique?: boolean;
    defaultValue?: any;
    validation?: FieldValidation;
}

export interface FieldValidation {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
    customValidator?: (value: any) => boolean | string;
}

export interface PrimaryKeyConfig {
    type: 'auto' | 'csv-column' | 'composite';
    columnName?: string;
    compositeColumns?: string[];
    compositeSeparator?: string;
}

export interface ForeignKeyConfig {
    sourceColumn: string;
    targetCollection: string;
    targetPrimaryKey: string;
    required?: boolean;
    onDelete?: 'cascade' | 'restrict' | 'set-null';
    onUpdate?: 'cascade' | 'restrict' | 'set-null';
}

export interface IndexConfig {
    fields: string[];
    unique?: boolean;
    name?: string;
}

export interface ConstraintConfig {
    type: 'check' | 'unique' | 'foreign-key';
    fields: string[];
    condition?: string;
}

export interface ValidationError {
    row: number;
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    suggestedFix?: any;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    totalRows: number;
    errorRows: number;
    summary: ValidationSummary;
}

export interface ValidationSummary {
    primaryKeyViolations: number;
    foreignKeyViolations: number;
    dataTypeErrors: number;
    requiredFieldErrors: number;
    uniqueConstraintViolations: number;
    validationRuleViolations: number;
}

export interface NormalizationSuggestion {
    currentLevel: 'Unnormalized' | '1NF' | '2NF' | '3NF' | 'BCNF';
    suggestedLevel: '1NF' | '2NF' | '3NF' | 'BCNF';
    issues: Array<{
        type: 'multi-valued-dependency' | 'partial-dependency' | 'transitive-dependency';
        description: string;
        affectedFields: string[];
    }>;
    suggestions: Array<{
        action: 'split-table' | 'create-lookup' | 'normalize-field';
        description: string;
        newTables?: string[];
    }>;
}