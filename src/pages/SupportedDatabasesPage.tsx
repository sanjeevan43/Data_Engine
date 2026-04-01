import { Header } from '../components/Header';
import { SupportedDatabases } from '../components/SupportedDatabases';
import { useNavigate } from 'react-router-dom';
import { Database } from 'lucide-react';

export default function SupportedDatabasesPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white relative selection:bg-cyan-500/30">
            {/* Ultra Modern Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none" />
            
            <Header onOpenSettings={() => navigate('/app')} />

            <main className="relative z-10 pt-20">
                <SupportedDatabases 
                    onSelectDatabase={() => {
                        // If they select a database, we can send them to the app
                        navigate('/app');
                    }} 
                />
            </main>

            <footer className="bg-black py-16 border-t border-white/5 relative z-20">
                <div className="max-w-7xl mx-auto px-10 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Database className="w-6 h-6 text-cyan-400" />
                        <span className="text-2xl font-bold text-white tracking-tight">Omni<span className="text-cyan-400">Flow</span></span>
                    </div>
                    <p className="text-zinc-500 font-medium tracking-wide text-sm flex items-center gap-4 mt-4">
                        Enterprise Data Infrastructure • 2026
                        <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                        <a href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
