/**
 * AI Service Layer - Main Exports
 * 
 * This module provides AI-assisted data entry capabilities
 * for the CSV import system.
 * 
 * @example
 * ```typescript
 * import { DataEntryAgent } from './services/ai';
 * 
 * const agent = DataEntryAgent.create();
 * const result = await agent.quickProcess(headers, rows, config);
 * 
 * // Use result.cleanedData with DataManager.importData()
 * await DataManager.importData(result.cleanedData, config);
 * ```
 */

// Main Agent
export { DataEntryAgent } from './agent/DataEntryAgent';
export { AgentRunner } from './agent/AgentRunner';

// Tools
export { AnalyzeCsvTool } from './tools/analyzeCsvTool';
export { MapFieldsTool } from './tools/mapFieldsTool';
export { ValidateDataTool } from './tools/validateDataTool';
export { FixDataTool } from './tools/fixDataTool';
export { SchemaTool } from './tools/schemaTool';

// Types
export type {
    AIProcessInput,
    AIProcessOutput,
    AgentConfig,
    CollectionSchema,
    SchemaField,
    DataError,
    ProcessStats,
    AnalysisResult,
    MappingResult,
    ValidationResult,
    FixResult,
    Transformation,
    LLMConfig
} from './types';

// Prompts (for advanced users)
export { SYSTEM_PROMPT, CRITICAL_RULES } from './prompts/system.prompt';
export { getMappingPrompt } from './prompts/mapping.prompt';
export { getValidationPrompt } from './prompts/validation.prompt';
