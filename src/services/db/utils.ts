/**
 * Utility functions for database operations and data processing
 */

import type { PipelineConfig } from '../../context/FirebaseContext';
import type { DatabaseRecord } from './types';

/**
 * Configuration utilities
 */
export class ConfigUtils {
    /**
     * Merge two configurations, with newConfig taking precedence
     */
    static merge(baseConfig: Partial<PipelineConfig>, newConfig: Partial<PipelineConfig>): PipelineConfig {
        return {
            ...baseConfig,
            ...newConfig,
            provider: newConfig.provider || baseConfig.provider || 'Firebase',
            collectionName: newConfig.collectionName || baseConfig.collectionName || 'csv_imports'
        } as PipelineConfig;
    }

    /**
     * Check if configuration has changed
     */
    static hasChanged(config1: PipelineConfig, config2: PipelineConfig): boolean {
        const keys: (keyof PipelineConfig)[] = ['provider', 'collectionName', 'apiKey', 'projectId', 'appId'];
        return keys.some(key => config1[key] !== config2[key]);
    }

    /**
     * Sanitize collection/table name
     */
    static sanitizeCollectionName(name: string): string {
        return name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_+|_+$/g, '');
    }

    /**
     * Get default config for a provider
     */
    static getDefaultConfig(provider: PipelineConfig['provider']): Partial<PipelineConfig> {
        const base = {
            provider,
            collectionName: 'csv_imports'
        };

        switch (provider) {
            case 'Firebase':
                return {
                    ...base,
                    apiKey: '',
                    authDomain: '',
                    projectId: '',
                    storageBucket: '',
                    messagingSenderId: '',
                    appId: '',
                    measurementId: ''
                };
            case 'Supabase':
                return {
                    ...base,
                    supabaseUrl: '',
                    supabaseAnonKey: ''
                };
            case 'Appwrite':
                return {
                    ...base,
                    appwriteEndpoint: '',
                    appwriteProjectId: '',
                    appwriteDatabaseId: ''
                };
            case 'MongoDB':
                return {
                    ...base,
                    mongoApiUrl: '',
                    mongoApiKey: '',
                    mongoDataSource: '',
                    mongoDatabaseName: ''
                };
            case 'PocketBase':
                return {
                    ...base,
                    pocketbaseUrl: ''
                };
            case 'AWS Amplify':
                return {
                    ...base,
                    amplifyApiUrl: '',
                    amplifyApiKey: '',
                    amplifyRegion: 'us-east-1'
                };
            default:
                return base;
        }
    }
}

/**
 * Data transformation utilities
 */
