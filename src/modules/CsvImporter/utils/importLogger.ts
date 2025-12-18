import { db, auth } from '../../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { ImportSummary } from '../types';

export const logImportSummary = async (
    collectionName: string,
    fileName: string,
    summary: ImportSummary
): Promise<void> => {
    try {
        await addDoc(collection(db, 'import_logs'), {
            collectionName,
            fileName,
            summary,
            userId: auth.currentUser?.uid || 'anonymous',
            timestamp: serverTimestamp(),
            status: summary.failureCount > 0 ? 'partial_success' : 'success'
        });
    } catch (error) {
        console.error('Failed to log import summary:', error);
        // Don't throw - logging failure shouldn't break the import
    }
};