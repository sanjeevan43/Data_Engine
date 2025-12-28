import React, { useMemo, useState } from 'react';
import { Search, Download, Trash2, FileText } from 'lucide-react';

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
            <div className="bg-white p-32 rounded-[3.5rem] text-center border-4 border-dashed border-slate-200 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="space-y-6 relative z-10">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto border-4 border-indigo-100">
                        <FileText className="w-12 h-12 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 mb-2">Pipeline Ready</h3>
                        <p className="text-slate-400 font-medium max-w-md mx-auto">
                            The smart mapping engine is waiting for input. Drag a CSV file above to begin.
                        </p>
                    </div>
                </div>
                <div className="absolute inset-0 bg-slate-50/50 -skew-y-3 transform origin-bottom-right opacity-50"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-200">
            <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
                <div className="relative flex-1 w-full flex items-center group">
                    <Search className="absolute left-6 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-300"
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button onClick={exportToCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all hover:scale-105 active:scale-95">
                        <Download className="w-5 h-5" /> Export
                    </button>
                    <button
                        onClick={onPurge}
                        disabled={isPurging}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-5 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-200 hover:shadow-red-300 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100"
                    >
                        {isPurging ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Trash2 className="w-5 h-5" /> Purge
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto scrollbar-custom max-h-[800px]">
                    <table className="w-full whitespace-nowrap">
                        <thead className="sticky top-0 bg-slate-950 z-10 shadow-lg">
                            <tr>
                                {headers.map(h => (
                                    <th key={h} className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredData.slice(0, 100).map((row, idx) => (
                                <tr key={row.id || idx} className="hover:bg-blue-50/20 transition-colors group">
                                    {headers.map(k => {
                                        const cellValue = row[k] || '—';
                                        // Sanitize the cell value to prevent XSS
                                        const sanitizedValue = typeof cellValue === 'string' 
                                            ? cellValue.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
                                            : String(cellValue);
                                        
                                        return (
                                            <td key={k} className="px-8 py-6 text-base font-bold text-slate-700 group-hover:text-blue-900">
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
                    {filteredData.length > 100 && (
                        <div className="p-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50">
                            Showing first 100 of {filteredData.length} records
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