export class DataUtils {
    /**
     * Clean and normalize field names
     */
    static normalizeFieldName(fieldName: string): string {
        return fieldName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_+|_+$/g, '');
    }

    /**
     * Transform CSV data with mapping
     */
    static transformData(
        csvRows: any[][],
        mapping: { csvHeader: string; firestoreField: string; isEnabled: boolean }[]
    ): any[] {
        return csvRows.map(row => {
            const transformed: any = {};
            mapping.forEach((field, index) => {
                if (field.isEnabled && row[index] !== undefined) {
                    transformed[field.firestoreField] = row[index];
                }
            });
            return transformed;
        });
    }

    /**
     * Detect data types in CSV columns
     */
    static detectDataTypes(data: any[][], headers: string[]): Record<string, 'string' | 'number' | 'boolean' | 'date'> {
        const types: Record<string, 'string' | 'number' | 'boolean' | 'date'> = {};

        headers.forEach((header, index) => {
            const samples = data.slice(0, Math.min(100, data.length)).map(row => row[index]);
            types[header] = this.inferType(samples);
        });

        return types;
    }

    private static inferType(samples: any[]): 'string' | 'number' | 'boolean' | 'date' {
        const validSamples = samples.filter(s => s !== null && s !== undefined && s !== '');

        if (validSamples.length === 0) return 'string';

        // Check for boolean
        const booleanPattern = /^(true|false|yes|no|0|1)$/i;
        if (validSamples.every(s => booleanPattern.test(String(s)))) {
            return 'boolean';
        }

        // Check for number
        const numberPattern = /^-?\d+\.?\d*$/;
        if (validSamples.every(s => numberPattern.test(String(s)))) {
            return 'number';
        }

        // Check for date
        const datePattern = /^\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/;
        if (validSamples.some(s => datePattern.test(String(s)))) {
            return 'date';
        }

        return 'string';
    }

    /**
     * Convert values based on detected type
     */
    static convertValue(value: any, type: 'string' | 'number' | 'boolean' | 'date'): any {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        switch (type) {
            case 'number':
                const num = Number(value);
                return isNaN(num) ? null : num;
            case 'boolean':
                const str = String(value).toLowerCase();
                return str === 'true' || str === 'yes' || str === '1';
            case 'date':
                try {
                    const date = new Date(value);
                    return isNaN(date.getTime()) ? null : date;
                } catch {
                    return null;
                }
            default:
                return String(value);
        }
    }

    /**
     * Filter data based on criteria
     */
    static filterData(
        data: DatabaseRecord[],
        filters: { field: string; operator: 'equals' | 'contains' | 'startsWith' | 'endsWith'; value: any }[]
    ): DatabaseRecord[] {
        return data.filter(record => {
            return filters.every(filter => {
                const fieldValue = String(record[filter.field] || '');
                const searchValue = String(filter.value || '');

                switch (filter.operator) {
                    case 'equals':
                        return fieldValue === searchValue;
                    case 'contains':
                        return fieldValue.toLowerCase().includes(searchValue.toLowerCase());
                    case 'startsWith':
                        return fieldValue.toLowerCase().startsWith(searchValue.toLowerCase());
                    case 'endsWith':
                        return fieldValue.toLowerCase().endsWith(searchValue.toLowerCase());
                    default:
                        return true;
                }
            });
        });
    }

    /**
     * Sort data by field
     */
    static sortData(
        data: DatabaseRecord[],
        field: string,
        direction: 'asc' | 'desc' = 'asc'
    ): DatabaseRecord[] {
        return [...data].sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];

            if (aVal === bVal) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            const comparison = aVal < bVal ? -1 : 1;
            return direction === 'asc' ? comparison : -comparison;
        });
    }

    /**
     * Deduplicate data based on a field
     */
    static deduplicate(data: DatabaseRecord[], field: string): DatabaseRecord[] {
        const seen = new Set();
        return data.filter(record => {
            const value = record[field];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }

    /**
     * Add metadata to data rows
     */
    static addMetadata(
        data: any[],
        metadata: { fileName?: string; source?: string;[key: string]: any }
    ): any[] {
        return data.map(row => ({
            ...row,
            _fileName: metadata.fileName,
            _uploadedAt: new Date(),
            ...Object.fromEntries(
                Object.entries(metadata).filter(([key]) => key !== 'fileName')
            )
        }));
    }
}

/**
 * Validation utilities
 */
export class ValidationUtils {
    /**
     * Validate email format
     */
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL format
     */
    static isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate required fields in data
     */
    static validateRequiredFields(
        data: any[],
        requiredFields: string[]
    ): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        data.forEach((row, index) => {
            requiredFields.forEach(field => {
                if (!row[field] || String(row[field]).trim() === '') {
                    errors.push(`Row ${index + 1}: Missing required field "${field}"`);
                }
            });
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate data types
     */
    static validateDataTypes(
        data: any[],
        schema: Record<string, 'string' | 'number' | 'boolean' | 'email' | 'url'>
    ): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        data.forEach((row, index) => {
            Object.entries(schema).forEach(([field, expectedType]) => {
                const value = row[field];
                if (value === null || value === undefined || value === '') return;

                let isValid = true;

                switch (expectedType) {
                    case 'number':
                        isValid = !isNaN(Number(value));
                        break;
                    case 'boolean':
                        isValid = /^(true|false|yes|no|0|1)$/i.test(String(value));
                        break;
                    case 'email':
                        isValid = this.isValidEmail(String(value));
                        break;
                    case 'url':
                        isValid = this.isValidUrl(String(value));
                        break;
                }

                if (!isValid) {
                    errors.push(`Row ${index + 1}: Invalid ${expectedType} in field "${field}"`);
                }
            });
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

/**
 * Format utilities
 */
export class FormatUtils {
    /**
     * Format file size in human-readable format
     */
    static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Format date in readable format
     */
    static formatDate(date: Date | string | any): string {
        try {
            let d: Date;
            if (date instanceof Date) {
                d = date;
            } else if (typeof date === 'string') {
                d = new Date(date);
            } else if (date.toDate && typeof date.toDate === 'function') {
                d = date.toDate();
            } else {
                return 'Invalid Date';
            }

            if (isNaN(d.getTime())) return 'Invalid Date';

            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
        } catch {
            return 'Invalid Date';
        }
    }

    /**
     * Format number with thousands separator
     */
    static formatNumber(num: number): string {
        return num.toLocaleString();
    }

    /**
     * Truncate text with ellipsis
     */
    static truncate(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
}
