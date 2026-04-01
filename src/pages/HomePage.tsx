import { useNavigate } from 'react-router-dom';
import { Database, Sparkles, ChevronRight, Zap, Target, Shield } from 'lucide-react';
import { SupportedDatabases } from '../components/SupportedDatabases';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white relative selection:bg-cyan-500/30">
            {/* Ultra Modern Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Glowing Top Border */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 absolute top-0" />

            {/* Navigation / Header */}
            <header className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black border border-white/10 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Database className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">Omni<span className="text-cyan-400">Flow</span></span>
                </div>
                
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#databases" className="hover:text-white transition-colors">Integrations</a>
                    <a href="#security" className="hover:text-white transition-colors">Security</a>
                </div>

                <button 
                    onClick={() => navigate('/login')}
                    className="text-sm font-semibold px-5 py-2.5 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
                >
                    Sign In
                </button>
            </header>

            <main className="relative z-10 pt-32 pb-24 text-center px-4">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-zinc-300">OmniFlow Engine 2.0 is live</span>
                </div>

                {/* Hero Text */}
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter max-w-5xl mx-auto leading-[1.1] mb-8">
                    The Modern Engine for <br />
                    <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                        Enterprise Data Import.
                    </span>
                </h1>

                <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-medium">
                    Seamlessly move, transform, and validate your data across 15+ databases with zero configuration, powered by intelligent auto-mapping.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
                    <button
                        onClick={() => navigate('/signup')}
                        className="group relative px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                    >
                        Start Processing Free
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => navigate('/cleanup')}
                        className="group px-8 py-4 bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/5 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-3"
                    >
                        Code Cleanup Agent
                    </button>
                </div>

                {/* Micro Features */}
                <div id="features" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 border-t border-white/10">
                    <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 text-left hover:border-cyan-500/30 transition-colors group">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
                        <p className="text-zinc-400">Process millions of rows instantly with our optimized streaming architecture in the browser.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 text-left hover:border-blue-500/30 transition-colors group">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                            <Target className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Smart Auto-Match</h3>
                        <p className="text-zinc-400">Our AI maps dirty CSV columns to your pristine database schemas with 99.9% accuracy automatically.</p>
                    </div>
                    <div id="security" className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 text-left hover:border-purple-500/30 transition-colors group">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Zero Retention</h3>
                        <p className="text-zinc-400">Your data never touches our servers. Pure client-side processing guarantees compliance and privacy.</p>
                    </div>
                </div>

                {/* Databases Section */}
                <div id="databases" className="mt-32 pt-16 border-t border-white/10">
                    <SupportedDatabases onSelectDatabase={() => {}} />
                </div>
            </main>
        </div>
    );
}
