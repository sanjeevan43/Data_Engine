/**
 * Data Validation Tool
 * Validates data against schema rules and business logic
 */

import type { ValidationResult, DataError, CollectionSchema } from '../types';
import { ValidationUtils } from '../../db/utils';

export class ValidateDataTool {
    /**
     * Validate data rows against schema
     */
    static validate(
        data: Array<Record<string, any>>,
        schema: CollectionSchema | undefined
    ): ValidationResult {
        const errors: DataError[] = [];
        const warnings: string[] = [];
        let validRowCount = 0;
        let invalidRowCount = 0;

        data.forEach((row, index) => {
            const rowErrors = this.validateRow(row, schema, index);
            errors.push(...rowErrors);

            if (rowErrors.some(e => e.severity === 'error')) {
                invalidRowCount++;
            } else {
                validRowCount++;
            }
        });

        // Add general warnings
        if (invalidRowCount > 0) {
            warnings.push(
                `${invalidRowCount} rows have validation errors that must be fixed before import`
            );
        }

        if (!schema) {
            warnings.push('No schema provided - only basic validation performed');
        }

        return {
            isValid: invalidRowCount === 0,
            errors,
            warnings,
            validRowCount,
            invalidRowCount
        };
    }

    /**
     * Validate a single data row
     */
    private static validateRow(
        row: Record<string, any>,
        schema: CollectionSchema | undefined,
        rowIndex: number
    ): DataError[] {
        const errors: DataError[] = [];

        if (!schema) {
            // Basic validation without schema
            return this.basicValidation(row, rowIndex);
        }

        // Check required fields
        schema.required?.forEach(fieldName => {
            if (!this.hasValue(row[fieldName])) {
                errors.push({
                    row: rowIndex + 1,
                    field: fieldName,
                    message: 'Required field is missing or empty',
                    severity: 'error',
                    originalValue: row[fieldName],
                    suggestedValue: null
                });
            }
        });

        // Validate field types and rules
        schema.fields.forEach(field => {
            const value = row[field.name];

            // Skip null/undefined optional fields
            if (!this.hasValue(value) && !field.required) {
                return;
            }

            // Type validation
            const typeError = this.validateType(value, field.type, field.name, rowIndex);
            if (typeError) {
                errors.push(typeError);
            }

            // Additional validation rules
            if (field.validation) {
                const ruleErrors = this.validateRules(value, field.validation, field.name, rowIndex);
                errors.push(...ruleErrors);
            }

            // Unique field check (warning only - actual check requires full dataset)
            if (field.unique && !this.hasValue(value)) {
                errors.push({
                    row: rowIndex + 1,
                    field: field.name,
                    message: 'Unique field cannot be empty',
                    severity: 'error',
                    originalValue: value
                });
            }
        });

        return errors;
    }

    /**
     * Basic validation without schema
     */
    private static basicValidation(
        row: Record<string, any>,
        rowIndex: number
    ): DataError[] {
        const errors: DataError[] = [];

        Object.entries(row).forEach(([field, value]) => {
            if (!this.hasValue(value)) {
                return; // Skip empty values in basic validation
            }

            const strValue = String(value);

            // Check if it looks like email
            if (field.toLowerCase().includes('email') || field.toLowerCase().includes('mail')) {
                if (!ValidationUtils.isValidEmail(strValue)) {
                    errors.push({
                        row: rowIndex + 1,
                        field,
                        message: 'Invalid email format',
                        severity: 'error',
                        originalValue: value,
                        suggestedValue: strValue.toLowerCase().trim()
                    });
                }
            }

            // Check if it looks like URL
            if (field.toLowerCase().includes('url') || field.toLowerCase().includes('website')) {
                if (!ValidationUtils.isValidUrl(strValue)) {
                    errors.push({
                        row: rowIndex + 1,
                        field,
                        message: 'Invalid URL format',
                        severity: 'error',
                        originalValue: value
                    });
                }
            }

            // Check for suspiciously long strings
            if (strValue.length > 10000) {
                errors.push({
                    row: rowIndex + 1,
                    field,
                    message: 'Field value exceeds reasonable length (10,000 characters)',
                    severity: 'warning',
                    originalValue: value
                });
            }
        });

        return errors;
    }

