import { useState, useEffect } from 'react';
import { collection, query, limit, onSnapshot, writeBatch, getDocs } from 'firebase/firestore';
import { useFirebase } from '../context/FirebaseContext';

export interface CsvRow {
    id: string;
    _fileName?: string;
    _uploadedAt?: any;
    [key: string]: any;
}

export const useCollectionData = () => {
    const { db, config, isConnected } = useFirebase();
    const [data, setData] = useState<CsvRow[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPurging, setIsPurging] = useState(false);

    useEffect(() => {
        // Only attempt to read if we have a valid, checked connection
        if (!db || !config.collectionName || !isConnected) {
            setData([]); // Clear data if we disconnect
            return;
        }

        let unsubscribe: () => void;

        try {
            const q = query(collection(db, config.collectionName), limit(1000));
            unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CsvRow[];
                    setData(docs);
                    setError(null);
                },
                (err) => {
                    console.error("Firestore Error:", err);
                    if (err.code === 'permission-denied') {
                        setError(`Access denied to collection "${config.collectionName}". Please check your Firestore Security Rules.`);
                    } else {
                        setError(`Error: ${err.message}`);
                    }
                }
            );
        } catch (err: any) {
            setError(err.message);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [db, config.collectionName, isConnected]);

    const purge = async () => {
        if (!db || !config.collectionName) return;
        if (!window.confirm(`Are you sure you want to PERMANENTLY delete all records from "${config.collectionName}"?`)) return;

        setIsPurging(true);
        try {
            const snapshot = await getDocs(collection(db, config.collectionName));
            const batchSize = 450;
            let processed = 0;

            while (processed < snapshot.docs.length) {
                const batch = writeBatch(db);
                const chunk = snapshot.docs.slice(processed, processed + batchSize);
                chunk.forEach(d => batch.delete(d.ref));
                await batch.commit();
                processed += chunk.length;
            }
            setError(null);
        } catch (err: any) {
            setError(`Purge failed: ${err.message}`);
        } finally {
            setIsPurging(false);
        }
    };

    return { data, error, isPurging, purge };
};
