import type { IDatabaseService, ImportResult } from '../types';
import type { PipelineConfig } from '../../../context/FirebaseContext';

export class PocketBaseService implements IDatabaseService {
    async testConnection(config: PipelineConfig): Promise<boolean> {
        if (!config.pocketbaseUrl || !config.collectionName) return false;

        try {
            // List records, set limit to 1
            const response = await fetch(`${config.pocketbaseUrl}/api/collections/${config.collectionName}/records?perPage=1`, {
                method: 'GET'
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    async importData(data: any[], config: PipelineConfig, onProgress?: (count: number) => void): Promise<ImportResult> {
        if (!config.pocketbaseUrl) throw new Error("Missing PocketBase URL");

        // PocketBase does not officially support bulk create in one REST call yet (users looping).
        // Similar to Appwrite, we loop.
        const CONCURRENCY = 10;
        let success = 0;
        let failure = 0;
        const errors: any[] = [];

        for (let i = 0; i < data.length; i += CONCURRENCY) {
            const chunk = data.slice(i, i + CONCURRENCY);
            const promises = chunk.map(row =>
                fetch(`${config.pocketbaseUrl}/api/collections/${config.collectionName}/records`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(row)
                }).then(async res => {
                    if (!res.ok) {
                        const err = await res.json();
                        throw new Error(JSON.stringify(err));
                    }
                    return true;
                })
            );

            const results = await Promise.allSettled(promises);
            results.forEach((res, idx) => {
                if (res.status === 'fulfilled') success++;
                else {
                    failure++;
                    errors.push({ row: i + idx, error: res.reason?.message });
                }
            });

            if (onProgress) onProgress(success);
        }

        return { success, failure, errors };
    }

    async fetchData(config: PipelineConfig): Promise<any[]> {
        if (!config.pocketbaseUrl) return [];
        const response = await fetch(`${config.pocketbaseUrl}/api/collections/${config.collectionName}/records?perPage=100&sort=-created`, {
            method: 'GET'
        });
        if (!response.ok) throw new Error("Failed to fetch PocketBase data");
        const json = await response.json();
        return json.items || [];
    }

    async purgeData(config: PipelineConfig): Promise<void> {
        if (!config.pocketbaseUrl) {
            throw new Error('Missing PocketBase URL');
        }

        // Fetch all records first
        const allRecordsResponse = await fetch(
            `${config.pocketbaseUrl}/api/collections/${config.collectionName}/records?perPage=500`,
            { method: 'GET' }
        );

        if (!allRecordsResponse.ok) {
            throw new Error('Failed to fetch records for deletion');
        }

        const json = await allRecordsResponse.json();
        const records = json.items || [];

        // Delete records in parallel with concurrency limit
        const CONCURRENCY = 10;
        for (let i = 0; i < records.length; i += CONCURRENCY) {
            const chunk = records.slice(i, i + CONCURRENCY);
            const promises = chunk.map((record: any) =>
                fetch(
                    `${config.pocketbaseUrl}/api/collections/${config.collectionName}/records/${record.id}`,
                    { method: 'DELETE' }
                )
            );
            await Promise.allSettled(promises);
        }
    }
}
