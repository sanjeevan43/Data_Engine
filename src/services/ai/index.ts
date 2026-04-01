/**
 * AI Service Layer - Modern Exports
 * 
 * This module provides high-performance AI services for 
 * data orchestration, cleaning, and code analysis.
 */

// Core Services
export { GeminiService } from './GeminiService';
export { LocalAIService } from './LocalAIService';

// Agents
export { DataOrchestratorAgent } from './agent/DataOrchestratorAgent';
export { CodeCleanupAgent } from './agent/CodeCleanupAgent';

// Types
export type {
    OrchestrationResult,
    OrchestratedField
} from './agent/DataOrchestratorAgent';

export type {
    LLMConfig,
    AIProcessInput,
    AIProcessOutput
} from './types';
