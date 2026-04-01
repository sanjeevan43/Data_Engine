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
        name: "MongoDB",
        type: "NoSQL",
        description: "Document-oriented database designed for scalability and flexibility",
        icon: <HardDrive className="w-6 h-6" />
    },
    {
        name: "Hostinger MySQL",
        type: "SQL",
        description: "Hostinger's managed MySQL database with high performance and reliability",
        icon: <Server className="w-6 h-6" />
    },
    {
        name: "PostgreSQL",
        type: "SQL",
        description: "Advanced open-source relational database with powerful features",
        icon: <Database className="w-6 h-6" />
    },
    {
        name: "MySQL",
        type: "SQL",
        description: "Popular open-source relational database management system",
        icon: <Database className="w-6 h-6" />
    },
    {
        name: "Airtable",
        type: "NoSQL",
        description: "Spreadsheet-database hybrid with powerful API and collaboration features",
        icon: <Folder className="w-6 h-6" />
    },
    {
        name: "Notion",
        type: "NoSQL",
        description: "All-in-one workspace with database capabilities and rich content",
        icon: <Folder className="w-6 h-6" />
    },
    {
        name: "Google Sheets",
        type: "NoSQL",
        description: "Cloud-based spreadsheet with API access for simple data storage",
        icon: <Cloud className="w-6 h-6" />
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
        name: "PocketBase",
        type: "SQLite",
        description: "Lightweight SQLite-based backend for small and embedded applications",
        icon: <Folder className="w-6 h-6" />
    },
    {
        name: "Xano",
        type: "SQL",
        description: "No-code backend with PostgreSQL database and powerful API builder",
        icon: <Server className="w-6 h-6" />
    },
    {
        name: "Nhost",
        type: "SQL",
        description: "Open-source Firebase alternative with PostgreSQL and GraphQL",
        icon: <Database className="w-6 h-6" />
    },
    {
        name: "Convex",
        type: "NoSQL",
        description: "Real-time backend with reactive queries and serverless functions",
        icon: <Cloud className="w-6 h-6" />
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
            case 'SQL': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
            case 'NoSQL': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case 'SQLite': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            default: return 'bg-slate-800 text-slate-300 border-white/10';
        }
    };

    return (
        <section className="py-24 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden border-t border-white/5">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl font-black text-white tracking-tight">
                        Supported Databases
                    </h2>
                    <p className="text-xl text-indigo-200 font-medium">
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
                            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border ${filter === type
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-105'
                                : 'bg-slate-800/50 text-slate-400 border-white/5 hover:border-white/20 hover:bg-slate-800 hover:text-slate-200'
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
                            className={`group bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 shadow-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:-translate-y-2 hover:border-indigo-500/30 transition-all duration-300 flex flex-col items-start h-full relative overflow-hidden ${onSelectDatabase ? 'cursor-pointer' : ''}`}
                        >
                            {/* Card Gradient bg on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <div className="relative z-10 w-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-slate-800/80 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 group-hover:scale-110 transition-all duration-300 border border-white/5 group-hover:border-indigo-500/30">
                                        {db.icon}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getBadgeColor(db.type)}`}>
                                        {db.type}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                                    {db.name}
                                </h3>

                                <p className="text-slate-400 font-medium leading-relaxed">
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
