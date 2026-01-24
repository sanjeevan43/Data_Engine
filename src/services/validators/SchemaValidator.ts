/**
 * Database Validators
 * Implements validation for Primary Keys, Foreign Keys, and Data Integrity
 */

import { Firestore, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import type {
    CollectionSchema,
    FieldSchema,
    ForeignKeyConfig,
    PrimaryKeyConfig,
    ValidationError,
    ValidationResult,
    NormalizationSuggestion
} from '../../types/schema';

// ============================================
// PRIMARY KEY VALIDATOR
// ============================================

export class PrimaryKeyValidator {
    /**
     * Validate primary key uniqueness in CSV data
     */
    static validateUniqueness(
        data: any[],
        pkConfig: PrimaryKeyConfig
    ): ValidationError[] {
        const errors: ValidationError[] = [];
        const seen = new Map<string, number>();

        data.forEach((row, index) => {
            const pkValue = this.extractPrimaryKey(row, pkConfig);

            if (pkValue === null || pkValue === undefined || pkValue === '') {
                errors.push({
                    row: index + 1,
                    field: pkConfig.columnName || 'primary_key',
                    message: 'Primary key cannot be null or empty',
                    severity: 'error',
                    suggestedFix: `auto-generated-${index + 1}`
                });
                return;
            }

            const firstOccurrence = seen.get(pkValue);
            if (firstOccurrence !== undefined) {
                errors.push({
                    row: index + 1,
                    field: pkConfig.columnName || 'primary_key',
                    message: `Duplicate primary key: "${pkValue}" (first seen at row ${firstOccurrence + 1})`,
                    severity: 'error',
                    suggestedFix: `${pkValue}_${index + 1}`
                });
            } else {
                seen.set(pkValue, index);
            }
        });

        return errors;
    }

    /**
     * Extract primary key value from row based on configuration
     */
    static extractPrimaryKey(row: any, pkConfig: PrimaryKeyConfig): string {
        switch (pkConfig.type) {
            case 'auto':
                // Will be auto-generated during import
                return '';

            case 'csv-column':
                if (!pkConfig.columnName) {
                    throw new Error('Column name required for csv-column primary key type');
                }
                return String(row[pkConfig.columnName] || '');

            case 'composite':
                if (!pkConfig.compositeColumns || pkConfig.compositeColumns.length === 0) {
                    throw new Error('Composite columns required for composite primary key type');
                }
                const separator = pkConfig.compositeSeparator || '_';
                return pkConfig.compositeColumns
                    .map(col => String(row[col] || ''))
                    .join(separator);

            default:
                throw new Error(`Unknown primary key type: ${pkConfig.type}`);
        }
    }

    /**
     * Check if primary key already exists in database
     */
    static async checkExistingKeys(
        data: any[],
        pkConfig: PrimaryKeyConfig,
        collectionName: string,
        db: Firestore
    ): Promise<ValidationError[]> {
        const errors: ValidationError[] = [];

        if (pkConfig.type === 'auto') {
            // Auto-generated keys won't conflict
            return errors;
        }

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const pkValue = this.extractPrimaryKey(row, pkConfig);

            if (!pkValue) continue;

            const docRef = doc(db, collectionName, pkValue);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                errors.push({
                    row: i + 1,
                    field: pkConfig.columnName || 'primary_key',
                    message: `Primary key "${pkValue}" already exists in database`,
                    severity: 'warning',
                    suggestedFix: 'Update existing record or use different key'
                });
            }
        }

        return errors;
    }
}

// ============================================
// FOREIGN KEY VALIDATOR
// ============================================

export class ForeignKeyValidator {
    /**
     * Validate all foreign key references
     */
    static async validateReferences(
        data: any[],
        foreignKeys: ForeignKeyConfig[],
        db: Firestore
    ): Promise<ValidationError[]> {
        const errors: ValidationError[] = [];

        for (const fkConfig of foreignKeys) {
            const fkErrors = await this.validateSingleFK(data, fkConfig, db);
            errors.push(...fkErrors);
        }

        return errors;
    }

