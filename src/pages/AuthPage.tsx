import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Database, Mail, Lock, User, ArrowRight, AlertCircle, Ghost } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthPage({ initialMode = 'login' }: { initialMode?: 'login' | 'signup' }) {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setAuthError('');

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/app');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (name.trim() !== '') {
                    await updateProfile(userCredential.user, { displayName: name });
                }
                navigate('/app');
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            // Translate common Firebase errors into friendly UI messages
            switch (error.code) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    setAuthError('Invalid email or password. Please try again.');
                    break;
                case 'auth/email-already-in-use':
                    setAuthError('An account with this email already exists.');
                    break;
                case 'auth/weak-password':
                    setAuthError('Your password should be at least 6 characters.');
                    break;
                default:
                    setAuthError(error.message || 'An error occurred during authentication.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setAuthError('');
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate('/app');
        } catch (error: any) {
            console.error('Google Auth error:', error);
            setAuthError(error.message || 'An error occurred during Google authentication.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnonymousLogin = async () => {
        setIsLoading(true);
        setAuthError('');
        try {
            await signInAnonymously(auth);
            navigate('/app');
        } catch (error: any) {
            console.error('Anonymous Auth error:', error);
            setAuthError(error.message || 'An error occurred during anonymous authentication.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative selection:bg-cyan-500/30 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Glowing Top Border */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 absolute top-0 left-0" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center justify-center gap-3 mb-8 group cursor-pointer">
                        <div className="w-12 h-12 bg-black border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Database className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-3xl font-bold tracking-tight text-white">Omni<span className="text-cyan-400">Flow</span></span>
                    </Link>
                    <h1 className="text-3xl font-black mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                    <p className="text-zinc-400 font-medium">
                        {isLogin ? 'Enter your credentials to access the engine.' : 'Join OmniFlow to power your data imports.'}
                    </p>
                </div>

                <div className="glass-panel p-8 sm:p-10 rounded-3xl relative overflow-hidden transition-all duration-500">
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {authError && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <span>{authError}</span>
                            </div>
                        )}

                        {/* Smoothly expand/collapse name field based on mode */}
                        <div className={`space-y-2 overflow-hidden transition-all duration-300 ${isLogin ? 'max-h-0 opacity-0 m-0' : 'max-h-24 opacity-100'}`}>
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type="text"
                                    required={!isLogin}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="input-premium pl-12"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="input-premium pl-12"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between pl-1">
                                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Password</label>
                                {isLogin && (
                                    <button type="button" className="text-[11px] font-bold text-cyan-500 hover:text-cyan-400 transition-colors">
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-premium pl-12"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-4 flex items-center justify-center gap-2 relative group overflow-hidden mt-8"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Social / Other Providers */}
                    <div className="relative mt-8 z-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-black text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-[1.02] active:scale-95 text-sm font-bold disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={handleAnonymousLogin}
                            className="flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-[1.02] active:scale-95 text-sm font-bold text-zinc-300 disabled:opacity-50"
                        >
                            <Ghost className="w-5 h-5 text-zinc-400" />
                            Guest
                        </button>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p className="text-zinc-500 font-medium text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button 
                            type="button" 
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setEmail('');
                                setPassword('');
                                setName('');
                                setAuthError('');
                            }}
                            className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                        >
                            {isLogin ? 'Create one now' : 'Sign in instead'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
