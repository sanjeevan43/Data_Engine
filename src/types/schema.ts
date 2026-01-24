export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'integer' | 'float' | 'datetime' | 'timestamp' | 'phone' | 'json' | 'array';
  required?: boolean;
  unique?: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enum?: any[];
    customValidator?: (value: any) => boolean | string;
  };
}

export interface FieldSchema extends SchemaField {}

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
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
  suggestedFix?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  totalRows: number;
  errorRows: number;
  summary: {
    primaryKeyViolations: number;
    foreignKeyViolations: number;
    dataTypeErrors: number;
    requiredFieldErrors: number;
    uniqueConstraintViolations: number;
    validationRuleViolations: number;
  };
}

export interface NormalizationSuggestion {
  currentLevel: 'Unnormalized' | '1NF' | '2NF' | '3NF';
  suggestedLevel: '1NF' | '2NF' | '3NF';
  issues: Array<{
    type: 'multi-valued-dependency' | 'partial-dependency' | 'transitive-dependency';
    description: string;
    affectedFields: string[];
  }>;
  suggestions: string[];
}

export interface CollectionSchema {
  name: string;
  fields: FieldSchema[];
  primaryKey: PrimaryKeyConfig;
  foreignKeys?: ForeignKeyConfig[];
  indexes?: string[];
}

export interface TableSchema {
  name: string;
  fields: SchemaField[];
  primaryKey?: string;
  indexes?: string[];
}

export interface DatabaseSchema {
  tables: TableSchema[];
  version: string;
  created: Date;
  updated: Date;
}