import type { IDatabaseService, ImportResult } from '../types';
import type { PipelineConfig } from '../../../context/FirebaseContext';

export class AppwriteService implements IDatabaseService {
    private getHeaders(config: PipelineConfig) {
        return {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': config.appwriteProjectId || '',
            // Assuming Client usage, we don't send API Key usually in browser unless it's a "Server SDK" context.
            // But if this is an Admin tool, maybe we do. 
            // However, Appwrite REST API allows Client integration.
            // If the user wants to use an API Key (server-side), it shouldn't be exposed in client code.
            // But this IS a client-side app.
            // We will assume the collection has "Role: Any" or "Role: User" permissions setup.
        };
    }

    async testConnection(config: PipelineConfig): Promise<boolean> {
        if (!config.appwriteEndpoint || !config.appwriteProjectId || !config.appwriteDatabaseId || !config.collectionName) return false;

        try {
            // Try to list documents (limit 1) to test access
            const response = await fetch(
                `${config.appwriteEndpoint}/databases/${config.appwriteDatabaseId}/collections/${config.collectionName}/documents?queries[]=limit(1)`,
                {
                    method: 'GET',
                    headers: this.getHeaders(config)
                }
            );
            return response.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async importData(data: any[], config: PipelineConfig, onProgress?: (count: number) => void): Promise<ImportResult> {
        if (!config.appwriteEndpoint) throw new Error("Missing Appwrite Config");

        // Appwrite Create Document API usually takes 1 document at a time unless using a function.
        // We will run in parallel promises with concurrency limit to simulation batching.
        const CONCURRENCY = 5;
        let success = 0;
        let failure = 0;
        const errors: any[] = [];

        // Helper for running pool
        async function uploadDoc(row: any) {
            try {
                const response = await fetch(
                    `${config.appwriteEndpoint}/databases/${config.appwriteDatabaseId}/collections/${config.collectionName}/documents`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Appwrite-Project': config.appwriteProjectId || ''
                        },
                        body: JSON.stringify({
                            documentId: 'unique()', // Appwrite ID generation
                            data: row
                        })
                    }
                );

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message);
                }
                return true;
            } catch (e: any) {
                throw e;
            }
        }

        // Simple chunking execution used for clarity (not true parallelism but safe)
        for (let i = 0; i < data.length; i += CONCURRENCY) {
            const chunk = data.slice(i, i + CONCURRENCY);
            const results = await Promise.allSettled(chunk.map((item) => uploadDoc(item)));

            results.forEach((res, idx) => {
                if (res.status === 'fulfilled') {
                    success++;
                } else {
                    failure++;
                    errors.push({ row: i + idx, error: res.reason?.message });
                }
            });

            if (onProgress) onProgress(success);
        }

        return { success, failure, errors };
    }

    async fetchData(config: PipelineConfig): Promise<any[]> {
        if (!config.appwriteEndpoint) return [];

        const response = await fetch(
            `${config.appwriteEndpoint}/databases/${config.appwriteDatabaseId}/collections/${config.collectionName}/documents?queries[]=limit(100)`,
            {
                method: 'GET',
                headers: this.getHeaders(config)
            }
        );

        if (!response.ok) throw new Error("Failed to fetch Appwrite data");
        const json = await response.json();
        return json.documents || [];
    }

    async purgeData(config: PipelineConfig): Promise<void> {
        if (!config.appwriteEndpoint || !config.appwriteProjectId || !config.appwriteDatabaseId) {
            throw new Error('Missing Appwrite configuration');
        }

        // Appwrite requires deleting documents one by one or using a server function
        // First, fetch all document IDs
        const documents = await this.fetchData(config);

        // Delete in parallel with concurrency limit
        const CONCURRENCY = 10;
        for (let i = 0; i < documents.length; i += CONCURRENCY) {
            const chunk = documents.slice(i, i + CONCURRENCY);
            const promises = chunk.map(doc =>
                fetch(
                    `${config.appwriteEndpoint}/databases/${config.appwriteDatabaseId}/collections/${config.collectionName}/documents/${doc.$id}`,
                    {
                        method: 'DELETE',
                        headers: this.getHeaders(config)
                    }
                )
            );
            await Promise.allSettled(promises);
        }
    }
}
