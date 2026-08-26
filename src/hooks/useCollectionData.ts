import { useState, useEffect } from 'react';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '../context/FirebaseContext';
import { DataManager } from '../services/db/DataManager';

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
        if (!config || !isConnected) {
            setData([]); // Clear data if we disconnect
            return;
        }

        if (config.provider === 'Firebase' && db) {
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
        } else {
            // For other providers, use a periodic polling interval to fetch data
            let isMounted = true;

            const fetchNonFirebaseData = async () => {
                try {
                    const fetched = await DataManager.fetchData(config);
                    if (isMounted) {
                        setData(fetched as CsvRow[]);
                        setError(null);
                    }
                } catch (err: any) {
                    if (isMounted) {
                        console.error("Fetch Error:", err);
                        setError(`Failed to fetch data: ${err.message}`);
                    }
                }
            };

            fetchNonFirebaseData();
            const interval = setInterval(fetchNonFirebaseData, 5000);

            return () => {
                isMounted = false;
                clearInterval(interval);
            };
        }
    }, [db, config, isConnected]);

    const purge = async () => {
        if (!config) return;
        
        const targetName = config.provider === 'Firebase' ? config.collectionName : config.provider;
        if (!window.confirm(`Are you sure you want to PERMANENTLY delete all records from "${targetName}"?`)) return;

        setIsPurging(true);
        try {
            await DataManager.purgeData(config);
            if (config.provider !== 'Firebase') {
                setData([]);
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
