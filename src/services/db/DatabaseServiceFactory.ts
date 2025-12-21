import type { PipelineConfig, DatabaseProvider } from '../../context/FirebaseContext';
import type { IDatabaseService } from './types';
import { FirebaseService } from './providers/FirebaseService';
import { SupabaseService } from './providers/SupabaseService';
import { AppwriteService } from './providers/AppwriteService';
import { MongoDBService } from './providers/MongoDBService';
import { PocketBaseService } from './providers/PocketBaseService';
import { AWSAmplifyService } from './providers/AWSAmplifyService';

/**
 * Factory class to create appropriate database service based on provider
 */
export class DatabaseServiceFactory {
    private static instances: Map<DatabaseProvider, IDatabaseService> = new Map();

    /**
     * Get database service instance for the specified provider
     */
    static getService(provider: DatabaseProvider): IDatabaseService {
        // Return cached instance if exists
        if (this.instances.has(provider)) {
            return this.instances.get(provider)!;
        }

        // Create new instance based on provider
        let service: IDatabaseService;

        switch (provider) {
            case 'Firebase':
                service = new FirebaseService();
                break;
            case 'Supabase':
                service = new SupabaseService();
                break;
            case 'Appwrite':
                service = new AppwriteService();
                break;
            case 'MongoDB':
                service = new MongoDBService();
                break;
            case 'PocketBase':
                service = new PocketBaseService();
                break;
            case 'AWS Amplify':
                service = new AWSAmplifyService();
                break;
            default:
                throw new Error(`Unsupported database provider: ${provider}`);
        }

        // Cache the instance
        this.instances.set(provider, service);
        return service;
    }

    /**
     * Validate configuration for a specific provider
     */
    static validateConfig(config: PipelineConfig): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Common validation
        if (!config.provider) {
            errors.push('Provider is required');
        }

        if (!config.collectionName || config.collectionName.trim() === '') {
            errors.push('Collection/Table name is required');
        }

        // Provider-specific validation
        switch (config.provider) {
            case 'Firebase':
                if (!config.apiKey) errors.push('API Key is required');
                if (!config.projectId) errors.push('Project ID is required');
                if (!config.appId) errors.push('App ID is required');
                break;

            case 'Supabase':
                if (!config.supabaseUrl) errors.push('Supabase URL is required');
                if (!config.supabaseAnonKey) errors.push('Supabase Anon Key is required');
                break;

            case 'Appwrite':
                if (!config.appwriteEndpoint) errors.push('Appwrite Endpoint is required');
                if (!config.appwriteProjectId) errors.push('Appwrite Project ID is required');
                if (!config.appwriteDatabaseId) errors.push('Appwrite Database ID is required');
                break;

            case 'MongoDB':
                if (!config.mongoApiUrl) errors.push('MongoDB API URL is required');
                if (!config.mongoApiKey) errors.push('MongoDB API Key is required');
                if (!config.mongoDataSource) errors.push('MongoDB Data Source is required');
                if (!config.mongoDatabaseName) errors.push('MongoDB Database Name is required');
                break;

            case 'PocketBase':
                if (!config.pocketbaseUrl) errors.push('PocketBase URL is required');
                break;

            case 'AWS Amplify':
                if (!config.amplifyApiUrl) errors.push('AWS Amplify API URL is required');
                if (!config.amplifyApiKey) errors.push('AWS Amplify API Key is required');
                break;

            default:
                errors.push(`Provider ${config.provider} is not yet supported`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Clear all cached service instances
     */
    static clearCache(): void {
        this.instances.clear();
    }
}
