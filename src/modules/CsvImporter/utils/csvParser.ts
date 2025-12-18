import Papa from 'papaparse';
import type { CsvRow } from '../types';

export const parseCsv = (file: File): Promise<{ data: CsvRow[]; meta: Papa.ParseMeta }> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            complete: (results) => {
                resolve({
                    data: results.data as CsvRow[],
                    meta: results.meta,
                });
            },
            error: (error) => {
                reject(error);
            },
        });
    });
};

export const validateHeaders = (headers: string[]): string[] => {
    // Check for duplicate headers or empty ones
    const unique = new Set(headers);
    if (unique.size !== headers.length) {
        // Determine which are duplicates? (optional enhancement)
    }
    return headers;
};
