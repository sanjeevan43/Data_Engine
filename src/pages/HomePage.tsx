import { useNavigate } from 'react-router-dom';
import { Database, Sparkles } from 'lucide-react';
import { SupportedDatabases } from '../components/SupportedDatabases';


/**
 * Landing page – shows the hero section and a "Get Started" button.
 * Clicking the button navigates to the main application page (`/app`).
 */
export default function HomePage() {
    const navigate = useNavigate();

    const onGetStarted = () => {
        navigate('/app');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-24 -mt-20 text-center">
                <div className="inline-flex items-center justify-center gap-5 mb-8">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-violet-500 to-purple-500 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-5 rounded-3xl shadow-2xl">
                            <Database className="w-14 h-14 text-white" />
                            <Sparkles className="w-7 h-7 text-amber-300 absolute -top-3 -right-3 animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 mb-2">
                            DataFlow
                        </h1>
                        <div className="flex items-center gap-2 justify-center">
                            <div className="h-1 w-12 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full" />
                            <span className="text-indigo-300 font-bold text-sm uppercase tracking-wider">Enterprise Grade</span>
                            <div className="h-1 w-12 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full" />
                        </div>
                    </div>
                </div>

                <p className="text-3xl text-white font-bold mb-6 max-w-3xl mx-auto">
                    Enterprise Data Import & Validation Platform
                </p>
                <p className="text-xl text-indigo-200 max-w-2xl mx-auto mb-10">
                    Seamlessly import, validate, and transform data across 15+ databases with AI-powered intelligence
                </p>

                {/* Feature pills */}
                <div className="flex items-center justify-center gap-4 flex-wrap mb-12">
                    <div className="glass bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span className="text-white font-semibold">Enterprise Ready</span>
                    </div>
                    <div className="glass bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-2">
                        <Database className="w-5 h-5 text-emerald-400" />
                        <span className="text-white font-semibold">15+ Databases</span>
                    </div>
                    <div className="glass bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-400" />
                        <span className="text-white font-semibold">AI-Powered</span>
                    </div>
                </div>

                <button
                    onClick={onGetStarted}
                    className="group px-10 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                    Get Started
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>

                {/* Supported databases preview */}
                <div className="mt-16 pt-12 border-t border-white/10">
                    <h4 className="text-center text-sm font-black text-indigo-300 uppercase tracking-widest mb-8">Supported Platforms</h4>
                    <SupportedDatabases onSelectDatabase={() => { }} />
                </div>
            </main>
        </div>
    );
}
