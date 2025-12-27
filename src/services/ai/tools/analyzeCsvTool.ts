/**
 * CSV Analysis Tool
 * Analyzes CSV structure, detects types, finds patterns
 */

import type { AnalysisResult } from '../types';

export class AnalyzeCsvTool {
    /**
     * Analyze CSV headers and sample rows
     */
    static analyze(headers: string[], sampleRows: any[][]): AnalysisResult {
        const detectedTypes: Record<string, string> = {};
        const nullCounts: Record<string, number> = {};
        const uniqueValueCounts: Record<string, number> = {};
        const sampleValues: Record<string, any[]> = {};

        headers.forEach((header, columnIndex) => {
            const columnValues = sampleRows.map(row => row[columnIndex]);

            // Detect data type
            detectedTypes[header] = this.detectType(columnValues);

            // Count nulls/empty values
            nullCounts[header] = columnValues.filter(v =>
                v === null || v === undefined || String(v).trim() === ''
            ).length;

            // Count unique values
            uniqueValueCounts[header] = new Set(columnValues.filter(v => v !== null && v !== undefined)).size;

            // Store sample values (up to 5)
            sampleValues[header] = [...new Set(columnValues.filter(v => v))].slice(0, 5);
        });

        const recommendations = this.generateRecommendations(
            headers,
            detectedTypes,
            nullCounts,
            uniqueValueCounts,
            sampleRows.length
        );

        return {
            headers,
            rowCount: sampleRows.length,
            detectedTypes,
            nullCounts,
            uniqueValueCounts,
            sampleValues,
            recommendations
        };
    }

    /**
     * Detect data type from sample values
     */
    private static detectType(values: any[]): string {
        const validValues = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');

        if (validValues.length === 0) return 'string';

        // Check for email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (validValues.every(v => emailPattern.test(String(v)))) {
            return 'email';
        }

        // Check for URL
        const urlPattern = /^https?:\/\//;
        if (validValues.every(v => urlPattern.test(String(v)))) {
            return 'url';
        }

        // Check for boolean
        const boolPattern = /^(true|false|yes|no|0|1)$/i;
        if (validValues.every(v => boolPattern.test(String(v)))) {
            return 'boolean';
        }

        // Check for number
        const numberPattern = /^-?\d+\.?\d*$/;
        if (validValues.every(v => numberPattern.test(String(v).replace(/[,$]/g, '')))) {
            return 'number';
        }

        // Check for date
        const datePattern = /^\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}/;
        if (validValues.some(v => datePattern.test(String(v)))) {
            return 'date';
        }

        return 'string';
    }

    /**
     * Generate analysis recommendations
     */
    private static generateRecommendations(
        headers: string[],
        types: Record<string, string>,
        nullCounts: Record<string, number>,
        uniqueCounts: Record<string, number>,
        totalRows: number
    ): string[] {
        const recommendations: string[] = [];

        headers.forEach(header => {
            const nullPercentage = (nullCounts[header] / totalRows) * 100;
            const uniquePercentage = (uniqueCounts[header] / totalRows) * 100;

            // High null percentage
            if (nullPercentage > 50) {
                recommendations.push(
                    `Field "${header}" has ${nullPercentage.toFixed(0)}% null values - consider making it optional`
                );
            }

            // Potential unique identifier
            if (uniquePercentage === 100 && types[header] === 'string') {
                recommendations.push(
                    `Field "${header}" has 100% unique values - potential unique identifier`
                );
            }

            // Email field detection
            if (types[header] === 'email') {
                recommendations.push(
                    `Field "${header}" detected as email - validation will be applied`
                );
            }

            // URL field detection
            if (types[header] === 'url') {
                recommendations.push(
                    `Field "${header}" detected as URL - format validation will be applied`
                );
            }

            // Low variance (may be constant or enum)
            if (uniqueCounts[header] <= 10 && uniquePercentage < 20) {
                recommendations.push(
                    `Field "${header}" has only ${uniqueCounts[header]} unique values - consider as enum/category`
                );
            }
        });

        return recommendations;
    }

    /**
     * Analyze data quality metrics
     */
    static analyzeQuality(rows: any[][], headers: string[]): {
        completeness: number;
        consistency: number;
        issues: string[];
    } {
        const issues: string[] = [];
        let totalCells = 0;
        let filledCells = 0;

        rows.forEach((row) => {
            headers.forEach((_, colIndex) => {
                totalCells++;
                const value = row[colIndex];

                if (value !== null && value !== undefined && String(value).trim() !== '') {
                    filledCells++;
                }

                // Check for inconsistent formats in same column
                // (e.g., dates in different formats)
            });
        });

        const completeness = totalCells > 0 ? (filledCells / totalCells) * 100 : 0;
        const consistency = 100; // Simplified for now

        if (completeness < 70) {
            issues.push(`Low data completeness: ${completeness.toFixed(1)}%`);
        }

        return { completeness, consistency, issues };
    }
}
