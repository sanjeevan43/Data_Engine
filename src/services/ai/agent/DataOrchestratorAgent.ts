/**
 * Neural Data Orchestrator Agent
 * 
 * An autonomous agent that handles end-to-end data organization, 
 * schema architecting, and cleaning with minimal human intervention.
 */

import { GeminiService } from '../GeminiService';
import { LocalAIService } from '../LocalAIService';
import type { LLMConfig } from '../types';

export interface OrchestrationResult extends OrchestrationProposal {
    cleaningStats: {
        totalCells: number;
        cleanedCells: number;
        actions: string[];
    };
    proposedData: string[][];
}

export interface OrchestrationProposal {
    suggestedTableName: string;
    fields: OrchestratedField[];
    confidence: number;
}

export interface OrchestratedField {
    originalHeader: string;
    suggestedName: string;
    dataType: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url';
    isPrimaryKey: boolean;
    reason: string;
    isCleaned: boolean;
}

export class DataOrchestratorAgent {
    private gemini: GeminiService | null = null;

    constructor(llmConfig?: LLMConfig) {
        if (llmConfig?.apiKey) {
            this.gemini = new GeminiService({
                apiKey: llmConfig.apiKey,
                model: llmConfig.model || 'gemini-pro'
            });
        }
    }

    /**
     * Orchestrate a data import for a single file
     */
    async orchestrate(
        fileName: string,
        headers: string[],
        rows: any[][]
    ): Promise<OrchestrationResult> {
        const sampleRows = rows.slice(0, 10);
        let proposal;

        // 1. Get Neural Schema Proposal
        if (this.gemini) {
            const proposals = await this.gemini.orchestrateDataImport([{
                name: fileName,
                headers,
                sample: sampleRows
            }]);
            
            if (proposals && proposals.length > 0) {
                proposal = proposals[0];
            }
        }

        // 2. Fallback to Local Heuristics if AI fails or is unavailable
        if (!proposal) {
            proposal = this.generateLocalProposal(fileName, headers);
        }

        // 3. Perform Autonomous Data Cleaning
        const result = await this.cleanAndFinalize(headers, rows, proposal);

        return result;
    }

    /**
     * Local heuristics for schema prediction
     */
    private generateLocalProposal(fileName: string, headers: string[]): OrchestrationProposal {
        const suggestedTableName = fileName.split('.')[0]
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('') + 'Registry';

        const fields = headers.map(header => {
            const cleanName = header.replace(/[^a-zA-Z0-9]/g, ' ')
                .split(' ')
                .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join('');

            return {
                originalHeader: header,
                suggestedName: cleanName || 'field',
                dataType: this.inferLocalType(header),
                reason: 'Inferred via local structural analysis',
                isPrimaryKey: header.toLowerCase().includes('id') || header.toLowerCase() === 'uuid'
            };
        });

        // Ensure at least one primary key
        if (!fields.some(f => f.isPrimaryKey)) {
            fields[0].isPrimaryKey = true;
        }

        return {
            suggestedTableName,
            fields,
            confidence: 0.7
        };
    }

    /**
     * Deep cleaning and alignment
     */
    private async cleanAndFinalize(
        headers: string[],
        rows: string[][],
        proposal: OrchestrationProposal
    ): Promise<OrchestrationResult> {
        const cleanedRows: any[][] = [];
        let cleanedCount = 0;
        const actions: Set<string> = new Set();

        // Map column indices by original header
        const headerToIndex = new Map(headers.map((h, i) => [h, i]));

        for (const row of rows) {
            const cleanedRow = [...row];
            
            proposal.fields.forEach((field: OrchestratedField) => {
                const index = headerToIndex.get(field.originalHeader);
                if (index !== undefined) {
                    const originalValue = row[index];
                    const newValue = LocalAIService.normalizeValue(originalValue, field.dataType);
                    
                    if (originalValue !== newValue) {
                        cleanedRow[index] = newValue;
                        cleanedCount++;
                        actions.add(`Standardized ${field.dataType} field: ${field.suggestedName}`);
                    }
                }
            });

            cleanedRows.push(cleanedRow);
        }

        return {
            suggestedTableName: proposal.suggestedTableName,
            fields: (proposal.fields as OrchestratedField[]).map((f: OrchestratedField) => ({
                ...f,
                isCleaned: true
            })),
            cleaningStats: {
                totalCells: rows.length * headers.length,
                cleanedCells: cleanedCount,
                actions: Array.from(actions)
            },
            confidence: proposal.confidence,
            proposedData: cleanedRows as string[][]
        };
    }

    private inferLocalType(header: string): any {
        // Just a helper to map between concepts
        const lower = header.toLowerCase();
        if (lower.includes('email')) return 'email';
        if (lower.includes('date') || lower.includes('time')) return 'date';
        if (lower.includes('price') || lower.includes('amount')) return 'number';
        return 'string';
    }
}
