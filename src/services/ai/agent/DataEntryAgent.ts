/**
 * Data Entry Agent
 * Main AI agent interface for CSV data entry assistance
 */

import type { AIProcessInput, AIProcessOutput, AgentConfig, CollectionSchema } from '../types';
import type { PipelineConfig } from '../../../context/FirebaseContext';
import { AgentRunner } from './AgentRunner';

export class DataEntryAgent {
    private runner: AgentRunner;
    private config: AgentConfig;

    constructor(config: AgentConfig = {}) {
        this.config = config;
        this.runner = new AgentRunner(config);
    }

    /**
     * Main processing method
     * This is the ONLY public method - clean interface
     */
    async process(options: {
        csvHeaders: string[];
        csvRows: any[][];
        sampleRows?: any[][];
        selectedDatabaseProvider: PipelineConfig['provider'];
        targetCollectionName: string;
        collectionSchema?: CollectionSchema;
        pipelineConfig: PipelineConfig;
        autoFix?: boolean;
    }): Promise<AIProcessOutput> {
        // Prepare input for agent
        const input: AIProcessInput = {
            csvHeaders: options.csvHeaders,
            csvRows: options.csvRows,
            sampleRows: options.sampleRows || options.csvRows.slice(0, 10),
            selectedDatabaseProvider: options.selectedDatabaseProvider,
            targetCollectionName: options.targetCollectionName,
            collectionSchema: options.collectionSchema,
            config: options.pipelineConfig
        };

        // Override auto-fix if specified
        if (options.autoFix !== undefined) {
            this.runner.updateConfig({ autoFix: options.autoFix });
        }

        // Execute agent runner
        const result = await this.runner.execute(input);

        return result;
    }

    /**
     * Process with custom schema
     */
    async processWithSchema(
        csvHeaders: string[],
        csvRows: any[][],
        schema: CollectionSchema,
        pipelineConfig: PipelineConfig
    ): Promise<AIProcessOutput> {
        return this.process({
            csvHeaders,
            csvRows,
            selectedDatabaseProvider: pipelineConfig.provider,
            targetCollectionName: pipelineConfig.collectionName,
            collectionSchema: schema,
            pipelineConfig
        });
    }

    /**
     * Quick process with minimal options (auto-infer schema)
     */
    async quickProcess(
        csvHeaders: string[],
        csvRows: any[][],
        pipelineConfig: PipelineConfig
    ): Promise<AIProcessOutput> {
        return this.process({
            csvHeaders,
            csvRows,
            selectedDatabaseProvider: pipelineConfig.provider,
            targetCollectionName: pipelineConfig.collectionName,
            pipelineConfig,
            autoFix: true
        });
    }

    /**
     * Validate-only mode (no fixes)
     */
    async validateOnly(
        csvHeaders: string[],
        csvRows: any[][],
        schema: CollectionSchema,
        pipelineConfig: PipelineConfig
    ): Promise<AIProcessOutput> {
        return this.process({
            csvHeaders,
            csvRows,
            selectedDatabaseProvider: pipelineConfig.provider,
            targetCollectionName: pipelineConfig.collectionName,
            collectionSchema: schema,
            pipelineConfig,
            autoFix: false
        });
    }

    /**
     * Update agent configuration
     */
    updateConfig(newConfig: Partial<AgentConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.runner.updateConfig(newConfig);
    }

    /**
     * Get agent status/config
     */
    getConfig(): AgentConfig {
        return { ...this.config };
    }

    /**
     * Static factory method
     */
    static create(config?: AgentConfig): DataEntryAgent {
        return new DataEntryAgent(config);
    }
}
