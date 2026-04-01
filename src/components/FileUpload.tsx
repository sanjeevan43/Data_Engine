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
        <div className="relative w-full">
            {/* Animated background gradient */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-20 blur-xl animate-pulse"></div>

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border border-dashed rounded-[2rem] p-16 text-center transition-all duration-300 cursor-pointer group overflow-hidden ${isDragging
                    ? 'border-cyan-500 bg-cyan-500/10 scale-[1.02] shadow-[0_0_40px_rgba(6,182,212,0.2)]'
                    : uploadedFiles.length > 0
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-white/20 bg-black hover:border-cyan-400 hover:bg-cyan-500/5'
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

                        <div className={`p-6 rounded-2xl transition-all duration-300 border ${uploadedFiles.length > 0
                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(52,211,153,0.3)]'
                            : isDragging
                                ? 'bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
                                : 'bg-zinc-900 border-white/10 group-hover:border-cyan-500/30'
                            }`}>
                            {uploadedFiles.length > 0 ? (
                                <CheckCircle className="w-10 h-10 text-emerald-400" />
                            ) : isUploading ? (
                                <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Upload className={`w-10 h-10 transition-all duration-300 ${isDragging ? 'text-cyan-400 animate-bounce' : 'text-zinc-500 group-hover:text-cyan-400'
                                    }`} />
                            )}
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="space-y-3">
                        <h3 className={`text-xl font-bold transition-all duration-300 ${uploadedFiles.length > 0
                            ? 'text-emerald-400'
                            : 'text-white group-hover:text-cyan-400'
                            }`}>
                            {uploadedFiles.length > 0 ? `${uploadedFiles.length} File${uploadedFiles.length > 1 ? 's' : ''} Uploaded` : isDragging ? 'Drop files here' : 'Select CSV Files'}
                        </h3>

                        {uploadedFiles.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {uploadedFiles.slice(0, 3).map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-center gap-2 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                                        <FileText className="w-4 h-4" />
                                        <span className="text-sm font-medium">{file.name}</span>
                                    </div>
                                ))}
                                {uploadedFiles.length > 3 && (
                                    <div className="text-sm text-emerald-400 font-medium pt-2">
                                        +{uploadedFiles.length - 3} more file{uploadedFiles.length - 3 > 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-zinc-400 text-sm">
                                    {isDragging ? (
                                        'Release to select'
                                    ) : (
                                        <>
                                            Drag and drop your files or{' '}
                                            <span className="text-cyan-400 font-semibold hover:underline">
                                                browse
                                            </span>
                                        </>
                                    )}
                                </p>
                                <div className="inline-flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900 border border-white/5 px-4 py-2 rounded-lg">
                                    <FileText className="w-3 h-3" />
                                    CSV (UTF-8) • Multiple Allowed
                                </div>
                            </div>
                        )}
                    </div>
                </label>

                {/* Upload more files button */}
                {uploadedFiles.length > 0 && !isUploading && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            const input = document.getElementById('csv-upload') as HTMLInputElement;
                            if (input) input.click();
                        }}
                        className="mt-8 px-6 py-2.5 bg-black text-white font-semibold rounded-xl border border-white/10 hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-300 relative z-20"
                    >
                        + Add More Files
                    </button>
                )}
            </div>
        </div>
    );
};
