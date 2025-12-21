/**
 * Schema Tool
 * Generates and infers database schemas from CSV data
 */

import type { CollectionSchema, SchemaField } from '../types';

export class SchemaTool {
    /**
     * Infer schema from CSV data
     */
    static inferSchema(
        headers: string[],
        sampleRows: any[][],
        detectedTypes: Record<string, string>
    ): CollectionSchema {
        const fields: SchemaField[] = headers.map(header => {
            const type = this.mapTypeToSchemaType(detectedTypes[header] || 'string');
            const columnValues = sampleRows.map(row => row[headers.indexOf(header)]);
            const required = this.inferRequired(columnValues);

            return {
                name: this.normalizeFieldName(header),
                type,
                required,
                unique: false // Cannot determine from sample
            };
        });

        // Identify potential required fields
        const requiredFields = fields
            .filter(f => f.required)
            .map(f => f.name);

        return {
            fields,
            required: requiredFields
        };
    }

    /**
     * Get schema for a specific database provider
     */
    static getProviderSchema(
        _provider: string,
        _collectionName: string
    ): CollectionSchema | undefined {
        // In a real implementation, this would fetch schema from the database
        // For now, return undefined and rely on inference

        // Placeholder for future implementation:
        // - Firebase: Could inspect Firestore collection
        // - Supabase: Could query table schema
        // - MongoDB: Could use collection validator

        return undefined;
    }

    /**
     * Validate schema structure
     */
    static validateSchema(schema: CollectionSchema): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (!schema.fields || schema.fields.length === 0) {
            errors.push('Schema must have at least one field');
        }

        // Check for duplicate field names
        const fieldNames = schema.fields.map(f => f.name);
        const duplicates = fieldNames.filter((name, index) =>
            fieldNames.indexOf(name) !== index
        );
        if (duplicates.length > 0) {
            errors.push(`Duplicate field names: ${duplicates.join(', ')}`);
        }

        // Validate field types
        const validTypes = ['string', 'number', 'boolean', 'date', 'email', 'url', 'array', 'object'];
        schema.fields.forEach(field => {
            if (!validTypes.includes(field.type)) {
                errors.push(`Invalid type "${field.type}" for field "${field.name}"`);
            }

            // Check validation rules
            if (field.validation) {
                if (field.validation.min !== undefined && field.validation.max !== undefined) {
                    if (field.validation.min > field.validation.max) {
                        errors.push(`Field "${field.name}": min cannot be greater than max`);
                    }
                }
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Merge user-provided schema with inferred schema
     */
    static mergeSchemas(
        inferredSchema: CollectionSchema,
        userSchema: CollectionSchema
    ): CollectionSchema {
        const mergedFields = new Map<string, SchemaField>();

        // Start with inferred fields
        inferredSchema.fields.forEach(field => {
            mergedFields.set(field.name, field);
        });

        // Override with user-provided fields
        userSchema.fields.forEach(field => {
            const existing = mergedFields.get(field.name);
            if (existing) {
                // Merge properties, user schema takes precedence
                mergedFields.set(field.name, {
                    ...existing,
                    ...field
                });
            } else {
                mergedFields.set(field.name, field);
            }
        });

        return {
            fields: Array.from(mergedFields.values()),
            required: userSchema.required || inferredSchema.required,
            uniqueFields: userSchema.uniqueFields || inferredSchema.uniqueFields
        };
    }

    /**
     * Convert detected type to schema type
     */
    private static mapTypeToSchemaType(
        detectedType: string
    ): SchemaField['type'] {
        const typeMap: Record<string, SchemaField['type']> = {
            'email': 'email',
            'url': 'url',
            'number': 'number',
            'boolean': 'boolean',
            'date': 'date',
            'string': 'string',
            'array': 'array',
            'object': 'object'
        };

        return typeMap[detectedType] || 'string';
    }

    /**
     * Infer if field should be required based on sample data
     */
    private static inferRequired(values: any[]): boolean {
        const validValues = values.filter(v =>
            v !== null && v !== undefined && String(v).trim() !== ''
        );

        // If more than 90% of samples have values, consider it required
        return validValues.length / values.length > 0.9;
    }

    /**
     * Normalize field name for database use
     */
    private static normalizeFieldName(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_+|_+$/g, '');
    }

    /**
     * Generate example schema documentation
     */
    static generateSchemaDoc(schema: CollectionSchema): string {
        let doc = 'Collection Schema:\n\n';

        schema.fields.forEach(field => {
            doc += `- ${field.name} (${field.type})`;
            if (field.required) doc += ' *required*';
            if (field.unique) doc += ' *unique*';
            doc += '\n';

            if (field.validation) {
                if (field.validation.min !== undefined) {
                    doc += `  min: ${field.validation.min}\n`;
                }
                if (field.validation.max !== undefined) {
                    doc += `  max: ${field.validation.max}\n`;
                }
                if (field.validation.pattern) {
                    doc += `  pattern: ${field.validation.pattern}\n`;
                }
            }
        });

        return doc;
    }
}
