import React, { useState, useMemo } from 'react';
import { Database, Server, HardDrive, Cpu, Cloud, Folder } from 'lucide-react';
import type { DatabaseProvider } from '../context/FirebaseContext';

// Data Definition
interface DatabaseOption {
    name: DatabaseProvider;
    type: 'NoSQL' | 'SQL' | 'SQLite';
    description: string;
    icon: React.ReactNode;
}

const DATABASES: DatabaseOption[] = [
    {
        name: "Firebase",
        type: "NoSQL",
        description: "Cloud-hosted NoSQL database for real-time and offline-first applications",
        icon: <Database className="w-6 h-6" />
    },
    {
        name: "Supabase",
        type: "SQL",
        description: "PostgreSQL-based relational database with full SQL support",
        icon: <Server className="w-6 h-6" />
    },
    {
        name: "Appwrite",
        type: "NoSQL",
        description: "Self-hostable backend platform with database and authentication services",
        icon: <Cloud className="w-6 h-6" />
    },
    {
        name: "AWS Amplify",
        type: "NoSQL",
        description: "Managed backend services integrated with the AWS ecosystem",
        icon: <Cpu className="w-6 h-6" />
    },
    {
        name: "MongoDB",
        type: "NoSQL",
        description: "Document-oriented database designed for scalability and flexibility",
        icon: <HardDrive className="w-6 h-6" />
    },
    {
        name: "PocketBase",
        type: "SQLite",
        description: "Lightweight SQLite-based backend for small and embedded applications",
        icon: <Folder className="w-6 h-6" />
    }
];

interface SupportedDatabasesProps {
    onSelectDatabase?: (name: DatabaseProvider) => void;
}

export const SupportedDatabases: React.FC<SupportedDatabasesProps> = ({ onSelectDatabase }) => {
    const [filter, setFilter] = useState<'All' | 'SQL' | 'NoSQL' | 'SQLite'>('All');

    const filteredDatabases = useMemo(() => {
        if (filter === 'All') return DATABASES;
        return DATABASES.filter(db => db.type === filter);
    }, [filter]);

    // Accessibility helper for keyboard navigation on filters
    const handleKeyDown = (e: React.KeyboardEvent, type: typeof filter) => {
        if (e.key === 'Enter' || e.key === ' ') {
            setFilter(type);
        }
    };

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'SQL': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'NoSQL': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'SQLite': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                        Supported Databases
                    </h2>
                    <p className="text-xl text-slate-500 font-medium">
                        All listed databases are fully supported
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {(['All', 'SQL', 'NoSQL', 'SQLite'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            onKeyDown={(e) => handleKeyDown(e, type)}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border-2 ${filter === type
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            aria-pressed={filter === type}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDatabases.map((db) => (
                        <div
                            key={db.name}
                            onClick={() => onSelectDatabase && onSelectDatabase(db.name)}
                            className={`group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-start h-full relative overflow-hidden ${onSelectDatabase ? 'cursor-pointer' : ''}`}
                        >
                            {/* Card Gradient bg on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <div className="relative z-10 w-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
                                        {db.icon}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getBadgeColor(db.type)}`}>
                                        {db.type}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {db.name}
                                </h3>

                                <p className="text-slate-500 font-medium leading-relaxed">
                                    {db.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
