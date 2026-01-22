import type { PipelineConfig, DatabaseProvider } from '../../context/FirebaseContext';
import type { IDatabaseService } from './types';
import { FirebaseService } from './providers/FirebaseService';
import { SupabaseService } from './providers/SupabaseService';
import { AppwriteService } from './providers/AppwriteService';
import { MongoDBService } from './providers/MongoDBService';
import { PocketBaseService } from './providers/PocketBaseService';
import { AWSAmplifyService } from './providers/AWSAmplifyService';
import { HostingerService } from './providers/HostingerService';
import { AirtableService } from './providers/AirtableService';
import { GoogleSheetsService } from './providers/GoogleSheetsService';

/**
 * Factory class to create appropriate database service based on provider
 */
export class DatabaseServiceFactory {
    private static instances: Map<DatabaseProvider, IDatabaseService> = new Map();

    /**
     * Get database service instance for the specified provider
     */
    static getService(provider: DatabaseProvider, config?: PipelineConfig): IDatabaseService {
        // For services that need config, don't cache them
        const needsConfig = ['Hostinger MySQL', 'Airtable', 'Google Sheets'];
        
        // Return cached instance if exists and doesn't need config
        if (!needsConfig.includes(provider) && this.instances.has(provider)) {
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
            case 'Hostinger MySQL':
                if (!config) throw new Error('Config is required for Hostinger MySQL');
                service = new HostingerService(config);
                break;
            case 'Airtable':
                if (!config) throw new Error('Config is required for Airtable');
                service = new AirtableService(config);
                break;
            case 'Google Sheets':
                if (!config) throw new Error('Config is required for Google Sheets');
                service = new GoogleSheetsService(config);
                break;
            case 'PostgreSQL':
            case 'MySQL':
            case 'Notion':
            case 'Xano':
            case 'Nhost':
            case 'Convex':
                // These require backend API or additional setup
                throw new Error(`${provider} requires backend API setup. Please see documentation.`);
            default:
                throw new Error(`Unsupported database provider: ${provider}`);
        }

        // Cache the instance only if it doesn't need config
        if (!needsConfig.includes(provider)) {
            this.instances.set(provider, service);
        }
        
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

            case 'Hostinger MySQL':
                if (!config.hostingerHost) errors.push('Hostinger Host is required');
                if (!config.hostingerDatabase) errors.push('Database name is required');
                if (!config.hostingerUsername) errors.push('Username is required');
                if (!config.hostingerPassword) errors.push('Password is required');
                break;

            case 'PostgreSQL':
                if (!config.postgresHost) errors.push('PostgreSQL Host is required');
                if (!config.postgresDatabase) errors.push('Database name is required');
                if (!config.postgresUsername) errors.push('Username is required');
                if (!config.postgresPassword) errors.push('Password is required');
                break;

            case 'MySQL':
                if (!config.mysqlHost) errors.push('MySQL Host is required');
                if (!config.mysqlDatabase) errors.push('Database name is required');
                if (!config.mysqlUsername) errors.push('Username is required');
                if (!config.mysqlPassword) errors.push('Password is required');
                break;

            case 'Airtable':
                if (!config.airtableApiKey) errors.push('Airtable API Key is required');
                if (!config.airtableBaseId) errors.push('Base ID is required');
                if (!config.airtableTableName) errors.push('Table name is required');
                break;

            case 'Notion':
                if (!config.notionApiKey) errors.push('Notion API Key is required');
                if (!config.notionDatabaseId) errors.push('Database ID is required');
                break;

            case 'Google Sheets':
                if (!config.googleSheetsApiKey) errors.push('Google Sheets API Key is required');
                if (!config.googleSpreadsheetId) errors.push('Spreadsheet ID is required');
                break;

            case 'Xano':
                if (!config.xanoApiUrl) errors.push('Xano API URL is required');
                if (!config.xanoApiKey) errors.push('Xano API Key is required');
                break;

            case 'Nhost':
                if (!config.nhostSubdomain) errors.push('Nhost Subdomain is required');
                if (!config.nhostRegion) errors.push('Nhost Region is required');
                break;

            case 'Convex':
                if (!config.convexUrl) errors.push('Convex URL is required');
                if (!config.convexDeploymentKey) errors.push('Deployment Key is required');
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
