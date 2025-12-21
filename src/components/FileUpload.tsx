import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, Sparkles } from 'lucide-react';

interface FileUploadProps {
    onFileSelect: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'text/csv');
            if (files.length > 0) {
                setIsUploading(true);
                setUploadedFiles(prev => [...prev, ...files]);
                await onFileSelect(files);
                setIsUploading(false);
            } else {
                alert('Please upload valid CSV files');
            }
        },
        [onFileSelect]
    );

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setIsUploading(true);
            setUploadedFiles(prev => [...prev, ...files]);
            await onFileSelect(files);
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    return (
        <div className="relative">
            {/* Animated background gradient */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl opacity-20 blur-xl animate-pulse"></div>

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group overflow-hidden ${isDragging
                    ? 'border-blue-500 bg-blue-50 scale-105 shadow-2xl'
                    : uploadedFiles.length > 0
                        ? 'border-green-400 bg-green-50/50'
                        : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/30 hover:shadow-xl'
                    }`}
            >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent shimmer"></div>
                </div>

                <input
                    type="file"
                    accept=".csv"
                    multiple
                    onChange={handleChange}
                    className="hidden"
                    id="csv-upload"
                />

                <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center relative z-10">
                    {/* Icon container with animation */}
                    <div className={`relative mb-6 transition-all duration-500 ${isDragging ? 'scale-110' : uploadedFiles.length > 0 ? 'scale-100' : 'group-hover:scale-110'
                        }`}>
                        {/* Orbiting sparkles */}
                        {uploadedFiles.length === 0 && (
                            <>
                                <Sparkles className="w-4 h-4 text-purple-400 absolute -top-2 -right-2 animate-pulse" />
                                <Sparkles className="w-3 h-3 text-blue-400 absolute -bottom-1 -left-3 animate-pulse delay-300" />
                            </>
                        )}

                        <div className={`p-6 rounded-full transition-all duration-300 ${uploadedFiles.length > 0
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/50'
                            : isDragging
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50'
                                : 'bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200'
                            }`}>
                            {uploadedFiles.length > 0 ? (
                                <CheckCircle className="w-12 h-12 text-white" />
                            ) : isUploading ? (
                                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Upload className={`w-12 h-12 transition-all duration-300 ${isDragging ? 'text-white animate-bounce' : 'text-blue-600 group-hover:text-purple-600'
                                    }`} />
                            )}
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="space-y-3">
                        <h3 className={`text-2xl font-bold transition-all duration-300 ${uploadedFiles.length > 0
                            ? 'text-green-700'
                            : 'text-slate-800 group-hover:text-gradient-primary'
                            }`}>
                            {uploadedFiles.length > 0 ? `${uploadedFiles.length} File${uploadedFiles.length > 1 ? 's' : ''} Uploaded!` : isDragging ? 'Drop files here!' : 'Upload CSV Files'}
                        </h3>

                        {uploadedFiles.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {uploadedFiles.slice(0, 3).map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-center gap-2 text-green-600 bg-green-100 px-4 py-2 rounded-full">
                                        <FileText className="w-4 h-4" />
                                        <span className="text-sm font-medium">{file.name}</span>
                                    </div>
                                ))}
                                {uploadedFiles.length > 3 && (
                                    <div className="text-sm text-green-600 font-medium">
                                        +{uploadedFiles.length - 3} more file{uploadedFiles.length - 3 > 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <p className="text-slate-600 text-lg">
                                    {isDragging ? (
                                        'Release to upload'
                                    ) : (
                                        <>
                                            Drag and drop or{' '}
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold">
                                                browse
                                            </span>
                                        </>
                                    )}
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-4 bg-slate-50 px-4 py-2 rounded-full">
                                    <FileText className="w-4 h-4" />
                                    <span>Supported: CSV (UTF-8) • Multiple files allowed</span>
                                </div>
                            </>
                        )}
                    </div>
                </label>

                {/* Upload more files button */}
                {uploadedFiles.length > 0 && !isUploading && (
                    <button
                        onClick={() => {
                            const input = document.getElementById('csv-upload') as HTMLInputElement;
                            if (input) input.click();
                        }}
                        className="mt-6 px-6 py-2 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 hover:shadow-md"
                    >
                        Upload More Files
                    </button>
                )}
            </div>
        </div>
    );
};
