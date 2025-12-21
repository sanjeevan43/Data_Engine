import type { IDatabaseService, ImportResult } from '../types';
import type { PipelineConfig } from '../../../context/FirebaseContext';

export class SupabaseService implements IDatabaseService {
    async testConnection(config: PipelineConfig): Promise<boolean> {
        if (!config.supabaseUrl || !config.supabaseAnonKey) return false;

        try {
            const response = await fetch(`${config.supabaseUrl}/rest/v1/${config.collectionName}?select=count`, {
                method: 'HEAD',
                headers: {
                    'apikey': config.supabaseAnonKey,
                    'Authorization': `Bearer ${config.supabaseAnonKey}`
                }
            });
            // 200-299 OK, 401 Unauthorized, 404 Table not found (which means auth worked but table invalid)
            // If 401, definitely failed. If 404, connection is okay but config is bad? 
            // Strict test: must be OK.
            return response.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async importData(data: any[], config: PipelineConfig, onProgress?: (count: number) => void): Promise<ImportResult> {
        if (!config.supabaseUrl || !config.supabaseAnonKey) {
            throw new Error("Missing Supabase configuration");
        }

        const BATCH_SIZE = 1000;
        let success = 0;
        let failure = 0;
        const errors: any[] = [];
        const totalChunks = Math.ceil(data.length / BATCH_SIZE);

        for (let i = 0; i < totalChunks; i++) {
            const chunk = data.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

            try {
                const response = await fetch(`${config.supabaseUrl}/rest/v1/${config.collectionName}`, {
                    method: 'POST',
                    headers: {
                        'apikey': config.supabaseAnonKey,
                        'Authorization': `Bearer ${config.supabaseAnonKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal' // Don't return the inserted rows, saves bandwidth
                    },
                    body: JSON.stringify(chunk)
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message || response.statusText);
                }

                success += chunk.length;
                if (onProgress) onProgress(success);
            } catch (err: any) {
                failure += chunk.length;
                errors.push({ batch: i, error: err.message });
            }
        }

        return { success, failure, errors };
    }

    async fetchData(config: PipelineConfig): Promise<any[]> {
        if (!config.supabaseUrl || !config.supabaseAnonKey) return [];

        const response = await fetch(`${config.supabaseUrl}/rest/v1/${config.collectionName}?select=*&limit=100`, {
            method: 'GET',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${config.supabaseAnonKey}`
            }
        });

        if (!response.ok) throw new Error("Failed to fetch data from Supabase");
        return await response.json();
    }

    async purgeData(config: PipelineConfig): Promise<void> {
        if (!config.supabaseUrl || !config.supabaseAnonKey) {
            throw new Error('Missing Supabase configuration');
        }

        const response = await fetch(`${config.supabaseUrl}/rest/v1/${config.collectionName}`, {
            method: 'DELETE',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${config.supabaseAnonKey}`,
                'Prefer': 'return=minimal'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to purge data from Supabase');
        }
    }
}
