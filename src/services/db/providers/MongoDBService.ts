import type { IDatabaseService, ImportResult } from '../types';
import type { PipelineConfig } from '../../../context/FirebaseContext';

/**
 * MongoDB Data API Service
 * Uses MongoDB Atlas Data API for HTTP-based access
 * https://www.mongodb.com/docs/atlas/api/data-api/
 */
export class MongoDBService implements IDatabaseService {
    async testConnection(config: PipelineConfig): Promise<boolean> {
        if (!config.mongoApiUrl || !config.mongoApiKey || !config.mongoDataSource || !config.mongoDatabaseName) {
            return false;
        }

        try {
            const response = await fetch(`${config.mongoApiUrl}/action/findOne`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': config.mongoApiKey
                },
                body: JSON.stringify({
                    dataSource: config.mongoDataSource,
                    database: config.mongoDatabaseName,
                    collection: config.collectionName,
                    filter: {}
                })
            });

            return response.ok;
        } catch (e) {
            console.error('MongoDB connection test failed:', e);
            return false;
        }
    }

    async importData(data: any[], config: PipelineConfig, onProgress?: (count: number) => void): Promise<ImportResult> {
        if (!config.mongoApiUrl || !config.mongoApiKey) {
            throw new Error("Missing MongoDB configuration");
        }

        // MongoDB Data API supports insertMany
        const BATCH_SIZE = 1000;
        let success = 0;
        let failure = 0;
        const errors: any[] = [];
        const totalChunks = Math.ceil(data.length / BATCH_SIZE);

        for (let i = 0; i < totalChunks; i++) {
            const chunk = data.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

            try {
                const response = await fetch(`${config.mongoApiUrl}/action/insertMany`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': config.mongoApiKey
                    },
                    body: JSON.stringify({
                        dataSource: config.mongoDataSource,
                        database: config.mongoDatabaseName,
                        collection: config.collectionName,
                        documents: chunk
                    })
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || response.statusText);
                }

                const result = await response.json();
                success += result.insertedIds?.length || chunk.length;
                if (onProgress) onProgress(success);
            } catch (err: any) {
                failure += chunk.length;
                errors.push({ batch: i, error: err.message });
            }
        }

        return { success, failure, errors };
    }

    async fetchData(config: PipelineConfig): Promise<any[]> {
        if (!config.mongoApiUrl || !config.mongoApiKey) return [];

        try {
            const response = await fetch(`${config.mongoApiUrl}/action/find`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': config.mongoApiKey
                },
                body: JSON.stringify({
                    dataSource: config.mongoDataSource,
                    database: config.mongoDatabaseName,
                    collection: config.collectionName,
                    filter: {},
                    limit: 100,
                    sort: { _id: -1 }
                })
            });

            if (!response.ok) throw new Error("Failed to fetch MongoDB data");

            const result = await response.json();
            return result.documents || [];
        } catch (e) {
            console.error('MongoDB fetch error:', e);
            return [];
        }
    }

    async purgeData(config: PipelineConfig): Promise<void> {
        if (!config.mongoApiUrl || !config.mongoApiKey) {
            throw new Error('Missing MongoDB configuration');
        }

        const response = await fetch(`${config.mongoApiUrl}/action/deleteMany`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': config.mongoApiKey
            },
            body: JSON.stringify({
                dataSource: config.mongoDataSource,
                database: config.mongoDatabaseName,
                collection: config.collectionName,
                filter: {} // Empty filter deletes all
            })
        });

        if (!response.ok) {
            throw new Error('Failed to purge MongoDB collection');
        }
    }
}
