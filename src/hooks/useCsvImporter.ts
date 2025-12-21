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
}

export interface CSVFile {
    name: string;
    data: any[];
    headers: string[];
}

export interface ProcessedFile {
    file: CSVFile;
    aiResult: AIProcessOutput | null;
    mapping: MappingField[];
}

export const useCsvImporter = () => {
    const { db, config } = useFirebase();
    const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [successCount, setSuccessCount] = useState<number | null>(null);

    // AI Agent state
    const [aiProcessing, setAiProcessing] = useState(false);
    const [useAiAssist, setUseAiAssist] = useState(true);

    const parseFile = async (fileToParse: File) => {
        setError(null);
        setSuccessCount(null);

        Papa.parse(fileToParse, {
            complete: async (results) => {
                if (results.data.length < 1) {
                    setError("Empty CSV file.");
                    return;
                }

                const headers = results.data[0] as string[];
                const csvRows = results.data.slice(1);

                // Create initial basic mapping
                const initialMapping = headers.map(h => ({
                    csvHeader: h,
                    firestoreField: h.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
                    isEnabled: !!h
                }));

                const csvFile: CSVFile = {
                    name: fileToParse.name,
                    data: csvRows,
                    headers
                };

                let aiResult: AIProcessOutput | null = null;
                let finalMapping = initialMapping;

                // Run AI processing if enabled
                if (useAiAssist && config) {
                    try {
                        setAiProcessing(true);
                        console.log('[CSV Importer] Running AI data entry agent...');

                        const agent = DataEntryAgent.create({ autoFix: true });
                        const result = await agent.quickProcess(
                            headers,
                            csvRows as any[][],
                            config
                        );

                        aiResult = result;

                        // Update mapping based on AI recommendations
                        finalMapping = headers.map(h => ({
                            csvHeader: h,
                            firestoreField: result.mapping[h] || h.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
                            isEnabled: !!result.mapping[h]
                        }));

                        console.log('[CSV Importer] AI processing complete');
                        console.log(`[CSV Importer] Valid rows: ${result.stats.validRows}/${result.stats.totalRows}`);
                        console.log(`[CSV Importer] Transformations: ${result.stats.transformationsApplied}`);

                        if (result.errors.length > 0) {
                            console.warn(`[CSV Importer] ${result.errors.length} validation errors found`);
                        }
                    } catch (aiError: any) {
                        console.error('[CSV Importer] AI processing failed:', aiError);
                        setError(`AI assist failed: ${aiError.message}. Using basic mapping.`);
                    } finally {
                        setAiProcessing(false);
                    }
                }

                // Add to processed files
                setProcessedFiles(prev => [...prev, {
                    file: csvFile,
                    aiResult,
                    mapping: finalMapping
                }]);
            },
            error: (err) => {
                setError(`CSV Parsing failed: ${err.message}`);
            }
        });
    };

    const parseMultipleFiles = async (filesToParse: File[]) => {
        for (const file of filesToParse) {
            await parseFile(file);
        }
    };

    const updateMapping = (fileIndex: number, newMapping: MappingField[]) => {
        setProcessedFiles(prev => prev.map((pf, idx) =>
            idx === fileIndex ? { ...pf, mapping: newMapping } : pf
        ));
    };

    const removeFile = (fileIndex: number) => {
        setProcessedFiles(prev => prev.filter((_, idx) => idx !== fileIndex));
    };

    const commit = async () => {
        if (!db) {
            setError("Firebase is not connected.");
            return;
        }
        if (processedFiles.length === 0 || !config.collectionName) return;

        setIsImporting(true);
        setProgress(0);
        setError(null);

        try {
            let totalImported = 0;

            // Process each file
            for (let fileIdx = 0; fileIdx < processedFiles.length; fileIdx++) {
                const { file: csvFile, aiResult, mapping } = processedFiles[fileIdx];

                // Use AI-cleaned data if available, otherwise fall back to manual mapping
                let dataToImport: any[];

                if (aiResult && aiResult.cleanedData.length > 0) {
                    console.log(`[CSV Importer] Using AI-cleaned data for ${csvFile.name}`);
                    dataToImport = aiResult.cleanedData;
                } else {
                    console.log(`[CSV Importer] Using manual mapping for ${csvFile.name}`);
                    // Transform using manual mapping
                    dataToImport = csvFile.data.map((values: any) => {
                        const entry: any = {};
                        mapping.forEach((field, index) => {
                            if (field.isEnabled) {
                                entry[field.firestoreField] = values[index] || '';
                            }
                        });
                        return entry;
                    });
                }

                const batchSize = 450;
                let processed = 0;
                const total = dataToImport.length;

                // Process in chunks
                while (processed < total) {
                    const batch = writeBatch(db);
                    const chunk = dataToImport.slice(processed, processed + batchSize);

                    chunk.forEach(entry => {
                        const docRef = doc(collection(db, config.collectionName));
                        // Import only the clean data - no extra fields
                        batch.set(docRef, entry);
                    });

                    await batch.commit();
                    processed += chunk.length;
                    totalImported += chunk.length;

                    // Update progress across all files
                    const overallProgress = ((fileIdx * 100) + Math.round((processed / total) * 100)) / processedFiles.length;
                    setProgress(Math.round(overallProgress));
                }
            }

            setSuccessCount(totalImported);
            setProcessedFiles([]); // Clear all files on success
        } catch (err: any) {
            setError(`Import failed: ${err.message}`);
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

    const toggleAiAssist = () => {
        setUseAiAssist(prev => !prev);
    };

    return {
        processedFiles,
        isImporting,
        progress,
        error,
        successCount,
        parseFile,
        parseMultipleFiles,
        updateMapping,
        removeFile,
        commit,
        reset,
        // AI-related exports
        aiProcessing,
        useAiAssist,
        toggleAiAssist
    };
};
