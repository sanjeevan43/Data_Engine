import { useState } from 'react';

import { parseCsv } from '../utils/csvParser';
import { validateCell, normalizeValue } from '../utils/validators';
import { batchWriteToFirestore } from '../utils/firestoreWriter';
import { logImportSummary } from '../utils/importLogger';
import type { ColumnMapping, CsvRow, ImportStatus, ImportSummary } from '../types';

export const useCsvImporter = () => {
    const [status, setStatus] = useState<ImportStatus>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [rawRows, setRawRows] = useState<CsvRow[]>([]);
    const [mappings, setMappings] = useState<ColumnMapping[]>([]);
    const [collectionName, setCollectionName] = useState('imported_data');
    const [progress, setProgress] = useState(0);
    const [summary, setSummary] = useState<ImportSummary | null>(null);

    const handleFileSelect = async (selectedFile: File) => {
        try {
            const { data, meta } = await parseCsv(selectedFile);
            setFile(selectedFile);
            setHeaders(meta.fields || []);
            setRawRows(data);

            // Initial mappings
            const initialMappings: ColumnMapping[] = (meta.fields || []).map(field => ({
                csvHeader: field,
                firestoreField: field.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                type: 'string',
                ignore: false
            }));
            setMappings(initialMappings);
            setStatus('mapping');
        } catch (err) {
            console.error(err);
            alert('Failed to parse CSV');
        }
    };

    const startImport = async () => {
        setStatus('importing');
        setProgress(0);

        // 1. Transform and Validate
        const activeMappings = mappings.filter(m => !m.ignore);
        const validRows: any[] = [];
        const errors: { row: number; error: string }[] = [];

        rawRows.forEach((row, index) => {
            const transformedRow: any = {};
            let isRowValid = true;

            for (const map of activeMappings) {
                const value = row[map.csvHeader];
                const validation = validateCell(value, map.type, map.required || false);

                if (!validation.isValid) {
                    errors.push({ row: index + 1, error: `${map.csvHeader}: ${validation.error}` });
                    isRowValid = false;
                } else {
                    transformedRow[map.firestoreField] = normalizeValue(value, map.type);
                }
            }

            if (isRowValid) {
                validRows.push(transformedRow);
            }
        });

        // 2. Upload to Firestore
        let importSummary: ImportSummary;
        
        if (validRows.length > 0) {
            const result = await batchWriteToFirestore(collectionName, validRows, file?.name || 'unknown.csv', (count) => {
                setProgress(Math.round((count / validRows.length) * 100));
            });

            importSummary = {
                totalRows: rawRows.length,
                successCount: result.success,
                failureCount: result.failure + (rawRows.length - validRows.length),
                errors: [...errors, ...result.errors.map((e, idx) => ({ row: idx + 1, error: `Batch Error: ${e.error?.message || 'Unknown error'}` }))]
            };
        } else {
            importSummary = {
                totalRows: rawRows.length,
                successCount: 0,
                failureCount: rawRows.length,
                errors: errors
            };
        }

        setSummary(importSummary);

        // 3. Log the import summary
        await logImportSummary(collectionName, file?.name || 'unknown.csv', importSummary);

        setStatus('complete');
    };

    const reset = () => {
        setStatus('upload');
        setFile(null);
        setSummary(null);
        setProgress(0);
    };

    return {
        status,
        file,
        headers,
        mappings,
        setMappings,
        collectionName,
        setCollectionName,
        handleFileSelect,
        startImport,
        reset,
        progress,
        summary
    };
};
