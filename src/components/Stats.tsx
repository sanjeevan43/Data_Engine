import React, { useMemo } from 'react';
import { Globe, Users, List, FileText } from 'lucide-react';

interface StatsProps {
    isDbConnected: boolean;
    totalStorage: number;
    collectionName: string;
    uniqueFilesCount: number;
}

export const Stats: React.FC<StatsProps> = ({ isDbConnected, totalStorage, collectionName, uniqueFilesCount }) => {
    const stats = useMemo(() => [
        { label: 'Status', val: isDbConnected ? 'Online' : 'Offline', icon: <Globe />, color: 'from-blue-500 to-indigo-600' },
        { label: 'In Storage', val: totalStorage, icon: <Users />, color: 'from-emerald-500 to-teal-600' },
        { label: 'Route', val: collectionName, icon: <List />, color: 'from-purple-600 to-indigo-700' },
        { label: 'Files', val: uniqueFilesCount, icon: <FileText />, color: 'from-orange-500 to-red-600' }
    ], [isDbConnected, totalStorage, collectionName, uniqueFilesCount]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border shadow-xl flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-3xl font-black text-slate-900 truncate max-w-[120px]">{s.val}</p>
                    </div>
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
                        {s.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};
