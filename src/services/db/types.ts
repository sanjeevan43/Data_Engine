import type { PipelineConfig } from '../../context/FirebaseContext';

export interface ImportResult {
    success: number;
    failure: number;
    errors: any[];
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface DatabaseRecord {
    id: string;
    [key: string]: any;
}

export interface IDatabaseService {
    /**
     * Test the connection using the provided configuration.
     */
    testConnection(config: PipelineConfig): Promise<boolean>;

    /**
     * Batch import data into the target database.
     */
    importData(
        data: any[],
        config: PipelineConfig,
        onProgress?: (count: number) => void
    ): Promise<ImportResult>;

    /**
     * Fetch recent data from the collection/table to show in the grid.
     */
    fetchData(config: PipelineConfig): Promise<any[]>;

    /**
     * Purge/delete all data from the collection/table
     */
    purgeData?(config: PipelineConfig): Promise<void>;
}
