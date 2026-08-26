import React, { useState } from 'react';
import { Settings, X, Key, Layout, ShieldCheck, List, Database, Sparkles, Zap, Activity } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import type { FirebaseConfig, DatabaseProvider } from '../context/FirebaseContext';

interface SettingsModalProps {
    onClose: () => void;
    initialProvider?: DatabaseProvider;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, initialProvider }) => {
    const { config, updateConfig } = useFirebase();
    const [activeTab, setActiveTab] = useState<'database' | 'ai'>('database');
    const [tempConfig, setTempConfig] = useState<FirebaseConfig>({
        ...config,
        provider: initialProvider || config.provider || 'Firebase'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateConfig(tempConfig);
        onClose();
    };

    const providers: DatabaseProvider[] = [
        'Firebase', 
        'Supabase', 
        'MongoDB',
        'Hostinger MySQL',
        'PostgreSQL',
        'MySQL',
        'Airtable',
        'Google Sheets',
        'Appwrite', 
        'AWS Amplify',
        'PocketBase',
        'Notion',
        'Xano',
        'Nhost',
        'Convex'
    ];

    const firebaseFields = [
        { id: 'apiKey', label: 'API Key', icon: <Key className="w-4 h-4" />, type: 'password' },
        { id: 'projectId', label: 'Project ID', icon: <Layout className="w-4 h-4" />, type: 'text' },
        { id: 'appId', label: 'App ID', icon: <ShieldCheck className="w-4 h-4" />, type: 'text' },
        { id: 'collectionName', label: 'Collection Name', icon: <List className="w-4 h-4" />, type: 'text' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-zinc-950 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col relative">
                
                {/* Orbital Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none" />

                {/* Header */}
                <div className="bg-black/50 p-8 flex justify-between items-center shrink-0 border-b border-white/5 relative z-10 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-3 rounded-2xl border border-white/10 shadow-2xl">
                            <Settings className="text-cyan-400 w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">System <span className="text-cyan-400">Configure</span></h2>
                            <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mt-1">Core Environment Parameters</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 hover:scale-110 active:scale-95">
                        <X size={20} className="text-zinc-400 hover:text-white" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex px-8 py-2 bg-black/30 border-b border-white/5 shrink-0 relative z-10">
                    <button 
                        onClick={() => setActiveTab('database')}
                        className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'database' ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Database className="w-3.5 h-3.5" />
                            Pipeline Destination
                        </div>
                        {activeTab === 'database' && <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('ai')}
                        className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'ai' ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <div className="flex items-center gap-2">
                             <Sparkles className="w-3.5 h-3.5" />
                             Neural AI Engine
                        </div>
                        {activeTab === 'ai' && <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-purple-500 shadow-[0_0_10px_#a855f7]" />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto relative z-10">
                    <form onSubmit={handleSubmit} className="p-10 space-y-10">
                        {activeTab === 'database' ? (
                            <>
                                {/* Provider Selection */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Database className="w-4 h-4 text-cyan-400" /> Destination Provider
                                    </label>
                                    <div className="relative group/select">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-focus-within/select:text-cyan-400 transition-colors">
                                            <Database className="w-4 h-4" />
                                        </div>
                                        <select
                                            value={tempConfig.provider}
                                            onChange={(e) => setTempConfig({ ...tempConfig, provider: e.target.value as DatabaseProvider })}
                                            className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl pl-14 pr-12 py-4 outline-none focus:border-cyan-500/50 appearance-none font-black text-xs uppercase tracking-widest text-white transition-all hover:bg-zinc-900 cursor-pointer shadow-inner"
                                        >
                                            {providers.map(p => (
                                                <option key={p} value={p} className="bg-zinc-950 text-zinc-300 font-bold py-4">
                                                    SYSTEM: {p.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                                            <Zap className="w-3.5 h-3.5 fill-current" />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-white/5 w-full" />

                                {/* Dynamic Fields */}
                                {tempConfig.provider === 'Firebase' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2">
                                        {firebaseFields.map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    {f.icon} {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={`Enter ${f.label}...`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {tempConfig.provider === 'Supabase' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                <Database className="w-4 h-4" /> Supabase URL
                                            </label>
                                            <input
                                                required
                                                type="url"
                                                value={tempConfig.supabaseUrl || ''}
                                                onChange={(e) => setTempConfig({ ...tempConfig, supabaseUrl: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                placeholder="https://xxx.supabase.co"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                <Key className="w-4 h-4" /> Anon Key
                                            </label>
                                            <input
                                                required
                                                type="password"
                                                value={tempConfig.supabaseAnonKey || ''}
                                                onChange={(e) => setTempConfig({ ...tempConfig, supabaseAnonKey: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                placeholder="Enter Anon Key..."
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                <List className="w-4 h-4" /> Table Name
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                value={tempConfig.collectionName || ''}
                                                onChange={(e) => setTempConfig({ ...tempConfig, collectionName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                placeholder="users"
                                            />
                                        </div>
                                    </div>
                                )}

                                {!['Firebase', 'Supabase'].includes(tempConfig.provider) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2">
                                        {tempConfig.provider === 'MongoDB' && [
                                            { id: 'mongoApiUrl', label: 'MongoDB API URL', placeholder: 'https://data.mongodb-api.com/...', type: 'text' },
                                            { id: 'mongoApiKey', label: 'MongoDB API Key', placeholder: 'Enter API Key...', type: 'password' },
                                            { id: 'mongoDataSource', label: 'Cluster / Data Source', placeholder: 'Cluster0', type: 'text' },
                                            { id: 'mongoDatabaseName', label: 'Database Name', placeholder: 'my_database', type: 'text' },
                                            { id: 'collectionName', label: 'Collection Name', placeholder: 'csv_imports', type: 'text' }
                                        ].map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Key className="w-4 h-4" /> {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        ))}

                                        {tempConfig.provider === 'Appwrite' && [
                                            { id: 'appwriteEndpoint', label: 'Endpoint URL', placeholder: 'https://cloud.appwrite.io/v1', type: 'text' },
                                            { id: 'appwriteProjectId', label: 'Project ID', placeholder: 'Enter Project ID...', type: 'text' },
                                            { id: 'appwriteDatabaseId', label: 'Database ID', placeholder: 'Enter Database ID...', type: 'text' },
                                            { id: 'collectionName', label: 'Collection (Table) ID', placeholder: 'csv_imports', type: 'text' }
                                        ].map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Key className="w-4 h-4" /> {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        ))}

                                        {tempConfig.provider === 'PocketBase' && [
                                            { id: 'pocketbaseUrl', label: 'PocketBase URL', placeholder: 'http://127.0.0.1:8090', type: 'text' },
                                            { id: 'collectionName', label: 'Collection Name', placeholder: 'csv_imports', type: 'text' }
                                        ].map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Key className="w-4 h-4" /> {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        ))}

                                        {tempConfig.provider === 'AWS Amplify' && [
                                            { id: 'amplifyApiUrl', label: 'GraphQL API URL', placeholder: 'https://xxx.appsync-api.us-east-1.amazonaws.com/graphql', type: 'text' },
                                            { id: 'amplifyApiKey', label: 'API Key', placeholder: 'Enter API Key...', type: 'password' },
                                            { id: 'collectionName', label: 'Model/Table Name', placeholder: 'csv_imports', type: 'text' }
                                        ].map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Key className="w-4 h-4" /> {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        ))}

                                        {tempConfig.provider === 'Hostinger MySQL' && [
                                            { id: 'hostingerHost', label: 'MySQL Host', placeholder: 'sqlxxx.hostinger.com', type: 'text' },
                                            { id: 'hostingerDatabase', label: 'Database Name', placeholder: 'u123456789_db', type: 'text' },
                                            { id: 'hostingerUsername', label: 'Username', placeholder: 'u123456789_user', type: 'text' },
                                            { id: 'hostingerPassword', label: 'Password', placeholder: 'Enter Password...', type: 'password' },
                                            { id: 'collectionName', label: 'Table Name', placeholder: 'csv_imports', type: 'text' }
                                        ].map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Key className="w-4 h-4" /> {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        ))}

                                        {tempConfig.provider === 'PostgreSQL' && [
                                            { id: 'postgresHost', label: 'PostgreSQL Host', placeholder: 'localhost or postgres.example.com', type: 'text' },
                                            { id: 'postgresDatabase', label: 'Database Name', placeholder: 'my_postgres_db', type: 'text' },
                                            { id: 'postgresUsername', label: 'Username', placeholder: 'postgres', type: 'text' },
                                            { id: 'postgresPassword', label: 'Password', placeholder: 'Enter Password...', type: 'password' },
                                            { id: 'collectionName', label: 'Table Name', placeholder: 'csv_imports', type: 'text' }
                                        ].map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Key className="w-4 h-4" /> {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        ))}

                                        {tempConfig.provider === 'MySQL' && [
                                            { id: 'mysqlHost', label: 'MySQL Host', placeholder: 'localhost or mysql.example.com', type: 'text' },
                                            { id: 'mysqlDatabase', label: 'Database Name', placeholder: 'my_mysql_db', type: 'text' },
                                            { id: 'mysqlUsername', label: 'Username', placeholder: 'root', type: 'text' },
                                            { id: 'mysqlPassword', label: 'Password', placeholder: 'Enter Password...', type: 'password' },
                                            { id: 'collectionName', label: 'Table Name', placeholder: 'csv_imports', type: 'text' }
                                        ].map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Key className="w-4 h-4" /> {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        ))}

                                        {tempConfig.provider === 'Airtable' && [
                                            { id: 'airtableApiKey', label: 'Personal Access Token (PAT)', placeholder: 'pat...', type: 'password' },
                                            { id: 'airtableBaseId', label: 'Base ID', placeholder: 'app...', type: 'text' },
                                            { id: 'airtableTableName', label: 'Table Name', placeholder: 'csv_imports', type: 'text' },
                                            { id: 'collectionName', label: 'Sync Collection ID', placeholder: 'csv_imports', type: 'text' }
                                        ].map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Key className="w-4 h-4" /> {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        ))}

                                        {tempConfig.provider === 'Google Sheets' && [
                                            { id: 'googleSheetsApiKey', label: 'API Key', placeholder: 'AIzaSy...', type: 'password' },
                                            { id: 'googleSpreadsheetId', label: 'Spreadsheet ID', placeholder: '1abc123...', type: 'text' },
                                            { id: 'collectionName', label: 'Sheet (Tab) Name', placeholder: 'Sheet1', type: 'text' }
                                        ].map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Key className="w-4 h-4" /> {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        ))}

                                        {tempConfig.provider === 'Notion' && [
                                            { id: 'notionApiKey', label: 'Integration Token', placeholder: 'secret_...', type: 'password' },
                                            { id: 'notionDatabaseId', label: 'Database ID', placeholder: 'Enter Database ID...', type: 'text' },
                                            { id: 'collectionName', label: 'Sync Collection Name', placeholder: 'csv_imports', type: 'text' }
                                        ].map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Key className="w-4 h-4" /> {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        ))}

                                        {tempConfig.provider === 'Xano' && [
                                            { id: 'xanoApiUrl', label: 'Xano API URL', placeholder: 'https://xxx.xano.io/api:xxx', type: 'text' },
                                            { id: 'xanoApiKey', label: 'Xano API Key (Optional)', placeholder: 'Enter API Key if required...', type: 'password' },
                                            { id: 'collectionName', label: 'Table Name', placeholder: 'csv_imports', type: 'text' }
                                        ].map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Key className="w-4 h-4" /> {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        ))}

                                        {tempConfig.provider === 'Nhost' && [
                                            { id: 'nhostSubdomain', label: 'Subdomain', placeholder: 'xxxxxx', type: 'text' },
                                            { id: 'nhostRegion', label: 'Region', placeholder: 'us-east-1', type: 'text' },
                                            { id: 'collectionName', label: 'Table Name', placeholder: 'csv_imports', type: 'text' }
                                        ].map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Key className="w-4 h-4" /> {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        ))}

                                        {tempConfig.provider === 'Convex' && [
                                            { id: 'convexUrl', label: 'Convex Deployment URL', placeholder: 'https://xxx.convex.cloud', type: 'text' },
                                            { id: 'convexDeploymentKey', label: 'Deployment Key / Token', placeholder: 'Enter token...', type: 'password' },
                                            { id: 'collectionName', label: 'Table Name', placeholder: 'csv_imports', type: 'text' }
                                        ].map(f => (
                                            <div key={f.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Key className="w-4 h-4" /> {f.label}
                                                </label>
                                                <input
                                                    required
                                                    type={f.type}
                                                    value={(tempConfig as any)[f.id] || ''}
                                                    onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-cyan-500/50 transition-all font-bold text-white text-sm"
                                                    placeholder={f.placeholder}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            /* AI Engine Tab */
                            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 shadow-2xl">
                                            <Activity className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black uppercase text-white tracking-widest leading-none">Neural Core</h3>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Configure AI Analysis Parameters</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                <Key className="w-4 h-4 text-purple-400" /> Primary AI API Key
                                            </label>
                                            <input
                                                type="password"
                                                value={tempConfig.aiApiKey || ''}
                                                onChange={(e) => setTempConfig({ ...tempConfig, aiApiKey: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-purple-500/50 transition-all font-mono text-white text-sm"
                                                placeholder="Enter Google Gemini API Key..."
                                            />
                                            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Supports Gemini-Pro series for deep architectural analysis.</p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-purple-400" /> Intelligence Model Tier
                                            </label>
                                            <select
                                                value={tempConfig.aiModel || 'gemini-pro'}
                                                onChange={(e) => setTempConfig({ ...tempConfig, aiModel: e.target.value })}
                                                className="w-full bg-black border border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-purple-500/50 transition-all font-bold text-white text-sm appearance-none"
                                            >
                                                <option value="gemini-pro">GEMINI PRO (DEFAULT)</option>
                                                <option value="gemini-1.5-pro">GEMINI 1.5 PRO (HIGHEST)</option>
                                                <option value="gemini-1.5-flash">GEMINI 1.5 FLASH (TURBO)</option>
                                            </select>
                                        </div>

                                        <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-2xl flex items-start gap-4">
                                            <Sparkles className="w-6 h-6 text-purple-400 shrink-0" />
                                            <div>
                                                <h4 className="text-xs font-black text-white uppercase mb-1">AI Enabled Features</h4>
                                                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                                                    Enabling the AI Core unlocks Deep Code Analysis, Predictive Mapping, and Autonomous Error Resolution protocols. Files never leave your local session.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-black flex gap-4 shrink-0 relative z-10 backdrop-blur-xl">
                    <button 
                        onClick={handleSubmit} 
                        className="flex-1 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                    >
                        <Zap className="w-4 h-4 fill-current" />
                        Save Configuration
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                    >
                        Discard
                    </button>
                </div>
            </div>
        </div>
    );
};
