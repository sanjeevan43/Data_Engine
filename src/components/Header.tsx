import React from 'react';
import { Settings, Sparkles, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
    const navigate = useNavigate();

    return (
        <header className="relative w-full border-b border-white/10 bg-black/50 backdrop-blur-xl z-30 sticky top-0">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo & Brand */}
                <div className="flex items-center gap-6 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-black border border-white/10 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] relative overflow-hidden">
                            <Database className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Omni<span className="text-cyan-400">Flow</span>
                            <span className="ml-2 text-xs text-zinc-500 font-normal px-2 py-0.5 border border-white/10 rounded-full bg-white/5">Pro</span>
                        </h1>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onOpenSettings}
                        className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                    >
                        <Settings className="w-4 h-4 text-cyan-400" />
                        Pipeline Config
                    </button>
                    <button
                        onClick={() => navigate('/cleanup')}
                        className="flex items-center gap-2 text-sm font-semibold bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        <Sparkles className="w-4 h-4" />
                        Agent
                    </button>
                </div>
            </div>
            {/* Glowing bottom line */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        </header>
    );
};
