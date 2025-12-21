import type { IDatabaseService, ImportResult } from '../types';
import type { PipelineConfig } from '../../../context/FirebaseContext';

/**
 * AWS Amplify DataStore Service
 * Uses AWS Amplify GraphQL API for data operations
 */
export class AWSAmplifyService implements IDatabaseService {
    async testConnection(config: PipelineConfig): Promise<boolean> {
        if (!config.amplifyApiUrl || !config.amplifyApiKey) {
            return false;
        }

        try {
            // Test connection by performing a simple GraphQL query
            const query = `query ListItems { list${config.collectionName}(limit: 1) { items { id } } }`;

            const response = await fetch(config.amplifyApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': config.amplifyApiKey
                },
                body: JSON.stringify({ query })
            });

            return response.ok;
        } catch (error) {
            console.error('AWS Amplify connection test failed:', error);
            return false;
        }
    }

    async importData(
        data: any[],
        config: PipelineConfig,
        onProgress?: (count: number) => void
    ): Promise<ImportResult> {
        if (!config.amplifyApiUrl || !config.amplifyApiKey) {
            throw new Error('Missing AWS Amplify configuration');
        }

        const BATCH_SIZE = 100; // AWS AppSync batch limit
        let success = 0;
        let failure = 0;
        const errors: any[] = [];

        try {
            const totalBatches = Math.ceil(data.length / BATCH_SIZE);

            for (let i = 0; i < totalBatches; i++) {
                const startIdx = i * BATCH_SIZE;
                const endIdx = Math.min(startIdx + BATCH_SIZE, data.length);
                const chunk = data.slice(startIdx, endIdx);

                try {
                    // Create batch mutation
                    const mutations = chunk.map((item, idx) => {
                        const itemId = `item_${Date.now()}_${startIdx + idx}`;
                        const fields = Object.entries(item)
                            .map(([key, value]) => {
                                if (typeof value === 'string') {
                                    return `${key}: "${value.replace(/"/g, '\\"')}"`;
                                }
                                return `${key}: ${JSON.stringify(value)}`;
                            })
                            .join(', ');

                        return `
                            mutation${idx}: create${config.collectionName}(input: { id: "${itemId}", ${fields} }) {
                                id
                            }
                        `;
                    });

                    const mutation = `mutation BatchCreate { ${mutations.join('\n')} }`;

                    const response = await fetch(config.amplifyApiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': config.amplifyApiKey
                        },
                        body: JSON.stringify({ query: mutation })
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.errors?.[0]?.message || response.statusText);
                    }

                    const result = await response.json();

                    if (result.errors) {
                        throw new Error(result.errors[0].message);
                    }

                    success += chunk.length;
                    if (onProgress) {
                        onProgress(success);
                    }
                } catch (error: any) {
                    failure += chunk.length;
                    errors.push({
                        batch: i + 1,
                        error: error.message,
                        range: `${startIdx}-${endIdx}`
                    });
                }
            }
        } catch (error: any) {
            errors.push({
                error: error.message,
                type: 'general'
            });
        }

        return { success, failure, errors };
    }

    async fetchData(config: PipelineConfig): Promise<any[]> {
        if (!config.amplifyApiUrl || !config.amplifyApiKey) {
            return [];
        }

        try {
            const query = `
                query ListItems {
                    list${config.collectionName}(limit: 100) {
                        items {
                            id
                        }
                    }
                }
            `;

            const response = await fetch(config.amplifyApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': config.amplifyApiKey
                },
                body: JSON.stringify({ query })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data from AWS Amplify');
            }

            const result = await response.json();

            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            return result.data[`list${config.collectionName}`]?.items || [];
        } catch (error: any) {
            console.error('AWS Amplify fetch error:', error);
            throw error;
        }
    }

    async purgeData(config: PipelineConfig): Promise<void> {
        if (!config.amplifyApiUrl || !config.amplifyApiKey) {
            throw new Error('Missing AWS Amplify configuration');
        }

        try {
            // First, fetch all item IDs
            const items = await this.fetchData(config);

            // Delete in batches
            const BATCH_SIZE = 25;
            for (let i = 0; i < items.length; i += BATCH_SIZE) {
                const chunk = items.slice(i, i + BATCH_SIZE);

                const mutations = chunk.map((item: any, idx: number) => `
                    mutation${idx}: delete${config.collectionName}(input: { id: "${item.id}" }) {
                        id
                    }
                `);

                const mutation = `mutation BatchDelete { ${mutations.join('\n')} }`;

                const response = await fetch(config.amplifyApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': config.amplifyApiKey
                    },
                    body: JSON.stringify({ query: mutation })
                });

                if (!response.ok) {
                    throw new Error('Failed to delete batch');
                }
            }
        } catch (error: any) {
            console.error('AWS Amplify purge error:', error);
            throw error;
        }
    }
}
