import { useState, useMemo } from 'react';
import { Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { useFirebase } from './context/FirebaseContext';
import { useCsvImporter } from './hooks/useCsvImporter';
import { useCollectionData } from './hooks/useCollectionData';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { Stats } from './components/Stats';
import { DataGrid } from './components/DataGrid';
import { MappingModal } from './components/MappingModal';
import { SupportedDatabases } from './components/SupportedDatabases';

function App() {
  const { config, isConnected } = useFirebase();
  const { data, error: dataError, isPurging, purge } = useCollectionData();
  const importer = useCsvImporter();

  const [showSettings, setShowSettings] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<import('./context/FirebaseContext').DatabaseProvider | undefined>(undefined);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Derived state
  const uniqueFilesCount = useMemo(() => {
    return new Set(data.map(row => row._fileName || 'Cloud Source')).size;
  }, [data]);

  // Handlers
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
    <div className="min-h-screen">
      {/* Mapping Modal - Shows when files are parsed */}
      {importer.processedFiles.length > 0 && (
        <MappingModal
          fileName={importer.processedFiles.length === 1
            ? importer.processedFiles[0].file.name
            : `${importer.processedFiles.length} files`}
          rowCount={importer.processedFiles.reduce((sum, pf) => sum + pf.file.data.length, 0)}
          mapping={importer.processedFiles[0]?.mapping || []}
          onUpdateMapping={(newMapping) => {
            if (importer.processedFiles.length > 0) {
              importer.updateMapping(0, newMapping);
            }
          }}
          onCommit={handleCommit}
          onCancel={importer.reset}
          isImporting={importer.isImporting}
          collectionName={config.collectionName}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          initialProvider={selectedProvider}
        />
      )}

      {/* Success Toast */}
      {showSuccessToast && importer.successCount && (
        <div className="fixed top-8 right-8 z-[120] animate-in slide-in-from-right-full">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 p-6 flex items-center gap-5">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg">
              <CheckCircle2 className="text-white" />
            </div>
            <div>
              <h4 className="font-black text-slate-900">Import Success</h4>
              <p className="text-slate-500 font-medium">{importer.successCount} records committed.</p>
            </div>
          </div>
        </div>
      )}

      <Header onOpenSettings={() => setShowSettings(true)} />

      <main className="max-w-7xl mx-auto px-10 -mt-24 pb-32 space-y-12">
        {/* Error Display */}
        {(importer.error || dataError) && (
          <div className="bg-white border-l-[12px] border-red-500 p-8 rounded-3xl shadow-2xl flex items-center justify-between animate-in slide-in-from-top-6">
            <div className="flex items-center gap-6">
              <div className="bg-red-50 p-4 rounded-xl">
                <AlertCircle className="text-red-500" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">System Alert</h3>
                <p className="text-slate-500 font-medium">{importer.error || dataError}</p>
              </div>
            </div>
            {!isConnected && (
              <button onClick={() => setShowSettings(true)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black">
                Fix Settings
              </button>
            )}
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-white p-3 rounded-[3.5rem] shadow-2xl border border-slate-100">
          <FileUpload onFileSelect={handleFileSelect} />
        </div>

        {/* Database Offline Warning */}
        {!isConnected && (
          <div className="bg-white/50 backdrop-blur-sm p-12 rounded-[2.5rem] text-center border shadow-xl space-y-6">
            <div className="inline-block p-6 bg-slate-50 rounded-2xl border">
              <Database className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900">Database Offline</h2>
              <p className="text-lg text-slate-400 max-w-lg mx-auto">
                Connect your Firebase project to enable cloud synchronization and live data management.
              </p>
            </div>
            <button onClick={() => setShowSettings(true)} className="btn-primary py-4 px-10 text-lg">
              Setup Connection
            </button>
          </div>
        )}

        {isConnected && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Stats
              isDbConnected={isConnected}
              totalStorage={data.length}
              collectionName={config.collectionName}
              uniqueFilesCount={uniqueFilesCount}
            />

            <DataGrid
              data={data}
              onPurge={purge}
              isPurging={isPurging}
              collectionName={config.collectionName}
            />
          </div>
        )}
      </main>

      <SupportedDatabases
        onSelectDatabase={(provider) => {
          setSelectedProvider(provider);
          setShowSettings(true);
        }}
      />

      <footer className="bg-slate-950 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Database className="text-blue-500" />
            <span className="text-2xl font-black text-white tracking-tighter">DATA ENGINE PRO</span>
          </div>
          <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">
            Dynamic Ingestion & Field Mapping Active
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
