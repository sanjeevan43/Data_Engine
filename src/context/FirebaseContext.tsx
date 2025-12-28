import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { initializeApp, getApp, getApps, deleteApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export type DatabaseProvider = 'Firebase' | 'Supabase' | 'Appwrite' | 'AWS Amplify' | 'MongoDB' | 'PocketBase';

export interface PipelineConfig {
    provider: DatabaseProvider;
    collectionName: string;

    // Firebase
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;

    // Supabase
    supabaseUrl?: string;
    supabaseAnonKey?: string;

    // Appwrite
    appwriteEndpoint?: string;
    appwriteProjectId?: string;
    appwriteDatabaseId?: string;

    // PocketBase
    pocketbaseUrl?: string;
    pocketbaseCollection?: string; // Often different naming conventions

    // MongoDB (Data API)
    mongoApiUrl?: string;
    mongoApiKey?: string;
    mongoDataSource?: string;
    mongoDatabaseName?: string;

    // AWS Amplify
    amplifyApiUrl?: string;
    amplifyApiKey?: string;
    amplifyRegion?: string;
}

export type FirebaseConfig = PipelineConfig; // Alias for backward compatibility

interface FirebaseContextType {
    db: Firestore | null;
    config: FirebaseConfig;
    updateConfig: (newConfig: FirebaseConfig) => void;
    isConnected: boolean;
    error: string | null;
    isValidated: boolean; // True if we successfully initialized
}

const CONFIG_KEY = 'fci_user_config_v4';

const defaultContext: FirebaseContextType = {
    db: null,
    config: {
        provider: 'Firebase',
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        measurementId: '',
        collectionName: 'csv_imports'
    },
    updateConfig: () => { },
    isConnected: false,
    error: null,
    isValidated: false,
};

const FirebaseContext = createContext<FirebaseContextType>(defaultContext);

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
    const [db, setDb] = useState<Firestore | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isValidated, setIsValidated] = useState(false);

    const [config, setConfig] = useState<FirebaseConfig>(() => {
        try {
            const saved = localStorage.getItem(CONFIG_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validate that parsed config has required structure
                if (parsed && typeof parsed === 'object' && parsed.provider) {
                    return { ...defaultContext.config, ...parsed };
                }
            }
        } catch (error) {
            console.warn('Failed to parse saved config from localStorage:', error);
        }
        return defaultContext.config;
    });

    const initFirebase = useCallback(async (credentials: FirebaseConfig) => {
        try {
            // Only initialize Firebase if the provider is Firebase
            if (credentials.provider !== 'Firebase') {
                setDb(null);
                setError(null);
                setIsValidated(true); // Other providers are "validated" by having config
                return;
            }

            if (!credentials.apiKey || !credentials.projectId || !credentials.appId) {
                setDb(null);
                setIsValidated(false);
                setError("Please configure Firebase credentials in Pipeline Configuration.");
                return;
            }

            // Clean up existing app if it exists to avoid "app already defined" errors
            if (getApps().length > 0) {
                const currentApp = getApp();
                await deleteApp(currentApp);
            }

            const app = initializeApp(credentials);
            const firestore = getFirestore(app);
            setDb(firestore);
            setError(null);
            setIsValidated(true);
        } catch (err: any) {
            console.error("Firebase init error:", err);
            setError("Invalid Firebase configuration. Please check your credentials.");
            setDb(null);
            setIsValidated(false);
        }
    }, []);

    // Init on mount or config change
    useEffect(() => {
        // Use a flag to prevent state updates if component unmounts
        let isMounted = true;
        
        const initializeFirebaseAsync = async () => {
            if (isMounted) {
                await initFirebase(config);
            }
        };
        
        initializeFirebaseAsync();
        
        return () => {
            isMounted = false;
        };
    }, [config, initFirebase]);

    const updateConfig = (newConfig: FirebaseConfig) => {
        // Validate config before saving
        if (!newConfig || typeof newConfig !== 'object' || !newConfig.provider) {
            console.error('Invalid config provided to updateConfig');
            return;
        }
        
        setConfig(newConfig);
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
        } catch (error) {
            console.error('Failed to save config to localStorage:', error);
        }
    };

    return (
        <FirebaseContext.Provider value={{ db, config, updateConfig, isConnected: !!db, error, isValidated }}>
            {children}
        </FirebaseContext.Provider>
    );
};
