/**
 * Google Sheets Database Service
 * 
 * Provides integration with Google Sheets API
 */

import type { PipelineConfig } from '../../../context/FirebaseContext';
import type { IDatabaseService, ImportResult } from '../types';

export class GoogleSheetsService implements IDatabaseService {
    private config: PipelineConfig;
    private baseUrl: string;

    constructor(config: PipelineConfig) {
        this.config = config;
        this.baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${config.googleSpreadsheetId}`;
    }

    private getHeaders(): HeadersInit {
        return {
            'Authorization': `Bearer ${this.config.googleSheetsApiKey}`,
            'Content-Type': 'application/json',
        };
    }

    async testConnection(config: PipelineConfig): Promise<boolean> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            return response.ok;
        } catch (error) {
            console.error('Google Sheets connection test failed:', error);
            return false;
        }
    }

    async importData(
        data: Array<Record<string, any>>,
        config: PipelineConfig,
        onProgress?: (count: number) => void
    ): Promise<ImportResult> {
        const total = data.length;
        let success = 0;
        let failure = 0;
        const errors: string[] = [];

        try {
            const sheetName = this.config.googleSheetName || 'Sheet1';
            
            // Get headers from first data item
            const headers = Object.keys(data[0] || {});
            
            // Convert data to 2D array
            const values = [
                headers, // Header row
                ...data.map(item => headers.map(key => item[key] ?? ''))
            ];

            // Append data to sheet
            const url = `${this.baseUrl}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=RAW`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    values: values
                }),
            });

            if (response.ok) {
                success = total;
            } else {
                failure = total;
                const error = await response.json();
                errors.push(error.error?.message || 'Unknown error');
            }

            if (onProgress) {
                onProgress(total);
            }

            return { success, failure, errors };
        } catch (error: any) {
            return {
                success: 0,
                failure: total,
                errors: [error.message],
            };
        }
    }

    async fetchData(): Promise<Array<Record<string, any>>> {
        try {
            const sheetName = this.config.googleSheetName || 'Sheet1';
            const url = `${this.baseUrl}/values/${encodeURIComponent(sheetName)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data from Google Sheets');
            }

            const result = await response.json();
            const values = result.values || [];

            if (values.length === 0) {
                return [];
            }

            // First row is headers
            const headers = values[0];
            const dataRows = values.slice(1);

            // Convert to array of objects
            return dataRows.map((row: any[]) => {
                const obj: Record<string, any> = {};
                headers.forEach((header: string, index: number) => {
                    obj[header] = row[index] ?? '';
                });
                return obj;
            });
        } catch (error) {
            console.error('Google Sheets fetch error:', error);
            return [];
        }
    }

    async purgeData(): Promise<void> {
        try {
            const sheetName = this.config.googleSheetName || 'Sheet1';
            
            // Clear all data except headers
            const url = `${this.baseUrl}/values/${encodeURIComponent(sheetName)}!A2:ZZ:clear`;

            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to purge Google Sheets data');
            }
        } catch (error) {
            console.error('Google Sheets purge error:', error);
            throw error;
        }
    }
}