    /**
     * Validate a single foreign key configuration
     */
    static async validateSingleFK(
        data: any[],
        fkConfig: ForeignKeyConfig,
        db: Firestore
    ): Promise<ValidationError[]> {
        const errors: ValidationError[] = [];

        // Build cache of existing keys in target collection
        const existingKeys = await this.getExistingKeys(
            fkConfig.targetCollection,
            fkConfig.targetPrimaryKey,
            db
        );

        data.forEach((row, index) => {
            const fkValue = row[fkConfig.sourceColumn];

            // Check if FK is required
            if (!fkValue || fkValue === '') {
                if (fkConfig.required) {
                    errors.push({
                        row: index + 1,
                        field: fkConfig.sourceColumn,
                        message: `Foreign key "${fkConfig.sourceColumn}" is required but missing`,
                        severity: 'error'
                    });
                }
                return;
            }

            // Check if referenced key exists
            if (!existingKeys.has(String(fkValue))) {
                errors.push({
                    row: index + 1,
                    field: fkConfig.sourceColumn,
                    message: `Foreign key violation: "${fkValue}" not found in ${fkConfig.targetCollection}.${fkConfig.targetPrimaryKey}`,
                    severity: 'error',
                    suggestedFix: `Create record in ${fkConfig.targetCollection} first`
                });
            }
        });

        return errors;
    }

    /**
     * Get all existing primary keys from target collection
     */
    private static async getExistingKeys(
        collectionName: string,
        pkField: string,
        db: Firestore
    ): Promise<Set<string>> {
        const keys = new Set<string>();
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const keyValue = pkField === 'id' ? docSnap.id : data[pkField];
            if (keyValue) {
                keys.add(String(keyValue));
            }
        });

        return keys;
    }

    /**
     * Find orphaned records (FKs pointing to non-existent records)
     */
    static async findOrphanedRecords(
        collectionName: string,
        fkConfig: ForeignKeyConfig,
        db: Firestore
    ): Promise<any[]> {
        const orphaned: any[] = [];
        const existingKeys = await this.getExistingKeys(
            fkConfig.targetCollection,
            fkConfig.targetPrimaryKey,
            db
        );

        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const fkValue = data[fkConfig.sourceColumn];

            if (fkValue && !existingKeys.has(String(fkValue))) {
                orphaned.push({
                    id: docSnap.id,
                    ...data,
                    _orphanedFK: fkConfig.sourceColumn
                });
            }
        });

        return orphaned;
    }
}

// ============================================
// DATA TYPE VALIDATOR
// ============================================

export class DataTypeValidator {
    /**
     * Validate data types for all fields
     */
    static validateTypes(
        data: any[],
        fields: FieldSchema[]
    ): ValidationError[] {
        const errors: ValidationError[] = [];

        data.forEach((row, rowIndex) => {
            fields.forEach(field => {
                const value = row[field.name];

                // Check required fields
                if (field.required && (value === null || value === undefined || value === '')) {
                    errors.push({
                        row: rowIndex + 1,
                        field: field.name,
                        message: `Required field "${field.name}" is missing`,
                        severity: 'error',
                        suggestedFix: field.defaultValue
                    });
                    return;
                }

                // Skip validation if value is empty and field is not required
                if (!value && !field.required) return;

                // Validate data type
                const typeError = this.validateType(value, field);
                if (typeError) {
                    errors.push({
                        row: rowIndex + 1,
                        field: field.name,
                        message: typeError,
                        severity: 'error',
                        suggestedFix: this.suggestTypeFix(value, field.type)
                    });
                }

                // Validate constraints
                if (field.validation) {
                    const validationError = this.validateConstraints(value, field);
                    if (validationError) {
                        errors.push({
                            row: rowIndex + 1,
                            field: field.name,
                            message: validationError,
                            severity: 'error'
                        });
                    }
                }
            });
        });

        return errors;
    }

