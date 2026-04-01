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
                <div key={i} className="bg-zinc-900 border border-white/10 p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] hover:border-cyan-500/30 transition-all duration-300 group">
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-3xl font-black text-white truncate max-w-[120px]">{s.val}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black border border-white/5 text-zinc-300 group-hover:text-cyan-400 group-hover:border-cyan-500/20 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                        {s.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};
