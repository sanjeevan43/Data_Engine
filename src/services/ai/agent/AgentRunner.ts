/**
 * Agent Runner
 * Orchestrates the execution of AI tools in sequence
 */

import type { AIProcessInput, AIProcessOutput, AgentConfig } from '../types';
import { AnalyzeCsvTool } from '../tools/analyzeCsvTool';
import { SchemaTool } from '../tools/schemaTool';
import { MapFieldsTool } from '../tools/mapFieldsTool';
import { ValidateDataTool } from '../tools/validateDataTool';
import { FixDataTool } from '../tools/fixDataTool';

export class AgentRunner {
    private config: AgentConfig;

    constructor(config: AgentConfig = {}) {
        this.config = {
            maxRetries: config.maxRetries || 3,
            timeout: config.timeout || 30000,
            autoFix: config.autoFix !== undefined ? config.autoFix : true,
            strictValidation: config.strictValidation || false,
            llm: config.llm
        };
    }

    /**
     * Main orchestration method
     * Runs all tools in sequence and returns final result
     */
    async execute(input: AIProcessInput): Promise<AIProcessOutput> {
        try {
            console.log('[Agent] Starting AI-assisted data entry process...');

            // Step 1: Analyze CSV structure
            console.log('[Agent] Step 1: Analyzing CSV structure...');
            const analysisResult = AnalyzeCsvTool.analyze(
                input.csvHeaders,
                input.sampleRows
            );

            // Step 2: Infer or use provided schema
            console.log('[Agent] Step 2: Processing schema...');
            let schema = input.collectionSchema;
            if (!schema) {
                schema = SchemaTool.inferSchema(
                    input.csvHeaders,
                    input.sampleRows,
                    analysisResult.detectedTypes
                );
                console.log('[Agent] Schema inferred from CSV data');
            } else {
                // Validate provided schema
                const schemaValidation = SchemaTool.validateSchema(schema);
                if (!schemaValidation.isValid) {
                    throw new Error(`Invalid schema: ${schemaValidation.errors.join(', ')}`);
                }
                console.log('[Agent] Using provided schema');
            }

            // Step 3: Create field mapping
            console.log('[Agent] Step 3: Creating field mappings...');
            const mappingResult = MapFieldsTool.createMapping(
                input.csvHeaders,
                schema,
                input.selectedDatabaseProvider
            );

            // Step 4: Transform CSV data using mapping
            console.log('[Agent] Step 4: Transforming data...');
            const transformedData = this.transformCsvData(
                input.csvRows,
                input.csvHeaders,
                mappingResult.mapping
            );

            // Step 5: Validate data
            console.log('[Agent] Step 5: Validating data...');
            const validationResult = ValidateDataTool.validate(
                transformedData,
                schema
            );

            // Step 6: Fix issues (if auto-fix enabled)
            console.log('[Agent] Step 6: Fixing data issues...');
            let finalData = transformedData;
            let transformations: any[] = [];
            let unfixableErrors = validationResult.errors;

            if (this.config.autoFix) {
                const fixResult = FixDataTool.fix(transformedData, validationResult.errors);
                finalData = fixResult.fixedData;
                transformations = fixResult.transformations;
                unfixableErrors = fixResult.unfixableErrors;

                console.log(`[Agent] Applied ${transformations.length} transformations`);
                console.log(`[Agent] ${unfixableErrors.length} unfixable errors remaining`);
            }


            // Step 7: Data is ready (no extra metadata needed)
            // The hook will add _fileName and _uploadedAt when importing


            // Calculate final stats
            const stats = {
                totalRows: input.csvRows.length,
                validRows: validationResult.validRowCount,
                invalidRows: unfixableErrors.filter(e => e.severity === 'error').length,
                fieldsProcessed: input.csvHeaders.length,
                transformationsApplied: transformations.length,
                duplicatesRemoved: transformations.filter(t => t.operation === 'remove-duplicate').length
            };

            // Compile suggestions
            const suggestions = [
                ...analysisResult.recommendations,
                ...mappingResult.suggestions,
                ...validationResult.warnings
            ];

            console.log('[Agent] Process complete!');
            console.log(`[Agent] Stats: ${stats.validRows}/${stats.totalRows} valid rows`);

            return {
                mapping: mappingResult.mapping,
                cleanedData: finalData,
                errors: unfixableErrors,
                warnings: validationResult.warnings,
                stats,
                suggestions
            };

        } catch (error) {
            console.error('[Agent] Process failed:', error);
            throw new Error(`AI Agent failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Transform CSV data array to mapped objects
     */
    private transformCsvData(
        rows: any[][],
        headers: string[],
        mapping: Record<string, string>
    ): Array<Record<string, any>> {
        return rows.map(row => {
            const obj: Record<string, any> = {};

            headers.forEach((header, index) => {
                const mappedField = mapping[header];
                if (mappedField) {
                    obj[mappedField] = row[index];
                }
            });

            return obj;
        });
    }

    /**
     * Update agent configuration
     */
    updateConfig(config: Partial<AgentConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get current configuration
     */
    getConfig(): AgentConfig {
        return { ...this.config };
    }
}