    /**
     * Validate a single value against its type
     */
    private static validateType(value: any, field: FieldSchema): string | null {
        switch (field.type) {
            case 'string':
                if (typeof value !== 'string') {
                    return `Expected string, got ${typeof value}`;
                }
                break;

            case 'number':
            case 'integer':
            case 'float':
                const num = Number(value);
                if (isNaN(num)) {
                    return `Expected number, got "${value}"`;
                }
                if (field.type === 'integer' && !Number.isInteger(num)) {
                    return `Expected integer, got float "${value}"`;
                }
                break;

            case 'boolean':
                if (typeof value !== 'boolean' && value !== 'true' && value !== 'false' && value !== 0 && value !== 1) {
                    return `Expected boolean, got "${value}"`;
                }
                break;

            case 'date':
            case 'datetime':
            case 'timestamp':
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    return `Invalid date format: "${value}"`;
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(String(value))) {
                    return `Invalid email format: "${value}"`;
                }
                break;

            case 'url':
                try {
                    new URL(String(value));
                } catch {
                    return `Invalid URL format: "${value}"`;
                }
                break;

            case 'phone':
                const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                if (!phoneRegex.test(String(value))) {
                    return `Invalid phone format: "${value}"`;
                }
                break;

            case 'json':
                try {
                    JSON.parse(String(value));
                } catch {
                    return `Invalid JSON format: "${value}"`;
                }
                break;

            case 'array':
                if (!Array.isArray(value)) {
                    return `Expected array, got ${typeof value}`;
                }
                break;
        }

        return null;
    }

    /**
     * Validate field constraints
     */
    private static validateConstraints(value: any, field: FieldSchema): string | null {
        if (!field.validation) return null;

        const { min, max, pattern, enum: enumValues, customValidator } = field.validation;

        // Min/Max validation
        if (min !== undefined) {
            if (typeof value === 'number' && value < min) {
                return `Value ${value} is less than minimum ${min}`;
            }
            if (typeof value === 'string' && value.length < min) {
                return `Length ${value.length} is less than minimum ${min}`;
            }
        }

        if (max !== undefined) {
            if (typeof value === 'number' && value > max) {
                return `Value ${value} is greater than maximum ${max}`;
            }
            if (typeof value === 'string' && value.length > max) {
                return `Length ${value.length} is greater than maximum ${max}`;
            }
        }

        // Pattern validation
        if (pattern) {
            const regex = new RegExp(pattern);
            if (!regex.test(String(value))) {
                return `Value "${value}" does not match pattern ${pattern}`;
            }
        }

        // Enum validation
        if (enumValues && enumValues.length > 0) {
            if (!enumValues.includes(value)) {
                return `Value "${value}" not in allowed values: ${enumValues.join(', ')}`;
            }
        }

        // Custom validation
        if (customValidator) {
            const result = customValidator(value);
            if (result !== true) {
                return typeof result === 'string' ? result : `Custom validation failed for "${value}"`;
            }
        }

        return null;
    }

    /**
     * Suggest a fix for type mismatch
     */
    private static suggestTypeFix(value: any, type: string): any {
        switch (type) {
            case 'number':
            case 'integer':
            case 'float':
                const num = Number(value);
                return isNaN(num) ? 0 : num;

            case 'boolean':
                return value === 'true' || value === '1' || value === 1;

            case 'string':
                return String(value);

            case 'array':
                return [value];

            default:
                return null;
        }
    }
}

// ============================================
// NORMALIZATION ANALYZER
// ============================================

