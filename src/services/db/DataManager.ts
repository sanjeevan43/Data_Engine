import type { PipelineConfig } from '../../context/FirebaseContext';
import { DatabaseServiceFactory } from './DatabaseServiceFactory';
import type { ImportResult, DatabaseRecord } from './types';

/**
 * Unified Data Manager for all database operations
 * Provides a single interface for all database providers
 */
export class DataManager {
    /**
     * Test database connection with the provided configuration
     */
    static async testConnection(config: PipelineConfig): Promise<boolean> {
        try {
            const service = DatabaseServiceFactory.getService(config.provider);
            return await service.testConnection(config);
        } catch (error: any) {
            console.error('Connection test error:', error);
            return false;
        }
    }

    /**
     * Validate configuration before using it
     */
    static validateConfig(config: PipelineConfig): { isValid: boolean; errors: string[] } {
        return DatabaseServiceFactory.validateConfig(config);
    }

    /**
     * Import data to the configured database
     */
    static async importData(
        data: any[],
        config: PipelineConfig,
        onProgress?: (count: number, total: number) => void
    ): Promise<ImportResult> {
        // Validate config first
        const validation = this.validateConfig(config);
        if (!validation.isValid) {
            return {
                success: 0,
                failure: data.length,
                errors: validation.errors.map(err => ({ error: err, type: 'validation' }))
            };
        }

        try {
            const service = DatabaseServiceFactory.getService(config.provider);
            return await service.importData(data, config, (count) => {
                if (onProgress) {
                    onProgress(count, data.length);
                }
            });
        } catch (error: any) {
            console.error('Import error:', error);
            return {
                success: 0,
                failure: data.length,
                errors: [{ error: error.message, type: 'import_failure' }]
            };
        }
    }

    /**
     * Fetch data from the configured database
     */
    static async fetchData(config: PipelineConfig): Promise<DatabaseRecord[]> {
        try {
            const service = DatabaseServiceFactory.getService(config.provider);
            return await service.fetchData(config);
        } catch (error: any) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    /**
     * Purge/delete all data from the configured database collection/table
     */
    static async purgeData(config: PipelineConfig): Promise<void> {
        try {
            const service = DatabaseServiceFactory.getService(config.provider);

            if (service.purgeData) {
                await service.purgeData(config);
            } else {
                throw new Error(`Purge operation not supported for ${config.provider}`);
            }
        } catch (error: any) {
            console.error('Purge error:', error);
            throw error;
        }
    }

    /**
     * Save configuration to local storage
     */
    static saveConfig(config: PipelineConfig, storageKey: string = 'fci_user_config_v4'): void {
        try {
            localStorage.setItem(storageKey, JSON.stringify(config));
        } catch (error: any) {
            console.error('Failed to save configuration:', error);
            throw new Error('Failed to save configuration to local storage');
        }
    }

    /**
     * Load configuration from local storage
     */
    static loadConfig(storageKey: string = 'fci_user_config_v4'): PipelineConfig | null {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : null;
        } catch (error: any) {
            console.error('Failed to load configuration:', error);
            return null;
        }
    }

    /**
     * Clear configuration from local storage
     */
    static clearConfig(storageKey: string = 'fci_user_config_v4'): void {
        try {
            localStorage.removeItem(storageKey);
            DatabaseServiceFactory.clearCache();
        } catch (error: any) {
            console.error('Failed to clear configuration:', error);
        }
    }

    /**
     * Export data as CSV
     */
    static exportToCSV(data: DatabaseRecord[], filename: string = 'export'): void {
        if (data.length === 0) {
            throw new Error('No data to export');
        }

        // Get headers (exclude internal fields)
        const headers = Object.keys(data[0]).filter(
            k => !['id', '_fileName', '_uploadedAt', '_batchNumber'].includes(k)
        );

        // Create CSV content
        const headerRow = headers.join(',');
        const rows = data.map(row =>
            headers.map(h => {
                const value = row[h];
                // Escape quotes and wrap in quotes if contains comma or quote
                const stringValue = String(value ?? '');
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            }).join(',')
        );

        const csvContent = [headerRow, ...rows].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    /**
     * Get statistics about the data
     */
    static getDataStats(data: DatabaseRecord[]): {
        totalRecords: number;
        uniqueSources: number;
        dateRange: { earliest: Date | null; latest: Date | null };
        fieldCount: number;
    } {
        if (data.length === 0) {
            return {
                totalRecords: 0,
                uniqueSources: 0,
                dateRange: { earliest: null, latest: null },
                fieldCount: 0
            };
        }

        const sources = new Set(data.map(row => row._fileName || 'Unknown'));
        const dates = data
            .map(row => row._uploadedAt)
            .filter(d => d)
            .map(d => {
                if (d instanceof Date) return d;
                if (d.toDate && typeof d.toDate === 'function') return d.toDate();
                return new Date(d);
            });

        return {
            totalRecords: data.length,
            uniqueSources: sources.size,
            dateRange: {
                earliest: dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null,
                latest: dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null
            },
            fieldCount: Object.keys(data[0]).length
        };
    }
}
