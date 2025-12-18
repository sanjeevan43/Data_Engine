import type { FieldType } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCell = (value: any, type: FieldType, isRequired: boolean): { isValid: boolean; error?: string } => {
    if (isRequired && (value === null || value === undefined || value === '')) {
        return { isValid: false, error: 'Required field is empty' };
    }

    if (value === null || value === undefined || value === '') {
        return { isValid: true };
    }

    switch (type) {
        case 'number':
            if (isNaN(Number(value))) {
                return { isValid: false, error: 'Invalid number' };
            }
            break;
        case 'boolean':
            const lower = String(value).toLowerCase();
            if (lower !== 'true' && lower !== 'false' && lower !== '1' && lower !== '0' && lower !== 'yes' && lower !== 'no') {
                return { isValid: false, error: 'Invalid boolean' };
            }
            break;
        case 'timestamp':
            if (isNaN(Date.parse(String(value)))) {
                return { isValid: false, error: 'Invalid date format' };
            }
            break;
        case 'string':
            // Check if it looks like an email
            const strValue = String(value);
            if (strValue.includes('@') && !EMAIL_REGEX.test(strValue)) {
                return { isValid: false, error: 'Invalid email format' };
            }
            break;
    }

    return { isValid: true };
};

export const normalizeValue = (value: any, type: FieldType): any => {
    if (value === null || value === undefined || value === '') return null;

    switch (type) {
        case 'number':
            return Number(value);
        case 'boolean':
            const lower = String(value).toLowerCase();
            return (lower === 'true' || lower === '1' || lower === 'yes');
        case 'timestamp':
            return new Date(String(value));
        default:
            return String(value);
    }
};

export const detectDuplicates = (data: any[], uniqueField: string): { duplicates: number[]; unique: any[] } => {
    const seen = new Set();
    const duplicates: number[] = [];
    const unique: any[] = [];

    data.forEach((row, index) => {
        const key = row[uniqueField];
        if (key && seen.has(key)) {
            duplicates.push(index + 1);
        } else {
            if (key) seen.add(key);
            unique.push(row);
        }
    });

    return { duplicates, unique };
};