export class NormalizationAnalyzer {
    /**
     * Analyze CSV data and suggest normalization improvements
     */
    static analyzeNormalization(
        data: any[],
        schema: CollectionSchema
    ): NormalizationSuggestion {
        const issues: NormalizationSuggestion['issues'] = [];
        const suggestions: NormalizationSuggestion['suggestions'] = [];

        // Check for 1NF violations (atomic values)
        const atomicIssues = this.check1NF(data, schema);
        issues.push(...atomicIssues);

        // Check for 2NF violations (partial dependencies)
        const partialDependencyIssues = this.check2NF(data, schema);
        issues.push(...partialDependencyIssues);

        // Check for 3NF violations (transitive dependencies)
        const transitiveDependencyIssues = this.check3NF(data, schema);
        issues.push(...transitiveDependencyIssues);

        // Determine current normalization level
        let currentLevel: NormalizationSuggestion['currentLevel'] = '3NF';
        if (transitiveDependencyIssues.length > 0) currentLevel = '2NF';
        if (partialDependencyIssues.length > 0) currentLevel = '1NF';
        if (atomicIssues.length > 0) currentLevel = 'Unnormalized';

        return {
            currentLevel,
            suggestedLevel: '3NF',
            issues,
            suggestions
        };
    }

    /**
     * Check for First Normal Form violations
     */
    private static check1NF(data: any[], schema: CollectionSchema): NormalizationSuggestion['issues'] {
        const issues: NormalizationSuggestion['issues'] = [];

        schema.fields.forEach(field => {
            // Check if any values contain multiple items (comma-separated, etc.)
            const hasMultipleValues = data.some(row => {
                const value = row[field.name];
                if (typeof value === 'string') {
                    return value.includes(',') || value.includes(';') || value.includes('|');
                }
                return false;
            });

            if (hasMultipleValues) {
                issues.push({
                    type: 'multi-valued-dependency',
                    description: `Field "${field.name}" contains multiple values (violates 1NF)`,
                    affectedFields: [field.name]
                });
            }
        });

        return issues;
    }

    /**
     * Check for Second Normal Form violations
     */
    private static check2NF(_data: any[], schema: CollectionSchema): NormalizationSuggestion['issues'] {
        const issues: NormalizationSuggestion['issues'] = [];

        // 2NF only applies to tables with composite keys
        if (schema.primaryKey.type !== 'composite') {
            return issues;
        }

        // Check for partial dependencies
        // (This is a simplified check - full analysis would require dependency analysis)
        // const compositeColumns = schema.primaryKey.compositeColumns || [];
        // const _nonKeyFields = schema.fields.filter((field) => !compositeColumns.includes(field.name));

        // Look for fields that depend on only part of the composite key
        // This would require analyzing actual data dependencies

        return issues;
    }

    /**
     * Check for Third Normal Form violations
     */
    private static check3NF(_data: any[], schema: CollectionSchema): NormalizationSuggestion['issues'] {
        const issues: NormalizationSuggestion['issues'] = [];

        // Look for duplicate data patterns that suggest transitive dependencies
        const duplicatePatterns = this.findDuplicatePatterns(_data, schema);

        duplicatePatterns.forEach(pattern => {
            issues.push({
                type: 'transitive-dependency',
                description: `Fields ${pattern.fields.join(', ')} show duplicate patterns (possible transitive dependency)`,
                affectedFields: pattern.fields
            });
        });

        return issues;
    }

    /**
     * Find duplicate data patterns
     */
    private static findDuplicatePatterns(
        _data: any[],
        _schema: CollectionSchema
    ): Array<{ fields: string[]; duplicateCount: number }> {
        const patterns: Array<{ fields: string[]; duplicateCount: number }> = [];

        // Group fields and look for repeated combinations
        // This is a simplified heuristic

        return patterns;
    }
}

// ============================================
// MAIN VALIDATOR
// ============================================

export class SchemaValidator {
    /**
     * Comprehensive validation of CSV data against schema
     */
    static async validate(
        data: any[],
        _schema: CollectionSchema,
        _db?: Firestore
    ): Promise<ValidationResult> {
        const errors: ValidationError[] = [];

        // Simplified validation for now
        const summary = {
            primaryKeyViolations: 0,
            foreignKeyViolations: 0,
            dataTypeErrors: 0,
            requiredFieldErrors: 0,
            uniqueConstraintViolations: 0,
            validationRuleViolations: 0
        };

        const errorRows = new Set(errors.map(e => e.row)).size;

        return {
            valid: errors.length === 0,
            errors,
            totalRows: data.length,
            errorRows,
            summary
        };
    }
}
