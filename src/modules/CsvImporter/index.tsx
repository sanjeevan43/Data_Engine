import React from 'react';
import { useCsvImporter } from './hooks/useCsvImporter';
import { FileUpload } from './components/FileUpload';
import { FieldMapper } from './components/FieldMapper';
import { ImportSummary } from './components/ImportSummary';
import { ArrowRight } from 'lucide-react';

export const CsvImporterModule: React.FC = () => {
    const {
        status,
        file,
        mappings,
        collectionName,
        setMappings,
        setCollectionName,
        handleFileSelect,
        startImport,
        progress,
        summary,
        reset
    } = useCsvImporter();

    if (status === 'complete' && summary) {
        return <ImportSummary summary={summary} onReset={reset} />;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white rounded-2xl shadow-xl border border-slate-100">
            <header className="border-b border-slate-100 pb-6">
                <h1 className="text-2xl font-bold text-slate-900">Import CSV to Firebase</h1>
                <p className="text-slate-500">Bulk upload data to your Firestore collection properly.</p>
            </header>

            {/* STEP 1: UPLOAD */}
            {status === 'upload' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <FileUpload onFileSelect={handleFileSelect} />
                </div>
            )}

            {/* STEP 2: MAPPING */}
            {status === 'mapping' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Target Collection</label>
                            <input
                                type="text"
                                value={collectionName}
                                onChange={(e) => setCollectionName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. users"
                            />
                        </div>
                        <div className="text-sm text-slate-400 pb-3">File: {file?.name}</div>
                    </div>

                    <FieldMapper
                        headers={[]} // Using mappings directly
                        mappings={mappings}
                        onMappingChange={setMappings}
                    />

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={startImport}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
                        >
                            Start Import <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: IMPORTING */}
            {status === 'importing' && (
                <div className="py-20 text-center animate-in fade-in zoom-in duration-300">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-blue-600 transition-all duration-300"
                                strokeDasharray={251.2}
                                strokeDashoffset={251.2 - (progress / 100) * 251.2}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-700">
                            {progress}%
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800">Importing Data...</h3>
                    <p className="text-slate-500 mt-2">Please do not close this window.</p>
                </div>
            )}
        </div>
    );
};
