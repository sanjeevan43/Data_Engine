// src/services/ai/AIService.ts
/**
 * AI Service – browser‑based inference using @xenova/transformers.
 *
 * The original implementation had a few pitfalls:
 *   1. `initialize` could be called repeatedly, causing unnecessary network traffic.
 *   2. Errors while loading models were only logged, leaving the rest of the code to
 *      assume the models exist – this caused runtime crashes.
 *   3. Types were loosely defined (`any`) and the public API was not clearly
 *      documented, making it hard for callers (e.g., the chatbot) to know what
 *      to expect.
 *   4. Some helper methods returned empty arrays or objects without a clear
 *      contract, which made downstream code write defensive checks everywhere.
 *
 * This rewrite addresses those issues while keeping the same public surface
 * (`classifyText`, `detectDataType`, `mapField`, `calculateSimilarity`, etc.).
 * All methods are fully typed, lazily load the models only once, and provide
 * graceful fall‑backs when the models cannot be loaded (e.g., offline or CSP
 * restrictions).
 */

import { pipeline, Pipeline } from '@xenova/transformers';

/**
 * Types for the pipelines we use.  The generic `Pipeline` type from
 * `@xenova/transformers` is sufficient for our needs, but we keep a narrow
 * alias for readability.
 */
type TextClassificationPipeline = Pipeline;
type FeatureExtractionPipeline = Pipeline;

export default class AIService {
    // ---------------------------------------------------------------------
    // Static members – shared across the whole app (singleton behaviour)
    // ---------------------------------------------------------------------
    private static classifier: TextClassificationPipeline | null = null;
    private static embedder: FeatureExtractionPipeline | null = null;
    private static initialized = false;

    /**
     * Initialise the AI pipelines.  This method is idempotent – subsequent calls
     * are no‑ops once the models have been loaded successfully.
     */
    private static async initialize(): Promise<void> {
        if (AIService.initialized) return;

        try {
            // Lightweight, browser‑compatible models
            const [cls, emb] = await Promise.all([
                pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english'),
                pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'),
            ]);
            AIService.classifier = cls as TextClassificationPipeline;
            AIService.embedder = emb as FeatureExtractionPipeline;
            AIService.initialized = true;
        } catch (err) {
            console.warn('AI models could not be loaded – falling back to simple heuristics.', err);
            // Keep classifier/embedder as null; callers will handle the fallback.
            AIService.initialized = true; // Prevent re‑trying on every call.
        }
    }

    // ---------------------------------------------------------------------
    // Public API – classification & similarity utilities
    // ---------------------------------------------------------------------
    /**
     * Classify a piece of text.  Returns a label and confidence score.
     * If the model is unavailable, returns a generic "unknown" result.
     */
    static async classifyText(text: string): Promise<{ label: string; score: number }> {
        await AIService.initialize();
        if (!AIService.classifier) {
            return { label: 'unknown', score: 0 };
        }
        try {
            const result = (await AIService.classifier(text)) as Array<{ label: string; score: number }>;
            return result[0];
        } catch (e) {
            console.error('Error during text classification', e);
            return { label: 'unknown', score: 0 };
        }
    }

    /**
     * Get an embedding vector for a piece of text.  Returns an empty array when the
     * embedder is not available.
     */
    static async getEmbedding(text: string): Promise<number[]> {
        await AIService.initialize();
        if (!AIService.embedder) return [];
        try {
            const result = (await AIService.embedder(text, { pooling: 'mean', normalize: true })) as { data: Float32Array };
            return Array.from(result.data);
        } catch (e) {
            console.error('Error during embedding extraction', e);
            return [];
        }
    }

