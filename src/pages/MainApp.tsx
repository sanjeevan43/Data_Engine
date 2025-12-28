import { useState, useMemo } from 'react';
import { Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { FileUpload } from '../components/FileUpload';
import { Header } from '../components/Header';
import { SettingsModal } from '../components/SettingsModal';
import { MappingModal } from '../components/MappingModal';
import { Stats } from '../components/Stats';
import { DataGrid } from '../components/DataGrid';
import { SupportedDatabases } from '../components/SupportedDatabases';
import { DataImportChatbot } from '../components/DataImportChatbot';
import { useFirebase } from '../context/FirebaseContext';
import { useCsvImporter } from '../hooks/useCsvImporter';
import { useCollectionData } from '../hooks/useCollectionData';
import type { DatabaseProvider } from '../context/FirebaseContext';

/**
 * Main application page – displayed after the user clicks "Get Started" on the landing page.
 * It contains the full CSV‑import workflow: upload, preview, stats, and a button to commit the data.
 */
export default function MainApp() {
    const { config, isConnected } = useFirebase();
    const { data, error: dataError, isPurging, purge } = useCollectionData();
    const importer = useCsvImporter();

    const [showSettings, setShowSettings] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<DatabaseProvider | undefined>(undefined);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    // Derived state – unique file count for stats
    const uniqueFilesCount = useMemo(
        () => new Set(data.map(row => (row as any)._fileName || 'Cloud Source')).size,
        [data],
    );

    // Handlers ----------------------------------------------------------
    const handleFileSelect = async (files: File[]) => {
        await importer.parseMultipleFiles(files);
    };

    const handleCommit = async () => {
        await importer.commit();
        if (!importer.error) {
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 5000);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            {/* Mapping modal – appears after files are parsed */}
            {importer.processedFiles.length > 0 && (
                <MappingModal
                    fileName={importer.processedFiles.length === 1 ? importer.processedFiles[0].file.name : `${importer.processedFiles.length} files`}
                    rowCount={importer.processedFiles.reduce((sum, pf) => sum + pf.file.data.length, 0)}
                    mapping={importer.processedFiles[0]?.mapping || []}
                    onUpdateMapping={(index, updates) => {
                        if (importer.processedFiles.length > 0) {
                            const cur = importer.processedFiles[0].mapping;
                            const newMap = cur.map((field, i) => (i === index ? { ...field, ...updates } : field));
                            importer.updateMapping(0, newMap);
                        }
                    }}
                    onCommit={handleCommit}
                    onCancel={importer.reset}
                    isImporting={importer.isImporting}
                    collectionName={config.collectionName}
                />
            )}

            {/* Settings modal */}
            {showSettings && (
                <SettingsModal onClose={() => setShowSettings(false)} initialProvider={selectedProvider} />
            )}

            {/* Success toast */}
            {showSuccessToast && importer.successCount && (
                <div className="fixed top-8 right-8 z-[120] animate-in slide-in-from-right-full">
                    <div className="glass bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-200 p-6 flex items-center gap-5">
                        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-4 rounded-2xl shadow-lg">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 text-lg">Import Successful!</h4>
                            <p className="text-slate-600 font-medium">{importer.successCount} records imported</p>
                        </div>
                    </div>
                </div>
            )}

            <Header onOpenSettings={() => setShowSettings(true)} />

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 -mt-20 space-y-12">
                {/* Error banner */}
                {(importer.error || dataError) && (
                    <div className="glass bg-red-500/10 backdrop-blur-xl border-l-8 border-red-500 p-8 rounded-3xl shadow-2xl flex items-center justify-between animate-in slide-in-from-top-6">
                        <div className="flex items-center gap-6">
                            <div className="bg-red-500/20 p-5 rounded-2xl">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-black text-white text-xl mb-1">System Alert</h3>
                                <p className="text-red-200 font-medium">{importer.error || dataError}</p>
                            </div>
                        </div>
                        {!isConnected && (
                            <button onClick={() => setShowSettings(true)} className="px-8 py-4 bg-white text-red-600 rounded-2xl font-black hover:bg-red-50 transition-all transform hover:scale-105 shadow-xl">
                                Fix Settings
                            </button>
                        )}
                    </div>
                )}

                {/* File upload area */}
                <div className="bg-white p-3 rounded-[3.5rem] shadow-2xl border border-slate-100">
                    <FileUpload onFileSelect={handleFileSelect} />
                </div>

                {/* Offline warning */}
                {!isConnected && (
                    <div className="bg-white/50 backdrop-blur-sm p-12 rounded-[2.5rem] text-center border shadow-xl space-y-6">
                        <div className="inline-block p-6 bg-slate-50 rounded-2xl border mb-8">
                            <Database className="w-12 h-12 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">Database Offline</h2>
                        <p className="text-lg text-slate-400 max-w-lg mx-auto">
                            Connect your Firebase project to enable cloud synchronization and live data management.
                        </p>
                        <button onClick={() => setShowSettings(true)} className="btn-primary py-4 px-10 text-lg">
                            Setup Connection
                        </button>
                    </div>
                )}

                {/* When DB is connected – stats, import button, grid */}
                {isConnected && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <Stats
                            isDbConnected={isConnected}
                            totalStorage={data.length}
                            collectionName={config.collectionName}
                            uniqueFilesCount={uniqueFilesCount}
                        />
                        {/* Import Data button */}
                        <button
                            onClick={handleCommit}
                            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all"
                        >
                            Import Data to Database
                        </button>
                        <DataGrid data={data} onPurge={purge} isPurging={isPurging} collectionName={config.collectionName} />
                    </div>
                )}

                {/* AI Chatbot – always rendered (hidden when closed internally) */}
                <DataImportChatbot
                    csvHeaders={importer.processedFiles.length > 0 && importer.processedFiles[0].file.data[0] ? Object.keys(importer.processedFiles[0].file.data[0]) : []}
                    currentMapping={importer.processedFiles[0]?.mapping || []}
                    onSuggestion={suggestion => {
                        // Apply chatbot suggestions to the mapping
                        if (importer.processedFiles.length === 0) return;

                        const currentMapping = importer.processedFiles[0].mapping;
                        const fieldIndex = currentMapping.findIndex(f => f.csvHeader === suggestion.field);

                        if (fieldIndex === -1) return;

                        const updatedMapping = [...currentMapping];

                        switch (suggestion.type) {
                            case 'primary-key':
                                // Set this field as primary key, unset others
                                updatedMapping.forEach((field, idx) => {
                                    field.isPrimaryKey = idx === fieldIndex;
                                });
                                break;

                            case 'data-type':
                                // Set the data type for this field
                                updatedMapping[fieldIndex].dataType = suggestion.value;
                                break;

                            case 'foreign-key':
                                // Set foreign key configuration
                                updatedMapping[fieldIndex].isForeignKey = true;
                                updatedMapping[fieldIndex].foreignKeyTable = suggestion.value.table;
                                updatedMapping[fieldIndex].foreignKeyField = suggestion.value.field;
                                break;

                            case 'mapping':
                                // Update field mapping
                                updatedMapping[fieldIndex].firestoreField = suggestion.value;
                                break;
                        }

                        // Apply the updated mapping
                        importer.updateMapping(0, updatedMapping);
                        console.log(`✅ Applied suggestion: ${suggestion.type} for ${suggestion.field}`, suggestion);
                    }}
                />
            </main>

            {/* Supported databases footer */}
            <SupportedDatabases
                onSelectDatabase={provider => {
                    setSelectedProvider(provider);
                    setShowSettings(true);
                }}
            />

            {/* Page footer */}
            <footer className="bg-slate-950/50 backdrop-blur-xl py-16 border-t border-white/10 mt-32">
                <div className="max-w-7xl mx-auto px-10 text-center">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <Database className="w-8 h-8 text-blue-400" />
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">SmartImport</span>
                    </div>
                    <p className="text-blue-300 font-bold uppercase tracking-widest text-sm">
                        AI-Powered CSV Import System • Built with ❤️
                    </p>
                </div>
            </footer>
        </div>
    );
}
