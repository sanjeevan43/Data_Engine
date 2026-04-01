import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Trash2, EyeOff, Scale, Database } from 'lucide-react';

export default function PrivacyPolicyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white relative selection:bg-cyan-500/30">
            {/* Ultra Modern Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none" />
            
            <Header onOpenSettings={() => navigate('/app')} />

            <main className="relative z-10 pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                            <Shield className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm font-bold text-cyan-200 tracking-tight">Trust & Security Framework</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
                            Privacy Policy.
                        </h1>
                        <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto">
                            Your data integrity is our core priority. We've built OmniFlow with a <b>zero-retention</b> architecture.
                        </p>
                    </div>

                    {/* Grid of Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                        {/* 1. Client-Side Processing */}
                        <div className="group p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 hover:border-cyan-500/30 transition-all hover:-translate-y-2 backdrop-blur-3xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 bg-black border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                                <EyeOff className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Zero-Server Logic</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                All CSV parsing, data mapping, and transformations happen entirely within your browser's local sandbox. Your source data never touches our infrastructure.
                            </p>
                        </div>

                        {/* 2. No Permanent Storage */}
                        <div className="group p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 hover:border-green-500/30 transition-all hover:-translate-y-2 backdrop-blur-3xl">
                             <div className="w-12 h-12 bg-black border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                                <Trash2 className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Session Erasure</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Configuration profiles and temporary session keys are stored in `sessionStorage` and are automatically purged the moment you close the browser tab.
                            </p>
                        </div>

                        {/* 3. Direct Connection */}
                        <div className="group p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-2 backdrop-blur-3xl">
                             <div className="w-12 h-12 bg-black border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                                <Lock className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">End-to-End Tunnel</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                OmniFlow establishes a direct tunnel between your browser and your database provider (e.g., Firebase, Supabase). No intermediary nodes are involved.
                            </p>
                        </div>

                        {/* 4. Compliance */}
                        <div className="group p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-2 backdrop-blur-3xl">
                             <div className="w-12 h-12 bg-black border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                                <Scale className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">GDPR & HIPAA Ready</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Because we don't store your data, OmniFlow is inherently compliant with major global privacy regulations by default.
                            </p>
                        </div>
                    </div>

                    {/* Detailed Content */}
                    <div className="space-y-12 bg-zinc-900/20 rounded-[3rem] p-12 border border-white/5 backdrop-blur-md">
                        <section>
                            <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                                <span className="text-cyan-500">01.</span> Data Collection
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                We do not collect personally identifiable information (PII). We do not use cookies for tracking. We do not use analytics scripts that capture your database credentials or data payloads.
                            </p>
                        </section>

                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <section>
                            <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                                <span className="text-cyan-500">02.</span> Encryption
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                All communications between your browser and the chosen database provider are encrypted via Industry Standard TLS (Transport Layer Security).
                            </p>
                        </section>

                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <section>
                            <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                                <span className="text-cyan-500">03.</span> Third-Party Links
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                When you configure a provider like AWS, Google, or MongoDB, you are subject to their respective privacy policies. We recommend reviewing their security documentation for persistent storage details.
                            </p>
                        </section>
                    </div>

                    {/* Back to Home CTA */}
                    <div className="mt-20 text-center">
                        <button 
                            onClick={() => navigate('/')}
                            className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                        >
                            Understood. Back Home.
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-black py-16 border-t border-white/5 mt-32 relative z-20">
                <div className="max-w-7xl mx-auto px-10 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Database className="w-6 h-6 text-cyan-400" />
                        <span className="text-2xl font-bold text-white tracking-tight">Omni<span className="text-cyan-400">Flow</span></span>
                    </div>
                    <p className="text-zinc-500 font-medium tracking-wide text-sm">
                        Trust Infrastructure • Last Updated April 2026
                    </p>
                </div>
            </footer>
        </div>
    );
}
