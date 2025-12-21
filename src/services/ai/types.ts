/**
 * TypeScript types for AI-assisted data entry system
 */

import type { PipelineConfig } from '../../context/FirebaseContext';

/**
 * Input structure for the AI agent
 */
export interface AIProcessInput {
    csvHeaders: string[];
    csvRows: any[][];
    sampleRows: any[][]; // First 5-10 rows for analysis
    selectedDatabaseProvider: PipelineConfig['provider'];
    targetCollectionName: string;
    collectionSchema?: CollectionSchema;
    config: PipelineConfig;
}

/**
 * Database schema definition
 */
export interface CollectionSchema {
    fields: SchemaField[];
    required?: string[];
    uniqueFields?: string[];
}

export interface SchemaField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'array' | 'object';
    required?: boolean;
    unique?: boolean;
    defaultValue?: any;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        maxLength?: number;
        minLength?: number;
    };
}

/**
 * Output structure from the AI agent
 */
export interface AIProcessOutput {
    mapping: Record<string, string>; // csvHeader -> dbField
    cleanedData: Array<Record<string, any>>;
    errors: DataError[];
    warnings: string[];
    stats: ProcessStats;
    suggestions?: string[];
}

export interface DataError {
    row: number;
    field: string;
    message: string;
    severity: 'error' | 'warning';
    originalValue?: any;
    suggestedValue?: any;
}

export interface ProcessStats {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    fieldsProcessed: number;
    transformationsApplied: number;
    duplicatesRemoved: number;
}

/**
 * Tool result types
 */
export interface AnalysisResult {
    headers: string[];
    rowCount: number;
    detectedTypes: Record<string, string>;
    nullCounts: Record<string, number>;
    uniqueValueCounts: Record<string, number>;
    sampleValues: Record<string, any[]>;
    recommendations: string[];
}

export interface MappingResult {
    mapping: Record<string, string>;
    confidence: Record<string, number>; // 0-1 confidence score
    unmappedCsvFields: string[];
    unmappedSchemaFields: string[];
    suggestions: string[];
}

export interface ValidationResult {
    isValid: boolean;
    errors: DataError[];
    warnings: string[];
    validRowCount: number;
    invalidRowCount: number;
}

export interface FixResult {
    fixedData: Array<Record<string, any>>;
    transformations: Transformation[];
    unfixableErrors: DataError[];
}

export interface Transformation {
    row: number;
    field: string;
    operation: string;
    originalValue: any;
    newValue: any;
}

/**
 * LLM Provider configuration
 */
export interface LLMConfig {
    provider: 'gemini' | 'openai' | 'groq' | 'anthropic';
    apiKey: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
    llm?: LLMConfig;
    maxRetries?: number;
    timeout?: number;
    autoFix?: boolean;
    strictValidation?: boolean;
}
