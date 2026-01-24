/**
 * Airtable Database Service
 * 
 * Provides integration with Airtable's API
 */

import type { PipelineConfig } from '../../../context/FirebaseContext';
import type { IDatabaseService, ImportResult } from '../types';

export class AirtableService implements IDatabaseService {
    private config: PipelineConfig;
    private baseUrl: string;

    constructor(config: PipelineConfig) {
        this.config = config;
        this.baseUrl = `https://api.airtable.com/v0/${config.airtableBaseId}/${encodeURIComponent(config.airtableTableName || config.collectionName)}`;
    }

    private getHeaders(): HeadersInit {
        return {
            'Authorization': `Bearer ${this.config.airtableApiKey}`,
            'Content-Type': 'application/json',
        };
    }

    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            return response.ok;
        } catch (error) {
            console.error('Airtable connection test failed:', error);
            return false;
        }
    }

    async importData(
        data: Array<Record<string, any>>,
        _config: PipelineConfig,
        onProgress?: (count: number) => void
    ): Promise<ImportResult> {
        const total = data.length;
        let success = 0;
        let failure = 0;
        const errors: string[] = [];

        try {
            // Airtable allows max 10 records per request
            const batchSize = 10;
            
            for (let i = 0; i < total; i += batchSize) {
                const batch = data.slice(i, i + batchSize);
                
                // Convert to Airtable format
                const records = batch.map(item => ({
                    fields: item
                }));

                try {
                    const response = await fetch(this.baseUrl, {
                        method: 'POST',
                        headers: this.getHeaders(),
                        body: JSON.stringify({ records }),
                    });

                    if (response.ok) {
                        success += batch.length;
                    } else {
                        failure += batch.length;
                        const error = await response.json();
                        errors.push(`Batch ${i / batchSize + 1}: ${error.error?.message || 'Unknown error'}`);
                    }
                } catch (error: any) {
                    failure += batch.length;
                    errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
                }

                if (onProgress) {
                    onProgress(Math.min(i + batchSize, total));
                }

                // Rate limiting: Airtable allows 5 requests per second
                await new Promise(resolve => setTimeout(resolve, 200));
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

    async fetchData(): Promise<Array<Record<string, any>>> {
        try {
            const allRecords: Array<Record<string, any>> = [];
            let offset: string | undefined;

            do {
                const url = offset 
                    ? `${this.baseUrl}?offset=${offset}` 
                    : this.baseUrl;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: this.getHeaders(),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data from Airtable');
                }

                const result = await response.json();
                
                // Extract fields from records
                const records = result.records.map((record: any) => ({
                    id: record.id,
                    ...record.fields
                }));

                allRecords.push(...records);
                offset = result.offset;
            } while (offset);

            return allRecords;
        } catch (error) {
            console.error('Airtable fetch error:', error);
            return [];
        }
    }

    async purgeData(): Promise<void> {
        try {
            // Fetch all record IDs
            const records = await this.fetchData();
            const recordIds = records.map((r: any) => r.id).filter(Boolean);

            // Delete in batches of 10
            const batchSize = 10;
            for (let i = 0; i < recordIds.length; i += batchSize) {
                const batch = recordIds.slice(i, i + batchSize);
                const deleteUrl = `${this.baseUrl}?${batch.map(id => `records[]=${id}`).join('&')}`;

                const response = await fetch(deleteUrl, {
                    method: 'DELETE',
                    headers: this.getHeaders(),
                });

                if (!response.ok) {
                    throw new Error('Failed to delete records from Airtable');
                }

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        } catch (error) {
            console.error('Airtable purge error:', error);
            throw error;
        }
    }
}
