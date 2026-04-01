import React, { useMemo, useState } from 'react';
import { Search, Download, Trash2, FileText, Loader2 } from 'lucide-react';

interface DataGridProps {
    data: any[];
    onPurge: () => void;
    isPurging: boolean;
    collectionName: string;
}

export const DataGrid: React.FC<DataGridProps> = ({ data, onPurge, isPurging, collectionName }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const headers = useMemo(() => {
        if (data.length === 0) return [];
        return Object.keys(data[0]).filter(k => !['id', '_fileName', '_uploadedAt'].includes(k));
    }, [data]);

    const filteredData = useMemo(() => {
        return data.filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase())));
    }, [data, searchTerm]);

    const PAGE_SIZE = 100;
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const displayedData = useMemo(() => {
        return filteredData.slice(0, visibleCount);
    }, [filteredData, visibleCount]);

    const exportToCSV = () => {
        if (data.length === 0) return;
        
        const sanitizeCSVValue = (value: any): string => {
            const str = String(value || '');
            // Prevent CSV injection by sanitizing values that start with dangerous characters
            if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
                return `'${str}`; // Prefix with single quote to neutralize
            }
            return str.replace(/"/g, '""'); // Escape quotes
        };
        
        const headerRow = headers.join(',');
        const rows = data.map(row => 
            headers.map(h => `"${sanitizeCSVValue(row[h])}"`).join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${collectionName}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (data.length === 0) {
        return (
            <div className="bg-black/40 backdrop-blur-xl p-32 rounded-[3.5rem] text-center border border-white/10 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="space-y-6 relative z-10">
                    <div className="w-24 h-24 bg-cyan-900/20 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                        <FileText className="w-12 h-12 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white mb-2">Pipeline Ready</h3>
                        <p className="text-zinc-400 font-medium max-w-md mx-auto">
                            The smart mapping engine is waiting for input. Drag a CSV file above to begin.
                        </p>
                    </div>
                </div>
                <div className="absolute inset-0 bg-cyan-500/5 -skew-y-3 transform origin-bottom-right opacity-50"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-200">
            <div className="flex flex-col md:flex-row gap-6 items-center bg-black/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/10">
                <div className="relative flex-1 w-full flex items-center group">
                    <Search className="absolute left-6 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-zinc-900/80 rounded-2xl font-bold text-lg text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-zinc-900 transition-all placeholder:text-zinc-600 border border-white/5 shadow-inner"
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button onClick={exportToCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-5 bg-zinc-900 text-zinc-200 font-black rounded-2xl hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 border border-white/5">
                        <Download className="w-5 h-5" /> Export
                    </button>
                    {onPurge && (
                        <button
                            onClick={onPurge}
                            disabled={isPurging}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-5 bg-red-500/10 text-red-500 font-black rounded-2xl hover:bg-red-500/20 transition-all border border-red-500/20 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100"
                        >
                            {isPurging ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="w-5 h-5" /> Purge
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/40 overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"></div>
                <div className="overflow-x-auto scrollbar-custom max-h-[800px]">
                    <table className="w-full whitespace-nowrap">
                        <thead className="sticky top-0 bg-black/90 backdrop-blur-md z-10 shadow-lg border-b border-white/10">
                            <tr>
                                {headers.map(h => (
                                    <th key={h} className="px-8 py-6 text-left text-[10px] font-black text-cyan-500 uppercase tracking-widest border-b border-white/5">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayedData.map((row, idx) => (
                                <tr key={row.id || idx} className="hover:bg-cyan-500/5 transition-colors group">
                                    {headers.map(k => {
                                        const cellValue = row[k] || '—';
                                        const sanitizedValue = typeof cellValue === 'string' 
                                            ? cellValue.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
                                            : String(cellValue);
                                        
                                        return (
                                            <td key={k} className="px-8 py-6 text-base font-bold text-zinc-300 group-hover:text-white">
                                                <span title={String(cellValue)}>
                                                    {sanitizedValue.length > 50 ? `${sanitizedValue.substring(0, 50)}...` : sanitizedValue}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {visibleCount < filteredData.length && (
                        <div className="p-8 text-center">
                            <button
                                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                                className="px-6 py-3 bg-zinc-900 text-cyan-400 font-bold rounded-xl border border-white/5 hover:bg-zinc-800 transition-all"
                            >
                                Load More Records ({filteredData.length - visibleCount} remaining)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
