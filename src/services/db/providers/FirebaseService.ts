import { initializeApp, getApp, getApps, deleteApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs, query, limit } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { IDatabaseService, ImportResult } from '../types';
import type { PipelineConfig } from '../../../context/FirebaseContext';

/**
 * Firebase/Firestore Database Service Implementation
 */
export class FirebaseService implements IDatabaseService {
    private app: FirebaseApp | null = null;
    private db: Firestore | null = null;

    /**
     * Initialize Firebase app with config
     */
    private async initializeFirebase(config: PipelineConfig): Promise<void> {
        try {
            // Clean up existing app if it exists
            if (getApps().length > 0) {
                const currentApp = getApp();
                await deleteApp(currentApp);
            }

            // Initialize new app
            this.app = initializeApp({
                apiKey: config.apiKey,
                authDomain: config.authDomain,
                projectId: config.projectId,
                storageBucket: config.storageBucket,
                messagingSenderId: config.messagingSenderId,
                appId: config.appId,
                measurementId: config.measurementId
            });

            this.db = getFirestore(this.app);
        } catch (error: any) {
            console.error('Firebase initialization error:', error);
            throw new Error(`Firebase initialization failed: ${error.message}`);
        }
    }

    /**
     * Test Firebase connection
     */
    async testConnection(config: PipelineConfig): Promise<boolean> {
        try {
            if (!config.apiKey || !config.projectId || !config.appId) {
                return false;
            }

            await this.initializeFirebase(config);

            if (!this.db) {
                return false;
            }

            // Try to access the collection
            const testQuery = query(
                collection(this.db, config.collectionName),
                limit(1)
            );
            await getDocs(testQuery);

            return true;
        } catch (error: any) {
            console.error('Firebase connection test failed:', error);
            return false;
        }
    }

    /**
     * Import data to Firestore in batches
     */
    async importData(
        data: any[],
        config: PipelineConfig,
        onProgress?: (count: number) => void
    ): Promise<ImportResult> {
        if (!this.db) {
            await this.initializeFirebase(config);
        }

        if (!this.db) {
            throw new Error('Firebase is not initialized');
        }

        const BATCH_SIZE = 450; // Firestore batch limit is 500
        let success = 0;
        let failure = 0;
        const errors: any[] = [];

        try {
            const totalBatches = Math.ceil(data.length / BATCH_SIZE);

            for (let i = 0; i < totalBatches; i++) {
                const batch = writeBatch(this.db);
                const startIdx = i * BATCH_SIZE;
                const endIdx = Math.min(startIdx + BATCH_SIZE, data.length);
                const chunk = data.slice(startIdx, endIdx);

                try {
                    chunk.forEach((item) => {
                        const docRef = doc(collection(this.db!, config.collectionName));
                        batch.set(docRef, {
                            ...item,
                            _uploadedAt: new Date(),
                            _batchNumber: i + 1
                        });
                    });

                    await batch.commit();
                    success += chunk.length;

                    if (onProgress) {
                        onProgress(success);
                    }
                } catch (error: any) {
                    failure += chunk.length;
                    errors.push({
                        batch: i + 1,
                        error: error.message,
                        range: `${startIdx}-${endIdx}`
                    });
                }
            }
        } catch (error: any) {
            errors.push({
                error: error.message,
                type: 'general'
            });
        }

        return { success, failure, errors };
    }

    /**
     * Fetch data from Firestore
     */
    async fetchData(config: PipelineConfig): Promise<any[]> {
        if (!this.db) {
            await this.initializeFirebase(config);
        }

        if (!this.db) {
            throw new Error('Firebase is not initialized');
        }

        try {
            const q = query(
                collection(this.db, config.collectionName),
                limit(1000)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error: any) {
            console.error('Firebase fetch error:', error);
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }

    /**
     * Purge all data from collection
     */
    async purgeData(config: PipelineConfig): Promise<void> {
        if (!this.db) {
            await this.initializeFirebase(config);
        }

        if (!this.db) {
            throw new Error('Firebase is not initialized');
        }

        const snapshot = await getDocs(collection(this.db, config.collectionName));
        const BATCH_SIZE = 450;

        let processed = 0;
        while (processed < snapshot.docs.length) {
            const batch = writeBatch(this.db);
            const chunk = snapshot.docs.slice(processed, processed + BATCH_SIZE);
            chunk.forEach(d => batch.delete(d.ref));
            await batch.commit();
            processed += chunk.length;
        }
    }
}
