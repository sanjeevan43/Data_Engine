/**
 * Field Mapping Tool
 * Intelligently maps CSV headers to database schema fields
 */

import type { MappingResult, CollectionSchema } from '../types';

export class MapFieldsTool {
    /**
     * Create intelligent mapping between CSV headers and schema fields
     */
    static createMapping(
        csvHeaders: string[],
        schema: CollectionSchema | undefined,
        provider: string
    ): MappingResult {
        // If no schema provided, create simple normalized mapping
        if (!schema || schema.fields.length === 0) {
            return this.createDefaultMapping(csvHeaders);
        }

        const schemaFieldNames = schema.fields.map(f => f.name);
        const mapping: Record<string, string> = {};
        const confidence: Record<string, number> = {};
        const unmappedCsvFields: string[] = [];
        const unmappedSchemaFields = new Set(schemaFieldNames);
        const suggestions: string[] = [];

        csvHeaders.forEach(csvHeader => {
            const result = this.findBestMatch(csvHeader, schemaFieldNames);

            if (result.match) {
                mapping[csvHeader] = result.match;
                confidence[csvHeader] = result.confidence;
                unmappedSchemaFields.delete(result.match);

                if (result.confidence < 0.8) {
                    suggestions.push(
                        `Mapped "${csvHeader}" → "${result.match}" with ${(result.confidence * 100).toFixed(0)}% confidence - please review`
                    );
                }
            } else {
                unmappedCsvFields.push(csvHeader);
                suggestions.push(
                    `No schema match found for CSV field "${csvHeader}" - will be ignored unless manually mapped`
                );
            }
        });

        // Report unmapped schema fields
        unmappedSchemaFields.forEach(field => {
            const requiredField = schema.fields.find(f => f.name === field && f.required);
            if (requiredField) {
                suggestions.push(
                    `⚠️ Required schema field "${field}" has no CSV mapping - import may fail`
                );
            }
        });

        return {
            mapping,
            confidence,
            unmappedCsvFields,
            unmappedSchemaFields: Array.from(unmappedSchemaFields),
            suggestions
        };
    }

    /**
     * Find best matching schema field for a CSV header
     */
    private static findBestMatch(
        csvHeader: string,
        schemaFields: string[]
    ): { match: string | null; confidence: number } {
        const normalized = this.normalizeFieldName(csvHeader);

        // 1. Exact match (case-insensitive)
        const exactMatch = schemaFields.find(
            f => this.normalizeFieldName(f) === normalized
        );
        if (exactMatch) {
            return { match: exactMatch, confidence: 1.0 };
        }

        // 2. Common variations
        const variations = this.getFieldVariations(normalized);
        for (const variation of variations) {
            const match = schemaFields.find(
                f => this.normalizeFieldName(f) === variation
            );
            if (match) {
                return { match, confidence: 0.9 };
            }
        }

        // 3. Semantic similarity
        const semanticMatch = this.findSemanticMatch(normalized, schemaFields);
        if (semanticMatch) {
            return semanticMatch;
        }

        // 4. Partial match
        const partialMatch = schemaFields.find(
            f => this.normalizeFieldName(f).includes(normalized) ||
                normalized.includes(this.normalizeFieldName(f))
        );
        if (partialMatch) {
            return { match: partialMatch, confidence: 0.6 };
        }

        return { match: null, confidence: 0 };
    }

    /**
     * Normalize field name for comparison
     */
    private static normalizeFieldName(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_+|_+$/g, '');
    }

    /**
     * Generate common variations of a field name
     */
    private static getFieldVariations(normalized: string): string[] {
        const variations: string[] = [];

        // Common suffixes/prefixes
        const patterns = [
            (n: string) => `user_${n}`,
            (n: string) => `${n}_address`,
            (n: string) => `${n}_number`,
            (n: string) => `${n}_id`,
            (n: string) => `customer_${n}`,
        ];

        patterns.forEach(pattern => {
            variations.push(this.normalizeFieldName(pattern(normalized)));
        });

        return variations;
    }

    /**
     * Find semantic match using common synonyms
     */
    private static findSemanticMatch(
        normalized: string,
        schemaFields: string[]
    ): { match: string; confidence: number } | null {
        const synonymMap: Record<string, string[]> = {
            'email': ['email_address', 'user_email', 'mail', 'email_addr'],
            'phone': ['mobile', 'telephone', 'phone_number', 'contact', 'tel', 'cell'],
            'name': ['full_name', 'user_name', 'customer_name', 'display_name'],
            'address': ['street', 'location', 'addr', 'street_address'],
            'dob': ['birth_date', 'date_of_birth', 'birthday', 'birthdate'],
            'id': ['user_id', 'customer_id', 'identifier', 'uid'],
            'zip': ['postal_code', 'zipcode', 'postcode'],
            'company': ['organization', 'org', 'business', 'employer'],
            'status': ['state', 'condition', 'active'],
            'created': ['created_at', 'creation_date', 'date_created'],
            'updated': ['updated_at', 'modified', 'last_modified'],
        };

        for (const [key, synonyms] of Object.entries(synonymMap)) {
            if (normalized === key || synonyms.some(s => this.normalizeFieldName(s) === normalized)) {
                const allOptions = [key, ...synonyms];
                const match = schemaFields.find(f =>
                    allOptions.some(opt => this.normalizeFieldName(f) === this.normalizeFieldName(opt))
                );
                if (match) {
                    return { match, confidence: 0.85 };
                }
            }
        }

        return null;
    }

    /**
     * Create default mapping when no schema is provided
     */
    private static createDefaultMapping(csvHeaders: string[]): MappingResult {
        const mapping: Record<string, string> = {};
        const confidence: Record<string, number> = {};

        csvHeaders.forEach(header => {
            const normalized = this.normalizeFieldName(header);
            mapping[header] = normalized;
            confidence[header] = 1.0;
        });

        return {
            mapping,
            confidence,
            unmappedCsvFields: [],
            unmappedSchemaFields: [],
            suggestions: ['No schema provided - using normalized field names']
        };
    }
}
