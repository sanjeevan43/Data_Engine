/**
 * Data Fixing Tool
 * Automatically fixes common data issues
 */

import type { FixResult, Transformation, DataError } from '../types';

export class FixDataTool {
    /**
     * Fix common data issues in rows
     */
    static fix(
        data: Array<Record<string, any>>,
        errors: DataError[]
    ): FixResult {
        const fixedData: Array<Record<string, any>> = [];
        const transformations: Transformation[] = [];
        const unfixableErrors: DataError[] = [];

        data.forEach((row, index) => {
            const { fixedRow, rowTransformations, rowUnfixableErrors } =
                this.fixRow(row, errors.filter(e => e.row === index + 1), index);

            fixedData.push(fixedRow);
            transformations.push(...rowTransformations);
            unfixableErrors.push(...rowUnfixableErrors);
        });

        // Global fixes
        const dedupedResult = this.deduplicateData(fixedData, transformations);

        return {
            fixedData: dedupedResult.data,
            transformations: dedupedResult.transformations,
            unfixableErrors
        };
    }

    /**
     * Fix a single row
     */
    private static fixRow(
        row: Record<string, any>,
        rowErrors: DataError[],
        rowIndex: number
    ): {
        fixedRow: Record<string, any>;
        rowTransformations: Transformation[];
        rowUnfixableErrors: DataError[];
    } {
        const fixedRow: Record<string, any> = { ...row };
        const rowTransformations: Transformation[] = [];
        const rowUnfixableErrors: DataError[] = [];

        // Apply general fixes first
        Object.keys(fixedRow).forEach(field => {
            const originalValue = fixedRow[field];

            // Skip null/undefined
            if (originalValue === null || originalValue === undefined) {
                return;
            }

            let newValue = originalValue;
            let wasFixed = false;

            // Trim whitespace
            if (typeof originalValue === 'string') {
                newValue = originalValue.trim();
                if (newValue !== originalValue) {
                    wasFixed = true;
                }
            }

            // Normalize email to lowercase
            if (field.toLowerCase().includes('email') && typeof newValue === 'string') {
                const normalized = newValue.toLowerCase();
                if (normalized !== newValue) {
                    newValue = normalized;
                    wasFixed = true;
                }
            }

            // Remove thousand separators from numbers
            if (typeof newValue === 'string' && /^\$?[\d,]+\.?\d*$/.test(newValue)) {
                const cleaned = newValue.replace(/[,$]/g, '');
                const num = Number(cleaned);
                if (!isNaN(num)) {
                    newValue = num;
                    wasFixed = true;
                }
            }

            // Convert boolean strings
            if (typeof newValue === 'string' && /^(true|false|yes|no|0|1)$/i.test(newValue)) {
                const lower = newValue.toLowerCase();
                if (['true', 'yes', '1'].includes(lower)) {
                    newValue = true;
                    wasFixed = true;
                } else if (['false', 'no', '0'].includes(lower)) {
                    newValue = false;
                    wasFixed = true;
                }
            }

            if (wasFixed) {
                fixedRow[field] = newValue;
                rowTransformations.push({
                    row: rowIndex + 1,
                    field,
                    operation: 'auto-fix',
                    originalValue,
                    newValue
                });
            }
        });

        // Apply error-specific fixes
        rowErrors.forEach(error => {
            if (error.suggestedValue !== undefined && error.suggestedValue !== null) {
                // We have a suggested fix
                fixedRow[error.field] = error.suggestedValue;
                rowTransformations.push({
                    row: rowIndex + 1,
                    field: error.field,
                    operation: `fix-${error.message.toLowerCase().replace(/\s+/g, '-')}`,
                    originalValue: error.originalValue,
                    newValue: error.suggestedValue
                });
            } else {
                // Cannot auto-fix
                rowUnfixableErrors.push(error);
            }
        });

        return { fixedRow, rowTransformations, rowUnfixableErrors };
    }

    /**
     * Mark duplicate rows (don't remove - let human decide)
     */
    private static deduplicateData(
        data: Array<Record<string, any>>,
        existingTransformations: Transformation[]
    ): {
        data: Array<Record<string, any>>;
        transformations: Transformation[];
    } {
        const seen = new Set<string>();
        const transformations = [...existingTransformations];

        data.forEach((row, index) => {
            // Create a hash of the row for duplicate detection
            const hash = this.hashRow(row);

            if (seen.has(hash)) {
                // Mark as duplicate but DON'T remove
                transformations.push({
                    row: index + 1,
                    field: '*',
                    operation: 'mark-duplicate',
                    originalValue: row,
                    newValue: row // Keep the data, just mark it
                });
            } else {
                seen.add(hash);
            }
        });

        // Return ALL data (no removal)
        return { data, transformations };
    }

    /**
     * Create a hash of a row for duplicate detection
     */
    private static hashRow(row: Record<string, any>): string {
        // Sort keys to ensure consistent hashing
        const sortedKeys = Object.keys(row).sort();
        const values = sortedKeys.map(key => {
            const val = row[key];
            if (val === null || val === undefined) return '';
            return String(val).toLowerCase().trim();
        });
        return values.join('||');
    }

    /**
     * Normalize dates to ISO format
     */
    static normalizeDates(
        data: Array<Record<string, any>>,
        dateFields: string[]
    ): {
        data: Array<Record<string, any>>;
        transformations: Transformation[];
    } {
        const transformations: Transformation[] = [];
        const normalizedData = data.map((row, index) => {
            const newRow = { ...row };

            dateFields.forEach(field => {
                const value = newRow[field];
                if (!value) return;

                try {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        const isoDate = date.toISOString();
                        if (isoDate !== value) {
                            newRow[field] = isoDate;
                            transformations.push({
                                row: index + 1,
                                field,
                                operation: 'normalize-date',
                                originalValue: value,
                                newValue: isoDate
                            });
                        }
                    }
                } catch {
                    // Leave as-is if cannot parse
                }
            });

            return newRow;
        });

        return { data: normalizedData, transformations };
    }

    /**
     * Fill missing values with defaults
     */
    static fillDefaults(
        data: Array<Record<string, any>>,
        defaults: Record<string, any>
    ): {
        data: Array<Record<string, any>>;
        transformations: Transformation[];
    } {
        const transformations: Transformation[] = [];
        const filledData = data.map((row, index) => {
            const newRow = { ...row };

            Object.entries(defaults).forEach(([field, defaultValue]) => {
                if (!this.hasValue(newRow[field])) {
                    newRow[field] = defaultValue;
                    transformations.push({
                        row: index + 1,
                        field,
                        operation: 'fill-default',
                        originalValue: newRow[field],
                        newValue: defaultValue
                    });
                }
            });

            return newRow;
        });

        return { data: filledData, transformations };
    }

    /**
     * Check if value exists
     */
    private static hasValue(value: any): boolean {
        return value !== null && value !== undefined && String(value).trim() !== '';
    }
}