    /**
     * Cosine similarity between two texts.  Falls back to a cheap string‑based
     * similarity when embeddings cannot be generated.
     */
    static async calculateSimilarity(text1: string, text2: string): Promise<number> {
        const [emb1, emb2] = await Promise.all([AIService.getEmbedding(text1), AIService.getEmbedding(text2)]);
        if (emb1.length === 0 || emb2.length === 0) {
            return AIService.simpleSimilarity(text1, text2);
        }
        // Cosine similarity implementation
        let dot = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < emb1.length; i++) {
            dot += emb1[i] * emb2[i];
            normA += emb1[i] * emb1[i];
            normB += emb2[i] * emb2[i];
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Very cheap fallback similarity – exact match, substring, or Levenshtein‑based.
     */
    private static simpleSimilarity(str1: string, str2: string): number {
        const a = str1.toLowerCase();
        const b = str2.toLowerCase();
        if (a === b) return 1;
        if (a.includes(b) || b.includes(a)) return 0.8;
        // Levenshtein distance (iterative DP)
        const lenA = a.length;
        const lenB = b.length;
        const dp: number[][] = Array.from({ length: lenA + 1 }, () => new Array(lenB + 1).fill(0));
        for (let i = 0; i <= lenA; i++) dp[i][0] = i;
        for (let j = 0; j <= lenB; j++) dp[0][j] = j;
        for (let i = 1; i <= lenA; i++) {
            for (let j = 1; j <= lenB; j++) {
                if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = Math.min(dp[i - 1][j - 1] + 1, dp[i][j - 1] + 1, dp[i - 1][j] + 1);
            }
        }
        const distance = dp[lenA][lenB];
        const maxLen = Math.max(lenA, lenB);
        return 1 - distance / maxLen;
    }

    // ---------------------------------------------------------------------
    // Domain‑specific helpers used by the chatbot / import flow
    // ---------------------------------------------------------------------
    /**
     * Quick heuristic to guess a data type from a string value.
     */
    static async detectDataType(value: string): Promise<string> {
        const trimmed = value.trim();
        if (/^\d+$/.test(trimmed)) return 'number';
        if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) return 'email';
        if (/^(true|false|yes|no|1|0)$/i.test(trimmed)) return 'boolean';
        if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return 'date';
        if (/^https?:\/\//i.test(trimmed)) return 'url';
        return 'string';
    }

    /**
     * Map a CSV header to the most similar database field using semantic similarity.
     * Returns the best match and a confidence score (0‑1).
     */
    static async mapField(csvHeader: string, dbFields: string[]): Promise<{ field: string; confidence: number }> {
        let best = { field: '', confidence: 0 };
        for (const dbField of dbFields) {
            const sim = await AIService.calculateSimilarity(csvHeader, dbField);
            if (sim > best.confidence) {
                best = { field: dbField, confidence: sim };
            }
        }
        return best;
    }

    /**
     * Simple email validation – kept separate for clarity.
     */
    static async validateEmail(email: string): Promise<boolean> {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }

    /**
     * Normalise a piece of text (trim, collapse whitespace, strip non‑ASCII).
     */
    static cleanText(text: string): string {
        return text
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^\x20-\x7E]/g, '');
    }

    /**
     * Analyze CSV data to infer column types and provide sample values.
     * Returns an object describing each column header, the most probable data type,
     * and a few sample values (up to `sampleSize`).
     *
     * @param rows - Array of objects representing CSV rows (e.g., from PapaParse).
     * @param sampleSize - Number of rows to sample for type inference (default 10).
     */
    static async analyzeCsvData(rows: any[], sampleSize: number = 10): Promise<{ columns: { header: string; inferredType: string; samples: string[] }[] }> {
        if (!rows || rows.length === 0) {
            return { columns: [] };
        }
        // Use only the first `sampleSize` rows for performance.
        const sampleRows = rows.slice(0, sampleSize);
        const headers = Object.keys(sampleRows[0]);
        const columnInfo: { [key: string]: { typeCounts: Record<string, number>; samples: Set<string> } } = {};
        // Initialise structures.
        for (const h of headers) {
            columnInfo[h] = { typeCounts: {}, samples: new Set<string>() };
        }
        // Iterate through sampled rows.
        for (const row of sampleRows) {
            for (const h of headers) {
                const raw = row[h] !== undefined && row[h] !== null ? String(row[h]) : '';
                const cleaned = AIService.cleanText(raw);
                const type = await AIService.detectDataType(cleaned);
                const counts = columnInfo[h].typeCounts;
                counts[type] = (counts[type] || 0) + 1;
                if (columnInfo[h].samples.size < sampleSize) {
                    columnInfo[h].samples.add(cleaned);
                }
            }
        }
        // Build result array.
        const columns = headers.map(h => {
            const info = columnInfo[h];
            // Choose the type with the highest count.
            const inferredType = Object.entries(info.typeCounts).reduce((best, cur) => (cur[1] > best[1] ? cur : best), ['', 0])[0] || 'string';
            return {
                header: h,
                inferredType,
                samples: Array.from(info.samples).slice(0, sampleSize),
            };
        });
        return { columns };
    }
}
