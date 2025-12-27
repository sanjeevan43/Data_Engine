import React from 'react';
import { Database, Sparkles, Zap, Shield, TrendingUp, CheckCircle, ArrowRight, Upload, BarChart3 } from 'lucide-react';

interface HomePageProps {
    onGetStarted: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-24">
                    {/* Logo and Title */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center gap-4 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50"></div>
                                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-2xl">
                                    <Database className="w-12 h-12 text-white" />
                                    <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
                                </div>
                            </div>
                            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                                Data Engine
                            </h1>
                        </div>

                        <p className="text-2xl text-slate-600 font-medium mb-8 max-w-3xl mx-auto">
                            AI-Powered CSV Import System with Intelligent Data Cleaning
                        </p>

                        <div className="flex items-center justify-center gap-4 mb-12">
                            <button
                                onClick={onGetStarted}
                                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => window.scrollTo({ top: document.getElementById('why')?.offsetTop, behavior: 'smooth' })}
                                className="px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-slate-200"
                            >
                                Learn More
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>No Credit Card Required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Free Forever</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>AI-Powered</span>
                            </div>
                        </div>
                    </div>

                    {/* Feature Preview */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                                    <Upload className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                    <h3 className="font-bold text-slate-800 mb-2">Upload CSV</h3>
                                    <p className="text-sm text-slate-600">Drag & drop multiple files</p>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                                    <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                                    <h3 className="font-bold text-slate-800 mb-2">AI Cleans Data</h3>
                                    <p className="text-sm text-slate-600">Automatic validation & fixing</p>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl">
                                    <Database className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                                    <h3 className="font-bold text-slate-800 mb-2">Import to DB</h3>
                                    <p className="text-sm text-slate-600">One-click database import</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why This Website Section */}
            <div id="why" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black text-slate-900 mb-4">
                            Why Data Engine?
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Stop wasting hours cleaning CSV data manually. Let AI do the heavy lifting while you focus on what matters.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="group p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">AI-Powered Cleaning</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Our AI automatically detects and fixes common data issues: trimming whitespace, normalizing emails, converting data types, and removing duplicates.
                            </p>
                            <ul className="mt-4 space-y-2">
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Automatic type detection</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Smart field mapping</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Duplicate removal</span>
                                </li>
                            </ul>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="bg-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Lightning Fast</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Process thousands of rows in seconds. Batch import with smart chunking ensures your data gets imported quickly without overwhelming your database.
                            </p>
                            <ul className="mt-4 space-y-2">
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Batch processing</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Real-time progress</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Multiple files at once</span>
                                </li>
                            </ul>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">100% Safe</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Your data never leaves your control. AI processes everything locally, and you review all changes before importing. No external API calls, no data leaks.
                            </p>
                            <ul className="mt-4 space-y-2">
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Local processing</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Review before import</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>No data storage</span>
                                </li>
                            </ul>
                        </div>

                        {/* Feature 4 */}
                        <div className="group p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="bg-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Database className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Multi-Database Support</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Works with Firebase, Supabase, MongoDB, AWS Amplify, Appwrite, and PocketBase. One tool for all your databases.
                            </p>
                            <ul className="mt-4 space-y-2">
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>6+ databases supported</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Easy configuration</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Switch anytime</span>
                                </li>
                            </ul>
                        </div>

                        {/* Feature 5 */}
                        <div className="group p-8 bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="bg-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Smart Validation</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Comprehensive data validation catches errors before they reach your database. Email formats, number ranges, required fields - all checked automatically.
                            </p>
                            <ul className="mt-4 space-y-2">
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Email validation</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Type checking</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Custom rules</span>
                                </li>
                            </ul>
                        </div>

                        {/* Feature 6 */}
                        <div className="group p-8 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Detailed Analytics</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Get instant insights: total rows processed, validation errors, transformations applied, and duplicates removed. Know exactly what happened to your data.
                            </p>
                            <ul className="mt-4 space-y-2">
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Real-time stats</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Error reports</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Transformation log</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-5xl font-black text-white mb-6">
                        Ready to Transform Your Data Workflow?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of developers who trust Data Engine for their CSV imports
                    </p>
                    <button
                        onClick={onGetStarted}
                        className="px-12 py-5 bg-white text-blue-600 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                    >
                        Start Importing Now - It's Free!
                    </button>
                    <p className="mt-6 text-blue-100 text-sm">
                        No credit card required • Free forever • Takes 30 seconds to start
                    </p>
                </div>
            </div>
        </div>
    );
};
