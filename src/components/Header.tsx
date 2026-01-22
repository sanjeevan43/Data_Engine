import React from 'react';
import { Settings, Sparkles, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
    const navigate = useNavigate();

    return (
        <header className="relative bg-slate-950 pt-32 pb-48 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]"></div>
            <div className="relative max-w-7xl mx-auto px-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                <div className="space-y-8 animate-in slide-in-from-left duration-700">
                    {/* Logo and Badge */}
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 p-4 rounded-2xl shadow-2xl">
                                <Database className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Enterprise Grade</span>
                        </div>
                    </div>
                    <h1 className="text-7xl lg:text-8xl font-black text-white leading-none tracking-tighter">
                        DataFlow<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400"> Pro</span>
                    </h1>
                    <p className="text-2xl text-slate-400 font-medium max-w-2xl">
                        Enterprise-grade data import platform with AI-powered validation, cleaning, and seamless integration across 15+ databases.
                    </p>
                </div>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={onOpenSettings}
                        className="flex items-center gap-4 bg-white text-slate-950 px-10 py-6 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all animate-in slide-in-from-right duration-700 hover:shadow-indigo-900/20"
                    >
                        <Settings className="text-indigo-600 w-6 h-6" />
                        Pipeline Configuration
                    </button>
                    <button
                        onClick={() => navigate('/cleanup')}
                        className="flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-10 py-6 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all animate-in slide-in-from-right duration-700 hover:shadow-violet-900/20"
                    >
                        <Sparkles className="w-6 h-6" />
                        Code Cleanup Agent
                    </button>
                </div>
            </div>
        </header>
    );
};
