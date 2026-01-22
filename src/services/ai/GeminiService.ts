/**
 * Gemini AI Service
 * Real AI integration using Google's Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GenerativeModel } from '@google/generative-ai';

export interface GeminiConfig {
    apiKey: string;
    model?: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AnalysisRequest {
    csvHeaders: string[];
    sampleRows: any[][];
    userQuestion?: string;
}

export class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: GenerativeModel | null = null;
    private initialized = false;
    private config: GeminiConfig;

    constructor(config: GeminiConfig) {
        this.config = config;
        if (config.apiKey) {
            this.initialize();
        }
    }

    private initialize() {
        try {
            this.genAI = new GoogleGenerativeAI(this.config.apiKey);
            this.model = this.genAI.getGenerativeModel({
                model: this.config.model || 'gemini-pro'
            });
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize Gemini:', error);
            this.initialized = false;
        }
    }

    isAvailable(): boolean {
        return this.initialized && this.model !== null;
    }

    /**
     * Analyze CSV data and provide intelligent recommendations
     */
    async analyzeCsvData(request: AnalysisRequest): Promise<{
        recommendations: string[];
        suggestedPrimaryKeys: string[];
        suggestedDataTypes: Record<string, string>;
        insights: string[];
    }> {
        if (!this.isAvailable()) {
            throw new Error('Gemini AI is not available. Please configure your API key.');
        }

        const prompt = this.buildAnalysisPrompt(request);

        try {
            const result = await this.model!.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseAnalysisResponse(text);
        } catch (error) {
            console.error('Gemini analysis failed:', error);
            throw new Error('AI analysis failed. Please try again.');
        }
    }

    /**
     * Chat with AI about data import
     */
    async chat(messages: ChatMessage[], context?: {
        csvHeaders?: string[];
        sampleRows?: any[][];
        currentMapping?: Record<string, string>;
    }): Promise<string> {
        if (!this.isAvailable()) {
            throw new Error('Gemini AI is not available. Please configure your API key.');
        }

        const prompt = this.buildChatPrompt(messages, context);

        try {
            const result = await this.model!.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini chat failed:', error);
            throw new Error('AI chat failed. Please try again.');
        }
    }

    /**
     * Get field mapping suggestions
     */
    async suggestFieldMapping(
        csvHeaders: string[],
        schemaFields: string[]
    ): Promise<Record<string, { field: string; confidence: number; reason: string }>> {
        if (!this.isAvailable()) {
            throw new Error('Gemini AI is not available.');
        }

        const prompt = `You are a data mapping expert. Given these CSV headers and database schema fields, suggest the best mapping.

CSV Headers: ${csvHeaders.join(', ')}
Schema Fields: ${schemaFields.join(', ')}

For each CSV header, suggest:
1. The best matching schema field
2. Confidence score (0-1)
3. Brief reason for the mapping

Return as JSON: { "csvHeader": { "field": "schemaField", "confidence": 0.95, "reason": "exact match" } }`;

        try {
            const result = await this.model!.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return {};
        } catch (error) {
            console.error('Field mapping suggestion failed:', error);
            return {};
        }
    }

    /**
     * Validate data quality
     */
    async validateDataQuality(
        headers: string[],
        sampleRows: any[][]
    ): Promise<{
        issues: Array<{ severity: 'error' | 'warning'; message: string }>;
        suggestions: string[];
    }> {
        if (!this.isAvailable()) {
            return { issues: [], suggestions: [] };
        }

        const prompt = `Analyze this CSV data for quality issues:

Headers: ${headers.join(', ')}
Sample Data (first 5 rows):
${sampleRows.slice(0, 5).map(row => row.join(', ')).join('\n')}

Identify:
1. Data quality issues (missing values, inconsistent formats, etc.)
2. Potential data type mismatches
3. Recommendations for improvement

Return as JSON: { "issues": [{ "severity": "error|warning", "message": "..." }], "suggestions": ["..."] }`;

        try {
            const result = await this.model!.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return { issues: [], suggestions: [] };
        } catch (error) {
            console.error('Data quality validation failed:', error);
            return { issues: [], suggestions: [] };
        }
    }

    private buildAnalysisPrompt(request: AnalysisRequest): string {
        const { csvHeaders, sampleRows, userQuestion } = request;

        return `You are a data analysis expert helping with CSV import to a database.

CSV Headers: ${csvHeaders.join(', ')}
Sample Data (first 5 rows):
${sampleRows.slice(0, 5).map(row => row.join(', ')).join('\n')}

${userQuestion ? `User Question: ${userQuestion}\n` : ''}

Please analyze this data and provide:
1. Recommended primary key field(s) - which field(s) would make good unique identifiers
2. Suggested data types for each field (string, number, date, email, url, boolean)
3. Data quality insights (missing values, patterns, anomalies)
4. General recommendations for successful import

Return as JSON:
{
  "recommendations": ["..."],
  "suggestedPrimaryKeys": ["field1", "field2"],
  "suggestedDataTypes": { "field": "type" },
  "insights": ["..."]
}`;
    }

    private buildChatPrompt(messages: ChatMessage[], context?: any): string {
        let prompt = `You are a helpful AI assistant for CSV data import. You help users understand their data, configure imports, and solve data quality issues.

`;

        if (context?.csvHeaders) {
            prompt += `Current CSV Headers: ${context.csvHeaders.join(', ')}\n`;
        }

        if (context?.sampleRows) {
            prompt += `Sample Data:\n${context.sampleRows.slice(0, 3).map((row: any[]) => row.join(', ')).join('\n')}\n`;
        }

        if (context?.currentMapping) {
            prompt += `Current Mapping: ${JSON.stringify(context.currentMapping)}\n`;
        }

        prompt += '\nConversation:\n';
        messages.forEach(msg => {
            prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });

        return prompt;
    }

    private parseAnalysisResponse(text: string): {
        recommendations: string[];
        suggestedPrimaryKeys: string[];
        suggestedDataTypes: Record<string, string>;
        insights: string[];
    } {
        try {
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error('Failed to parse AI response:', error);
        }

        // Fallback: return empty structure
        return {
            recommendations: ['AI analysis completed. Please review your data manually.'],
            suggestedPrimaryKeys: [],
            suggestedDataTypes: {},
            insights: []
        };
    }

    /**
     * Update API key
     */
    updateApiKey(apiKey: string) {
        this.config.apiKey = apiKey;
        this.initialize();
    }
}

// Singleton instance
let geminiInstance: GeminiService | null = null;

export function getGeminiService(apiKey?: string): GeminiService {
    if (!geminiInstance && apiKey) {
        geminiInstance = new GeminiService({ apiKey });
    } else if (apiKey && geminiInstance) {
        geminiInstance.updateApiKey(apiKey);
    }

    if (!geminiInstance) {
        throw new Error('Gemini service not initialized. Please provide an API key.');
    }

    return geminiInstance;
}
