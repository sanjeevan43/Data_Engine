/**
 * Hostinger MySQL Database Service
 * 
 * Provides integration with Hostinger's MySQL databases
 * Note: Direct MySQL connections from browser are not possible due to security.
 * This service requires a backend API proxy.
 */

import type { PipelineConfig } from '../../../context/FirebaseContext';
import type { IDatabaseService, ImportResult } from '../types';

export class HostingerService implements IDatabaseService {
    private config: PipelineConfig;
    private apiEndpoint: string;

    constructor(config: PipelineConfig) {
        this.config = config;
        // You'll need to set up a backend API endpoint that proxies MySQL queries
        this.apiEndpoint = config.hostingerHost || '';
    }

    async testConnection(config: PipelineConfig): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiEndpoint}/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    host: this.config.hostingerHost,
                    port: this.config.hostingerPort || '3306',
                    database: this.config.hostingerDatabase,
                    username: this.config.hostingerUsername,
                    password: this.config.hostingerPassword,
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('Hostinger connection test failed:', error);
            return false;
        }
    }

    async importData(
        data: Array<Record<string, any>>,
        config: PipelineConfig,
        onProgress?: (count: number) => void
    ): Promise<ImportResult> {
        const total = data.length;
        let success = 0;
        let failure = 0;
        const errors: string[] = [];

        try {
            // Batch insert for better performance
            const batchSize = 100;
            
            for (let i = 0; i < total; i += batchSize) {
                const batch = data.slice(i, i + batchSize);
                
                try {
                    const response = await fetch(`${this.apiEndpoint}/insert`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            host: this.config.hostingerHost,
                            port: this.config.hostingerPort || '3306',
                            database: this.config.hostingerDatabase,
                            username: this.config.hostingerUsername,
                            password: this.config.hostingerPassword,
                            table: this.config.hostingerTable || this.config.collectionName,
                            data: batch,
                        }),
                    });

                    if (response.ok) {
                        success += batch.length;
                    } else {
                        failure += batch.length;
                        const error = await response.text();
                        errors.push(`Batch ${i / batchSize + 1}: ${error}`);
                    }
                } catch (error: any) {
                    failure += batch.length;
                    errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
                }

                if (onProgress) {
                    onProgress(Math.min(i + batchSize, total));
                }
            }

            return { success, failure, errors };
        } catch (error: any) {
            return {
                success: 0,
                failure: total,
                errors: [error.message],
            };
        }
    }

    async fetchData(config: PipelineConfig): Promise<Array<Record<string, any>>> {
        try {
            const response = await fetch(`${this.apiEndpoint}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    host: this.config.hostingerHost,
                    port: this.config.hostingerPort || '3306',
                    database: this.config.hostingerDatabase,
                    username: this.config.hostingerUsername,
                    password: this.config.hostingerPassword,
                    table: this.config.hostingerTable || this.config.collectionName,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data from Hostinger MySQL');
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Hostinger fetch error:', error);
            return [];
        }
    }

    async purgeData(config: PipelineConfig): Promise<void> {
        try {
            const response = await fetch(`${this.apiEndpoint}/truncate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    host: this.config.hostingerHost,
                    port: this.config.hostingerPort || '3306',
                    database: this.config.hostingerDatabase,
                    username: this.config.hostingerUsername,
                    password: this.config.hostingerPassword,
                    table: this.config.hostingerTable || this.config.collectionName,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to purge Hostinger MySQL data');
            }
        } catch (error) {
            console.error('Hostinger purge error:', error);
            throw error;
        }
    }
}
