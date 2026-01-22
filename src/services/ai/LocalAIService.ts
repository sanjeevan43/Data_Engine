/**
 * Local AI Service - No API Key Required!
 * Uses browser-based AI models via @xenova/transformers
 * Completely free, runs locally, no external API calls
 */

import { pipeline, Pipeline } from '@xenova/transformers';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export class LocalAIService {
    private static embedder: Pipeline | null = null;
    private static initialized = false;
    private static initPromise: Promise<void> | null = null;

    /**
     * Initialize the local AI models (runs in browser)
     * This downloads models once and caches them
     */
    static async initialize(): Promise<void> {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            try {
                console.log('🤖 Loading local AI models (this may take a moment on first load)...');

                // Use a lightweight embedding model for semantic understanding
                this.embedder = await pipeline(
                    'feature-extraction',
                    'Xenova/all-MiniLM-L6-v2',
                    { quantized: true } // Use quantized model for faster loading
                );

                this.initialized = true;
                console.log('✅ Local AI models loaded successfully!');
            } catch (error) {
                console.error('❌ Failed to load local AI models:', error);
                this.initialized = false;
            }
        })();

        return this.initPromise;
    }

    static isAvailable(): boolean {
        return this.initialized && this.embedder !== null;
    }

    /**
     * Analyze CSV data using local AI
     */
    static async analyzeCsvData(
        csvHeaders: string[],
        sampleRows: any[][]
    ): Promise<{
        recommendations: string[];
        suggestedPrimaryKeys: string[];
        suggestedDataTypes: Record<string, string>;
        insights: string[];
    }> {
        await this.initialize();

        const recommendations: string[] = [];
        const suggestedPrimaryKeys: string[] = [];
        const suggestedDataTypes: Record<string, string> = {};
        const insights: string[] = [];

        // Analyze each column
        for (let i = 0; i < csvHeaders.length; i++) {
            const header = csvHeaders[i];
            const columnValues = sampleRows.map(row => row[i]);

            // Detect data type
            const dataType = this.detectDataType(columnValues);
            suggestedDataTypes[header] = dataType;

            // Check for potential primary key
            const uniqueValues = new Set(columnValues.filter(v => v !== null && v !== undefined && v !== ''));
            const uniquePercentage = (uniqueValues.size / columnValues.length) * 100;

            if (uniquePercentage === 100 && columnValues.length > 0) {
                suggestedPrimaryKeys.push(header);
                recommendations.push(`✅ "${header}" has 100% unique values - excellent primary key candidate`);
            }

            // Check for missing values
            const nullCount = columnValues.filter(v => v === null || v === undefined || v === '').length;
            const nullPercentage = (nullCount / columnValues.length) * 100;

            if (nullPercentage > 50) {
                insights.push(`⚠️ "${header}" has ${nullPercentage.toFixed(0)}% missing values`);
            }

            // Data type specific insights
            if (dataType === 'email') {
                insights.push(`📧 "${header}" detected as email field - validation recommended`);
            } else if (dataType === 'date') {
                insights.push(`📅 "${header}" detected as date field - format standardization recommended`);
            } else if (dataType === 'number') {
                const numbers = columnValues.filter(v => !isNaN(Number(v))).map(Number);
                if (numbers.length > 0) {
                    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
                    insights.push(`🔢 "${header}" average value: ${avg.toFixed(2)}`);
                }
            }
        }

        // General recommendations
        if (suggestedPrimaryKeys.length === 0) {
            recommendations.push('⚠️ No obvious primary key found. Consider adding a unique ID column.');
        } else if (suggestedPrimaryKeys.length > 1) {
            recommendations.push(`🔑 Multiple primary key candidates found: ${suggestedPrimaryKeys.join(', ')}`);
        }

        recommendations.push(`📊 Analyzed ${csvHeaders.length} columns with ${sampleRows.length} sample rows`);

        return {
            recommendations,
            suggestedPrimaryKeys,
            suggestedDataTypes,
            insights
        };
    }

    /**
     * Chat with local AI (rule-based + semantic understanding)
     */
    static async chat(
        messages: ChatMessage[],
        context?: {
            csvHeaders?: string[];
            sampleRows?: any[][];
            currentMapping?: Record<string, string>;
        }
    ): Promise<string> {
        await this.initialize();

        const lastMessage = messages[messages.length - 1];
        const userQuestion = lastMessage.content.toLowerCase();

        // Analyze CSV request
        if (userQuestion.includes('analyze') && context?.csvHeaders && context?.sampleRows) {
            const analysis = await this.analyzeCsvData(context.csvHeaders, context.sampleRows);

            let response = '📊 **CSV Analysis Complete!**\n\n';
            response += `**Columns Found:** ${context.csvHeaders.length}\n`;
            response += `**Sample Rows:** ${context.sampleRows.length}\n\n`;

            if (analysis.suggestedPrimaryKeys.length > 0) {
                response += `🔑 **Recommended Primary Key:** ${analysis.suggestedPrimaryKeys[0]}\n\n`;
            }

            if (analysis.insights.length > 0) {
                response += '**Insights:**\n';
                analysis.insights.forEach(insight => {
                    response += `• ${insight}\n`;
                });
                response += '\n';
            }

            if (analysis.recommendations.length > 0) {
                response += '**Recommendations:**\n';
                analysis.recommendations.forEach(rec => {
                    response += `• ${rec}\n`;
                });
            }

            return response;
        }

        // Primary key question
        if (userQuestion.includes('primary key')) {
            if (!context?.csvHeaders || context.csvHeaders.length === 0) {
                return '⚠️ Please upload a CSV file first so I can analyze which field would make a good primary key.';
            }

            const idFields = context.csvHeaders.filter(h =>
                h.toLowerCase().includes('id') ||
                h.toLowerCase() === 'email' ||
                h.toLowerCase().includes('username') ||
                h.toLowerCase().includes('uuid')
            );

            if (idFields.length > 0) {
                let response = `🔑 **Primary Key Recommendation**\n\n`;
                response += `I recommend using **"${idFields[0]}"** as your primary key.\n\n`;
                response += `**Why?**\n`;
                response += `• Field name suggests it's a unique identifier\n`;
                response += `• Primary keys must be unique for each record\n`;
                response += `• Should never be empty or change\n\n`;

                if (idFields.length > 1) {
                    response += `**Other candidates:** ${idFields.slice(1).join(', ')}`;
                }

                return response;
            }

            return `🔍 **No obvious primary key found**\n\nYour fields: ${context.csvHeaders.join(', ')}\n\nFor a primary key, choose a field that:\n✅ Has unique values for each row\n✅ Never changes\n✅ Is never empty\n\nCommon examples: user_id, email, username, product_id`;
        }

        // Data type question
        if (userQuestion.includes('data type') || userQuestion.includes('type')) {
            return `📊 **Data Type Guide**\n\n` +
                `📝 **String** - Text data (names, descriptions)\n` +
                `🔢 **Number** - Numeric values (age, price, quantity)\n` +
                `✅ **Boolean** - True/false values\n` +
                `📅 **Date** - Date and time values\n` +
                `📧 **Email** - Email addresses\n` +
                `🔗 **URL** - Web links\n\n` +
                `I can automatically detect data types when you upload a CSV!`;
        }

        // Import help
        if (userQuestion.includes('import') || userQuestion.includes('how')) {
            return `📤 **How to Import Your Data**\n\n` +
                `1️⃣ Upload your CSV file\n` +
                `2️⃣ I'll analyze it automatically\n` +
                `3️⃣ Review the field mappings\n` +
                `4️⃣ Click "Import Data to Database"\n\n` +
                `**Current Status:**\n` +
                `• CSV loaded: ${context?.csvHeaders && context.csvHeaders.length > 0 ? '✅' : '❌'}\n` +
                `• Fields detected: ${context?.csvHeaders?.length || 0}\n` +
                `• Ready to import: ${context?.csvHeaders && context.csvHeaders.length > 0 ? '✅' : '⚠️'}`;
        }

        // Field-specific question
        if (context?.csvHeaders) {
            const mentionedField = context.csvHeaders.find(h =>
                userQuestion.includes(h.toLowerCase())
            );

            if (mentionedField) {
                const dataType = this.guessDataTypeFromName(mentionedField);
                return `📋 **Field: "${mentionedField}"**\n\n` +
                    `**Recommended Type:** ${dataType}\n` +
                    `**Reason:** Based on the field name pattern\n\n` +
                    `Upload your CSV for more accurate analysis!`;
            }
        }

        // Help/general
        if (userQuestion.includes('help') || userQuestion.includes('what can')) {
            return `🤖 **I'm your Local AI Assistant!**\n\n` +
                `I run completely in your browser - no API keys needed!\n\n` +
                `**I can help you with:**\n\n` +
                `🔍 **"Analyze my CSV"** - Full data analysis\n` +
                `🔑 **"What should be the primary key?"** - Key recommendations\n` +
                `📊 **"What data type for [field]?"** - Type suggestions\n` +
                `📤 **"How do I import?"** - Step-by-step guide\n\n` +
                `**Privacy:** All processing happens locally in your browser. Your data never leaves your computer!`;
        }

        // Default response
        return `I'm here to help! Try asking:\n\n` +
            `• "Analyze my CSV"\n` +
            `• "Which field should be the primary key?"\n` +
            `• "How do I import my data?"\n` +
            `• "Help"\n\n` +
            `💡 **Tip:** I'm a local AI running in your browser - no API keys needed!`;
    }

    /**
     * Suggest field mapping using semantic similarity
     */
    static async suggestFieldMapping(
        csvHeaders: string[],
        schemaFields: string[]
    ): Promise<Record<string, { field: string; confidence: number; reason: string }>> {
        await this.initialize();

        const mappings: Record<string, { field: string; confidence: number; reason: string }> = {};

        for (const csvHeader of csvHeaders) {
            let bestMatch = { field: '', confidence: 0, reason: '' };

            for (const schemaField of schemaFields) {
                const similarity = await this.calculateSimilarity(csvHeader, schemaField);

                if (similarity > bestMatch.confidence) {
                    let reason = 'semantic similarity';
                    if (similarity > 0.95) reason = 'exact match';
                    else if (similarity > 0.8) reason = 'strong match';
                    else if (similarity > 0.6) reason = 'partial match';

                    bestMatch = { field: schemaField, confidence: similarity, reason };
                }
            }

            if (bestMatch.confidence > 0.5) {
                mappings[csvHeader] = bestMatch;
            }
        }

        return mappings;
    }

    /**
     * Calculate semantic similarity between two strings
     */
    private static async calculateSimilarity(text1: string, text2: string): Promise<number> {
        if (!this.embedder) {
            // Fallback to simple string similarity
            return this.simpleSimilarity(text1, text2);
        }

        try {
            const [emb1, emb2] = await Promise.all([
                this.getEmbedding(text1),
                this.getEmbedding(text2)
            ]);

            if (emb1.length === 0 || emb2.length === 0) {
                return this.simpleSimilarity(text1, text2);
            }

            // Cosine similarity
            let dot = 0;
            let normA = 0;
            let normB = 0;

            for (let i = 0; i < emb1.length; i++) {
                dot += emb1[i] * emb2[i];
                normA += emb1[i] * emb1[i];
                normB += emb2[i] * emb2[i];
            }

            return dot / (Math.sqrt(normA) * Math.sqrt(normB));
        } catch (error) {
            return this.simpleSimilarity(text1, text2);
        }
    }

    /**
     * Get embedding vector for text
     */
    private static async getEmbedding(text: string): Promise<number[]> {
        if (!this.embedder) return [];

        try {
            const result = await this.embedder(text, { pooling: 'mean', normalize: true });
            return Array.from(result.data as Float32Array);
        } catch (error) {
            return [];
        }
    }

    /**
     * Simple string similarity (fallback)
     */
    private static simpleSimilarity(str1: string, str2: string): number {
        const a = str1.toLowerCase().trim();
        const b = str2.toLowerCase().trim();

        if (a === b) return 1.0;
        if (a.includes(b) || b.includes(a)) return 0.85;

        // Levenshtein distance
        const matrix: number[][] = [];
        for (let i = 0; i <= a.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= b.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                if (a[i - 1] === b[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        const distance = matrix[a.length][b.length];
        const maxLen = Math.max(a.length, b.length);
        return 1 - distance / maxLen;
    }

    /**
     * Detect data type from values
     */
    private static detectDataType(values: any[]): string {
        const validValues = values.filter(v =>
            v !== null && v !== undefined && String(v).trim() !== ''
        );

        if (validValues.length === 0) return 'string';

        // Email pattern
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (validValues.every(v => emailPattern.test(String(v)))) {
            return 'email';
        }

        // URL pattern
        const urlPattern = /^https?:\/\//;
        if (validValues.every(v => urlPattern.test(String(v)))) {
            return 'url';
        }

        // Boolean pattern
        const boolPattern = /^(true|false|yes|no|0|1)$/i;
        if (validValues.every(v => boolPattern.test(String(v)))) {
            return 'boolean';
        }

        // Number pattern
        const numberPattern = /^-?\d+\.?\d*$/;
        if (validValues.every(v => numberPattern.test(String(v).replace(/[,$]/g, '')))) {
            return 'number';
        }

        // Date pattern
        const datePattern = /^\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}/;
        if (validValues.some(v => datePattern.test(String(v)))) {
            return 'date';
        }

        return 'string';
    }

    /**
     * Guess data type from field name
     */
    private static guessDataTypeFromName(fieldName: string): string {
        const lower = fieldName.toLowerCase();

        if (lower.includes('email') || lower.includes('mail')) return 'email';
        if (lower.includes('url') || lower.includes('website') || lower.includes('link')) return 'url';
        if (lower.includes('date') || lower.includes('time') || lower.includes('created') || lower.includes('updated')) return 'date';
        if (lower.includes('age') || lower.includes('price') || lower.includes('amount') || lower.includes('quantity') || lower.includes('count')) return 'number';
        if (lower.includes('active') || lower.includes('enabled') || lower.includes('verified') || lower.includes('is_')) return 'boolean';

        return 'string';
    }
}
