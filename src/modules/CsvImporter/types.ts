export type FieldType = 'string' | 'number' | 'boolean' | 'timestamp';

export interface ColumnMapping {
    csvHeader: string;
    firestoreField: string;
    type: FieldType;
    ignore: boolean;
    required?: boolean;
}

export interface CsvRow {
    [key: string]: string | number | boolean | null;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface ImportSummary {
    totalRows: number;
    successCount: number;
    failureCount: number;
    errors: { row: number; error: string }[];
}

export type ImportStatus = 'upload' | 'mapping' | 'importing' | 'complete' | 'error';
