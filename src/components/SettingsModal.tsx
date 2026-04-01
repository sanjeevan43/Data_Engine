import React, { useState } from 'react';
import { Settings, X, Key, Layout, ShieldCheck, List, Database } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import type { FirebaseConfig, DatabaseProvider } from '../context/FirebaseContext';

interface SettingsModalProps {
    onClose: () => void;
    initialProvider?: DatabaseProvider;
}



export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, initialProvider }) => {
    const { config, updateConfig } = useFirebase();
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
            <div className="w-full max-w-2xl bg-zinc-950 backdrop-blur-3xl rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col relative">
                {/* Glowing Top line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                <div className="bg-black p-8 flex justify-between items-center shrink-0 border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20 shadow-md">
                            <Settings className="text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Pipeline Configuration</h2>
                            <p className="text-zinc-500 font-medium text-sm">Configure your destination database</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10">
                        <X size={24} className="text-zinc-400 hover:text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto flex-1">

                    {/* Provider Selection */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Database className="w-4 h-4" /> Database Provider
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {providers.map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setTempConfig({ ...tempConfig, provider: p })}
                                    className={`px-4 py-3 rounded-xl border font-bold text-sm transition-all duration-300 ${tempConfig.provider === p
                                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                                        : 'border-white/5 bg-zinc-900/50 text-zinc-400 hover:border-white/20 hover:bg-zinc-800 hover:text-zinc-200'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    {/* Dynamic Fields */}
                    {tempConfig.provider === 'Firebase' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {firebaseFields.map(f => (
                                <div key={f.id} className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        {f.icon} {f.label}
                                    </label>
                                    <input
                                        required
                                        type={f.type}
                                        value={(tempConfig as any)[f.id] || ''}
                                        onChange={(e) => setTempConfig({ ...tempConfig, [f.id]: e.target.value })}
                                        className="input-premium"
                                        placeholder={`Enter ${f.label}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {tempConfig.provider === 'Supabase' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Database className="w-4 h-4" /> Supabase URL
                                </label>
                                <input
                                    required
                                    type="url"
                                    value={tempConfig.supabaseUrl || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, supabaseUrl: e.target.value })}
                                    className="input-premium"
                                    placeholder="https://xxx.supabase.co"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Key className="w-4 h-4" /> Anon Key
                                </label>
                                <input
                                    required
                                    type="password"
                                    value={tempConfig.supabaseAnonKey || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, supabaseAnonKey: e.target.value })}
                                    className="input-premium"
                                    placeholder="Enter Anon Key..."
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <List className="w-4 h-4" /> Table Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={tempConfig.collectionName || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, collectionName: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="users"
                                />
                            </div>
                        </div>
                    )}

                    {tempConfig.provider === 'AWS Amplify' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Database className="w-4 h-4" /> GraphQL API URL
                                </label>
                                <input
                                    required
                                    type="url"
                                    value={tempConfig.amplifyApiUrl || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, amplifyApiUrl: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Key className="w-4 h-4" /> API Key
                                </label>
                                <input
                                    required
                                    type="password"
                                    value={tempConfig.amplifyApiKey || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, amplifyApiKey: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="da2-xxxxx..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Layout className="w-4 h-4" /> AWS Region
                                </label>
                                <input
                                    type="text"
                                    value={tempConfig.amplifyRegion || 'us-east-1'}
                                    onChange={(e) => setTempConfig({ ...tempConfig, amplifyRegion: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="us-east-1"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <List className="w-4 h-4" /> Model/Table Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={tempConfig.collectionName || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, collectionName: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="User"
                                />
                            </div>
                            <div className="md:col-span-2 bg-black border border-cyan-500/20 rounded-xl p-4">
                                <p className="text-sm text-cyan-500 font-medium">
                                    💡 <strong>Tip:</strong> Make sure your GraphQL API has the appropriate schema and mutation/query operations for the model name specified above.
                                </p>
                            </div>
                        </div>
                    )}

                    {tempConfig.provider === 'Appwrite' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Database className="w-4 h-4" /> Appwrite Endpoint
                                </label>
                                <input
                                    required
                                    type="url"
                                    value={tempConfig.appwriteEndpoint || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, appwriteEndpoint: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="https://cloud.appwrite.io/v1"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Layout className="w-4 h-4" /> Project ID
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={tempConfig.appwriteProjectId || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, appwriteProjectId: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="your-project-id"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Database className="w-4 h-4" /> Database ID
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={tempConfig.appwriteDatabaseId || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, appwriteDatabaseId: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="your-database-id"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <List className="w-4 h-4" /> Collection Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={tempConfig.collectionName || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, collectionName: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="users"
                                />
                            </div>
                        </div>
                    )}

                    {tempConfig.provider === 'MongoDB' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Database className="w-4 h-4" /> MongoDB Data API URL
                                </label>
                                <input
                                    required
                                    type="url"
                                    value={tempConfig.mongoApiUrl || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, mongoApiUrl: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="https://data.mongodb-api.com/app/your-app-id/endpoint/data/v1"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Key className="w-4 h-4" /> API Key
                                </label>
                                <input
                                    required
                                    type="password"
                                    value={tempConfig.mongoApiKey || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, mongoApiKey: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Your API Key..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Database className="w-4 h-4" /> Data Source
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={tempConfig.mongoDataSource || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, mongoDataSource: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Cluster0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Database className="w-4 h-4" /> Database Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={tempConfig.mongoDatabaseName || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, mongoDatabaseName: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="myDatabase"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <List className="w-4 h-4" /> Collection Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={tempConfig.collectionName || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, collectionName: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="users"
                                />
                            </div>
                        </div>
                    )}

                    {tempConfig.provider === 'PocketBase' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Database className="w-4 h-4" /> PocketBase URL
                                </label>
                                <input
                                    required
                                    type="url"
                                    value={tempConfig.pocketbaseUrl || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, pocketbaseUrl: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="http://127.0.0.1:8090 or https://your-pocketbase.com"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <List className="w-4 h-4" /> Collection Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={tempConfig.collectionName || ''}
                                    onChange={(e) => setTempConfig({ ...tempConfig, collectionName: e.target.value })}
                                    className="input-premium"
                                    placeholder="users"
                                />
                            </div>
                            <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-900 font-medium">
                                    💡 <strong>Tip:</strong> Make sure your PocketBase instance is running and the collection exists with the correct permissions.
                                </p>
                            </div>
                        </div>
                    )}

                    {!['Firebase', 'Supabase', 'AWS Amplify', 'Appwrite', 'MongoDB', 'PocketBase'].includes(tempConfig.provider) && (
                        <div className="text-center py-12 bg-zinc-900/30 rounded-3xl border border-dashed border-white/10">
                            <div className="inline-block p-4 bg-black rounded-xl shadow-sm mb-4 border border-white/5">
                                <Database className="w-8 h-8 text-zinc-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Config for {tempConfig.provider}</h3>
                            <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
                                All major database providers are now supported!
                                Please select Firebase, Supabase, AWS Amplify, MongoDB, Appwrite, or PocketBase.
                            </p>
                        </div>
                    )}

                </form>

                <div className="p-8 border-t border-white/5 bg-black flex gap-4 shrink-0 flex-col sm:flex-row relative z-10">
                    <button type="submit" onClick={handleSubmit} className="btn-primary flex-1">
                        Save {tempConfig.provider} Pipeline
                    </button>
                    <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
