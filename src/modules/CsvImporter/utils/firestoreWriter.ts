import { db, auth } from '../../../config/firebase';
import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore';
import type { CsvRow } from '../types';

export const batchWriteToFirestore = async (
    collectionName: string,
    data: CsvRow[],
    fileName: string,
    onProgress: (count: number) => void
): Promise<{ success: number; failure: number; errors: any[] }> => {
    const BATCH_SIZE = 500;
    let success = 0;
    let failure = 0;
    const errors: any[] = [];
    const totalChunks = Math.ceil(data.length / BATCH_SIZE);

    for (let i = 0; i < totalChunks; i++) {
        const chunk = data.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        const batch = writeBatch(db);

        chunk.forEach((row) => {
            // Create a reference with auto-generated ID
            const docRef = doc(collection(db, collectionName));
            // Add metadata
            const payload = {
                ...row,
                createdAt: serverTimestamp(),
                createdBy: auth.currentUser?.uid || 'anonymous',
                sourceFileName: fileName,
                _metadata: {
                    importedAt: serverTimestamp(),
                    userId: auth.currentUser?.uid || 'anonymous'
                }
            };

            batch.set(docRef, payload);
        });

        try {
            await batch.commit();
            success += chunk.length;
            onProgress(success);
        } catch (error) {
            console.error('Batch error:', error);
            failure += chunk.length;
            errors.push({ batchIndex: i, error });
            // In a more advanced version, we might retry or try to find which specific doc failed?
            // But Firestore batches are atomic, so the whole batch failed.
        }
    }

    return { success, failure, errors };
};
