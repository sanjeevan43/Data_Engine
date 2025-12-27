import React from 'react';
import { Settings } from 'lucide-react';

interface HeaderProps {
    onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
    return (
        <header className="relative bg-slate-950 pt-32 pb-48 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.1),transparent_50%)]"></div>
            <div className="relative max-w-7xl mx-auto px-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                <div className="space-y-8 animate-in slide-in-from-left duration-700">
                    {/* Logo and Badge */}
                    <div className="flex items-center gap-6">
                        <img
                            src="/logo.png"
                            alt="Data Engine Logo"
                            className="w-16 h-16 rounded-2xl shadow-2xl"
                        />
                        <div className="flex items-center gap-3 px-5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">AI-Powered</span>
                        </div>
                    </div>
                    <h1 className="text-7xl lg:text-8xl font-black text-white leading-none tracking-tighter">
                        Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Engine</span>
                    </h1>
                    <p className="text-2xl text-slate-400 font-medium max-w-2xl">
                        AI-powered CSV import system with intelligent data cleaning, validation, and multi-database support.
                    </p>
                </div>
                <button
                    onClick={onOpenSettings}
                    className="flex items-center gap-4 bg-white text-slate-950 px-10 py-6 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all animate-in slide-in-from-right duration-700 hover:shadow-blue-900/20"
                >
                    <Settings className="text-blue-600 w-6 h-6" />
                    Pipeline Configuration
                </button>
            </div>
        </header>
    );
};