    /**
     * Validate value type
     */
    private static validateType(
        value: any,
        expectedType: string,
        fieldName: string,
        rowIndex: number
    ): DataError | null {
        if (!this.hasValue(value)) {
            return null;
        }

        const strValue = String(value);
        let isValid = true;
        let suggestedValue: any = null;

        switch (expectedType) {
            case 'email': {
                isValid = ValidationUtils.isValidEmail(strValue);
                if (!isValid) {
                    suggestedValue = strValue.toLowerCase().trim();
                }
                break;
            }

            case 'url': {
                isValid = ValidationUtils.isValidUrl(strValue);
                break;
            }

            case 'number': {
                const cleaned = strValue.replace(/[,$]/g, '');
                isValid = !isNaN(Number(cleaned));
                if (isValid) {
                    suggestedValue = Number(cleaned);
                }
                break;
            }

            case 'boolean': {
                const boolPattern = /^(true|false|yes|no|0|1)$/i;
                isValid = boolPattern.test(strValue);
                if (isValid) {
                    suggestedValue = ['true', 'yes', '1'].includes(strValue.toLowerCase());
                }
                break;
            }

            case 'date':
                try {
                    const date = new Date(value);
                    isValid = !isNaN(date.getTime());
                    if (isValid) {
                        suggestedValue = date.toISOString();
                    }
                } catch {
                    isValid = false;
                }
                break;

            case 'array':
                isValid = Array.isArray(value);
                break;

            case 'object':
                isValid = typeof value === 'object' && value !== null && !Array.isArray(value);
                break;

            default:
                // 'string' or unknown type - accept as-is
                break;
        }

        if (!isValid) {
            return {
                row: rowIndex + 1,
                field: fieldName,
                message: `Invalid ${expectedType} format`,
                severity: 'error',
                originalValue: value,
                suggestedValue
            };
        }

        return null;
    }

    /**
     * Validate field-specific rules
     */
    private static validateRules(
        value: any,
        rules: any,
        fieldName: string,
        rowIndex: number
    ): DataError[] {
        const errors: DataError[] = [];

        if (!this.hasValue(value)) {
            return errors;
        }

        // Min/max for numbers
        if (typeof value === 'number') {
            if (rules.min !== undefined && value < rules.min) {
                errors.push({
                    row: rowIndex + 1,
                    field: fieldName,
                    message: `Value ${value} is below minimum ${rules.min}`,
                    severity: 'error',
                    originalValue: value
                });
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push({
                    row: rowIndex + 1,
                    field: fieldName,
                    message: `Value ${value} exceeds maximum ${rules.max}`,
                    severity: 'error',
                    originalValue: value
                });
            }
        }

        // String length
        const strValue = String(value);
        if (rules.minLength !== undefined && strValue.length < rules.minLength) {
            errors.push({
                row: rowIndex + 1,
                field: fieldName,
                message: `String length ${strValue.length} is below minimum ${rules.minLength}`,
                severity: 'error',
                originalValue: value
            });
        }
        if (rules.maxLength !== undefined && strValue.length > rules.maxLength) {
            errors.push({
                row: rowIndex + 1,
                field: fieldName,
                message: `String length ${strValue.length} exceeds maximum ${rules.maxLength}`,
                severity: 'error',
                originalValue: value
            });
        }

        // Pattern matching
        if (rules.pattern) {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(strValue)) {
                errors.push({
                    row: rowIndex + 1,
                    field: fieldName,
                    message: `Value does not match required pattern: ${rules.pattern}`,
                    severity: 'error',
                    originalValue: value
                });
            }
        }

        return errors;
    }

    /**
     * Check if value is present (not null, undefined, or empty string)
     */
    private static hasValue(value: any): boolean {
        return value !== null && value !== undefined && String(value).trim() !== '';
    }
}
