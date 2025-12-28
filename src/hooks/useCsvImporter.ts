// src/hooks/useCsvImporter.ts
import { useState } from 'react';
import Papa from 'papaparse';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { useFirebase } from '../context/FirebaseContext';
import { DataEntryAgent } from '../services/ai';
import type { AIProcessOutput } from '../services/ai';

export interface MappingField {
    csvHeader: string;
    firestoreField: string;
    isEnabled: boolean;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    foreignKeyTable?: string;
    foreignKeyField?: string;
    dataType?: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url';
    isRequired?: boolean;
    isUnique?: boolean;
}

export interface CSVFile {
    name: string;
    data: any[];
    headers: string[];
}

export interface DataDescription {
    purpose: string;
    uploadedBy: string;
    dataSource: string;
    category: string;
    notes: string;
    timestamp: string;
}

export interface ProcessedFile {
    file: CSVFile;
    aiResult: AIProcessOutput | null;
    mapping: MappingField[];
    dataDescription?: DataDescription;
}

/**
 * Hook that handles CSV parsing, optional AI assistance, and importing to Firestore.
 * Includes a deduplication helper to remove duplicate rows before import.
 */
export const useCsvImporter = () => {
    const { db, config } = useFirebase();
    const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [successCount, setSuccessCount] = useState<number | null>(null);
    const [aiProcessing, setAiProcessing] = useState(false);
    const [useAiAssist, setUseAiAssist] = useState(true);

    // ---------------------------------------------------------------------
    // Helper: deep deduplication of an array of objects
    // ---------------------------------------------------------------------
    const deduplicateRows = (rows: any[]): any[] => {
        const seen = new Set<string>();
        return rows.filter(row => {
            const key = JSON.stringify(row);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    // ---------------------------------------------------------------------
    // Parsing a single file
    // ---------------------------------------------------------------------
    const parseFile = async (fileToParse: File) => {
        setError(null);
        setSuccessCount(null);

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (fileToParse.size > maxSize) {
            setError('File size too large. Maximum allowed size is 10MB.');
            return;
        }

        // Validate file type
        if (!fileToParse.name.toLowerCase().endsWith('.csv')) {
            setError('Invalid file type. Please upload a CSV file.');
            return;
        }

        Papa.parse(fileToParse, {
            header: false,
            skipEmptyLines: true,
            complete: async results => {
                if (!results.data || results.data.length < 1) {
                    setError('Empty CSV file.');
                    return;
                }
                
                // Validate row count (max 50,000 rows)
                if (results.data.length > 50000) {
                    setError('File too large. Maximum allowed rows: 50,000.');
                    return;
                }
                
                const headers = results.data[0] as string[];
                const csvRows = results.data.slice(1);
                
                // Validate headers
                if (!headers || headers.length === 0) {
                    setError('Invalid CSV format. No headers found.');
                    return;
                }
                
                const initialMapping: MappingField[] = headers.map(h => ({
                    csvHeader: h,
                    firestoreField: h.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
                    isEnabled: !!h,
                }));
                const csvFile: CSVFile = { name: fileToParse.name, data: csvRows, headers };
                let aiResult: AIProcessOutput | null = null;
                let finalMapping = initialMapping;
                if (useAiAssist && config) {
                    try {
                        setAiProcessing(true);
                        const agent = DataEntryAgent.create({ autoFix: true });
                        const result = await agent.quickProcess(headers, csvRows as any[][], config);
                        aiResult = result;
                        finalMapping = headers.map(h => ({
                            csvHeader: h,
                            firestoreField: result.mapping[h] || h.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
                            isEnabled: !!result.mapping[h],
                        }));
                    } catch (e: any) {
                        console.error('AI processing failed', e);
                        setError(`AI assist failed: ${e.message}`);
                    } finally {
                        setAiProcessing(false);
                    }
                }
                setProcessedFiles(prev => [...prev, { file: csvFile, aiResult, mapping: finalMapping }]);
            },
            error: err => setError(`CSV Parsing failed: ${err.message}`),
        });
    };

    // ---------------------------------------------------------------------
    // Parsing multiple files (batch)
    // ---------------------------------------------------------------------
    const parseMultipleFiles = async (files: File[]) => {
        setError(null);
        
        // Validate file count (max 10 files)
        if (files.length > 10) {
            setError('Too many files. Maximum allowed: 10 files at once.');
            return;
        }
        
        setAiProcessing(true);
        const newProcessed: ProcessedFile[] = [];
        
        for (const file of files) {
            // Validate each file
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                setError(`File ${file.name} is too large. Maximum allowed size is 10MB.`);
                setAiProcessing(false);
                return;
            }
            
            if (!file.name.toLowerCase().endsWith('.csv')) {
                setError(`File ${file.name} is not a CSV file.`);
                setAiProcessing(false);
                return;
            }
            
            await new Promise<void>((resolve, reject) => {
                Papa.parse(file, {
                    header: false,
                    skipEmptyLines: true,
                    complete: async results => {
                        try {
                            if (!results.data || results.data.length < 1) {
                                reject(new Error(`Empty CSV file: ${file.name}`));
                                return;
                            }
                            
                            // Validate row count
                            if (results.data.length > 50000) {
                                reject(new Error(`File ${file.name} too large. Maximum allowed rows: 50,000.`));
                                return;
                            }
                            
                            const headers = results.data[0] as string[];
                            const csvRows = results.data.slice(1);
                            
                            if (!headers || headers.length === 0) {
                                reject(new Error(`Invalid CSV format in ${file.name}. No headers found.`));
                                return;
                            }
                            
                            const initialMapping: MappingField[] = headers.map(h => ({
                                csvHeader: h,
                                firestoreField: h.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
                                isEnabled: !!h,
                                isPrimaryKey: false,
                                isForeignKey: false,
                                dataType: 'string' as const,
                                isRequired: false,
                                isUnique: false,
                            }));
                            const csvFile: CSVFile = { name: file.name, data: csvRows, headers };
                            let aiResult: AIProcessOutput | null = null;
                            let finalMapping = initialMapping;
                            if (useAiAssist && config) {
                                try {
                                    const agent = DataEntryAgent.create({ autoFix: true });
                                    const result = await agent.quickProcess(headers, csvRows as any[][], config);
                                    aiResult = result;
                                    finalMapping = headers.map(h => ({
                                        csvHeader: h,
                                        firestoreField: result.mapping[h] || h.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
                                        isEnabled: !!result.mapping[h],
                                        isPrimaryKey: false,
                                        isForeignKey: false,
                                        dataType: 'string' as const,
                                        isRequired: false,
                                        isUnique: false,
                                    }));
                                } catch (e) {
                                    console.error('AI processing failed', e);
                                }
                            }
                            newProcessed.push({ file: csvFile, aiResult, mapping: finalMapping });
                            resolve();
                        } catch (e) {
                            reject(e as any);
                        }
                    },
                    error: err => reject(err as any),
                });
            });
        }
        setProcessedFiles(prev => [...prev, ...newProcessed]);
        setAiProcessing(false);
    };

    // ---------------------------------------------------------------------
    // Mapping & description helpers
    // ---------------------------------------------------------------------
    const updateMapping = (fileIdx: number, newMapping: MappingField[]) => {
        setProcessedFiles(prev =>
            prev.map((pf, i) => (i === fileIdx ? { ...pf, mapping: newMapping } : pf))
        );
    };

    const updateDataDescription = (fileIdx: number, description: DataDescription) => {
        setProcessedFiles(prev =>
            prev.map((pf, i) => (i === fileIdx ? { ...pf, dataDescription: description } : pf))
        );
    };

    const removeFile = (fileIdx: number) => {
        setProcessedFiles(prev => prev.filter((_, i) => i !== fileIdx));
    };

    // ---------------------------------------------------------------------
    // Replace file data (used after deduplication)
    // ---------------------------------------------------------------------
    const replaceFileData = (fileIdx: number, newFile: CSVFile) => {
        setProcessedFiles(prev =>
            prev.map((pf, i) => (i === fileIdx ? { ...pf, file: newFile } : pf))
        );
    };

    // ---------------------------------------------------------------------
    // Deduplicate all processed files
    // ---------------------------------------------------------------------
    const deduplicateAll = () => {
        setProcessedFiles(prev =>
            prev.map(pf => {
                const uniqueData = deduplicateRows(pf.file.data);
                const newFile: CSVFile = { ...pf.file, data: uniqueData };
                return { ...pf, file: newFile };
            })
        );
    };

    // ---------------------------------------------------------------------
    // Commit to Firestore
    // ---------------------------------------------------------------------
    const commit = async () => {
        if (!db) {
            setError('Firebase is not connected.');
            return;
        }
        if (!config?.collectionName) return;
        setIsImporting(true);
        setProgress(0);
        setError(null);
        try {
            let totalImported = 0;
            for (let fileIdx = 0; fileIdx < processedFiles.length; fileIdx++) {
                const { file: csvFile, aiResult, mapping } = processedFiles[fileIdx];
                // Choose source data (AI cleaned or manual)
                let dataToImport: any[] = [];
                if (aiResult && aiResult.cleanedData && aiResult.cleanedData.length > 0) {
                    dataToImport = deduplicateRows(aiResult.cleanedData);
                } else {
                    dataToImport = csvFile.data.map(values => {
                        const entry: any = {};
                        mapping.forEach((field, idx) => {
                            if (field.isEnabled && idx < values.length) {
                                entry[field.firestoreField] = values[idx] ?? '';
                            }
                        });
                        return entry;
                    });
                    dataToImport = deduplicateRows(dataToImport);
                }
                const batchSize = 450;
                let processed = 0;
                const total = dataToImport.length;
                while (processed < total) {
                    const batch = writeBatch(db);
                    const chunk = dataToImport.slice(processed, processed + batchSize);
                    chunk.forEach(entry => {
                        const docRef = doc(collection(db, config.collectionName));
                        const dataWithMeta = {
                            ...entry,
                            _fileName: csvFile.name,
                            _uploadedAt: new Date().toISOString(),
                            ...(processedFiles[fileIdx].dataDescription && {
                                _dataDescription: { ...processedFiles[fileIdx].dataDescription },
                            }),
                        };
                        batch.set(docRef, dataWithMeta);
                    });
                    await batch.commit();
                    processed += chunk.length;
                    totalImported += chunk.length;
                    const overallProgress = ((fileIdx * 100) + Math.round((processed / total) * 100)) / processedFiles.length;
                    setProgress(Math.round(overallProgress));
                }
            }
            setSuccessCount(totalImported);
            setProcessedFiles([]);
        } catch (e: any) {
            setError(`Import failed: ${e.message}`);
        } finally {
            setIsImporting(false);
        }
    };

    const reset = () => {
        setProcessedFiles([]);
        setError(null);
        setSuccessCount(null);
        setProgress(0);
        setAiProcessing(false);
    };

    const toggleAiAssist = () => setUseAiAssist(prev => !prev);

    return {
        processedFiles,
        isImporting,
        progress,
        error,
        successCount,
        parseFile,
        parseMultipleFiles,
        updateMapping,
        updateDataDescription,
        removeFile,
        replaceFileData,
        deduplicateAll,
        commit,
        reset,
        aiProcessing,
        useAiAssist,
        toggleAiAssist,
    };
};
