/**
 * Free Local AI Chatbot - No API Key Required!
 * Uses browser-based AI models that run locally
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Key, CheckCircle, UploadCloud, Loader } from 'lucide-react';
import { LocalAIService } from '../services/ai/LocalAIService';
import type { ChatMessage } from '../services/ai/LocalAIService';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    actions?: Action[];
}

interface Action {
    label: string;
    onClick: () => void;
}

interface ChatbotProps {
    csvHeaders: string[];
    currentMapping: any[];
    onSuggestion: (suggestion: ChatbotSuggestion) => void;
}

interface ChatbotSuggestion {
    type: 'primary-key' | 'foreign-key' | 'data-type' | 'mapping' | 'import';
    field: string;
    value: any;
    reason: string;
}

export const DataImportChatbot: React.FC<ChatbotProps> = ({
    csvHeaders,
    currentMapping,
    onSuggestion
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "👋 **Welcome to DataFlow AI Assistant!**\n\nI'm a **FREE local AI** that runs in your browser!\n\n✨ **No API keys needed**\n🔒 **Completely private** - your data never leaves your computer\n⚡ **Works offline** after first load\n🆓 **100% free forever**\n\n**I can help you with:**\n🔍 Analyze CSV structure\n🔑 Suggest primary keys\n📊 Recommend data types\n🗺️ Help with field mapping\n\n**First time?** I'll download AI models (takes ~30 seconds). After that, I'm instant!\n\nUpload a CSV and ask me anything!",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [aiReady, setAiReady] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize AI on mount
    useEffect(() => {
        const initAI = async () => {
            setIsInitializing(true);
            try {
                await LocalAIService.initialize();
                setAiReady(LocalAIService.isAvailable());
                if (LocalAIService.isAvailable()) {
                    addMessage('assistant', '✅ **AI Models Loaded!**\n\nI\'m ready to help you analyze your data. Upload a CSV file and ask me anything!');
                }
            } catch (error) {
                console.error('AI initialization failed:', error);
                addMessage('assistant', '⚠️ **AI models couldn\'t load**, but I can still help with basic analysis using rule-based logic!');
            } finally {
                setIsInitializing(false);
            }
        };

        initAI();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (role: 'user' | 'assistant', content: string, actions?: Action[]) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            role,
            content,
            timestamp: new Date(),
            actions
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        addMessage('user', userMessage);
        setInput('');
        setIsTyping(true);

        try {
            // Build context
            const context = {
                csvHeaders,
                sampleRows: [], // We don't have sample rows in this component
                currentMapping: currentMapping.reduce((acc, m) => {
                    acc[m.csvHeader] = m.firestoreField;
                    return acc;
                }, {} as Record<string, string>)
            };

            // Get AI response
            const chatHistory: ChatMessage[] = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await LocalAIService.chat(
                [...chatHistory, { role: 'user', content: userMessage }],
                context
            );

            // Extract actionable suggestions
            const actions = extractActions(response, csvHeaders, onSuggestion, addMessage);

            addMessage('assistant', response, actions);
        } catch (err: any) {
            console.error('AI chat error:', err);
            addMessage('assistant', `❌ Sorry, I encountered an error: ${err.message}\n\nPlease try again or ask a different question.`);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickActions = [
        { label: 'Analyze CSV', icon: Sparkles, question: 'Analyze my CSV file' },
        { label: 'Primary Key', icon: Key, question: 'Which field should be the primary key?' },
        { label: 'Import Guide', icon: UploadCloud, question: 'How do I import my data?' }
    ];

    return (
        <>
            {/* Chatbot Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all hover:scale-110 z-50 flex items-center gap-3 group"
                >
                    <Sparkles className="w-6 h-6 animate-pulse" />
                    <span className="font-bold">Free AI Assistant</span>
                    <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5 font-bold animate-bounce">
                        FREE
                    </span>
                </button>
            )}

            {/* Chatbot Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-green-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">DataFlow AI</h3>
                                <p className="text-xs text-green-100 flex items-center gap-1">
                                    {isInitializing ? (
                                        <>
                                            <Loader className="w-3 h-3 animate-spin" />
                                            Loading models...
                                        </>
                                    ) : aiReady ? (
                                        <>✅ Local AI Ready</>
                                    ) : (
                                        <>⚡ Rule-based Mode</>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full font-bold">
                                100% FREE
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="p-3 bg-green-50 border-b border-green-200 text-sm text-green-800">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-medium">
                                🔒 Private & Free - No API keys, runs in your browser!
                            </span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-4 bg-gradient-to-b from-green-50 to-white border-b border-slate-200">
                        <p className="text-xs text-slate-600 mb-2 font-bold uppercase tracking-wide">Quick Actions:</p>
                        <div className="flex gap-2">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setInput(action.question);
                                        setTimeout(() => handleSend(), 100);
                                    }}
                                    className="flex-1 px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md"
                                    disabled={isTyping}
                                >
                                    <action.icon className="w-4 h-4 text-green-600" />
                                    <span className="text-slate-700">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className="max-w-[85%]">
                                    <div
                                        className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                                            : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                        <p
                                            className={`text-xs mt-2 ${message.role === 'user' ? 'text-green-100' : 'text-slate-500'
                                                }`}
                                        >
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {/* Action Buttons */}
                                    {message.actions && message.actions.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {message.actions.map((action, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={action.onClick}
                                                    className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-200 bg-white">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything..."
                                className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-green-500 focus:outline-none text-sm font-medium"
                                disabled={isTyping}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

/**
 * Extract actionable suggestions from AI response
 */
function extractActions(
    response: string,
    csvHeaders: string[],
    onSuggestion: (suggestion: ChatbotSuggestion) => void,
    addMessage: (role: 'user' | 'assistant', content: string) => void
): Action[] {
    const actions: Action[] = [];
    const lowerResponse = response.toLowerCase();

    // Look for primary key recommendations
    csvHeaders.forEach(header => {
        if (lowerResponse.includes(header.toLowerCase()) && lowerResponse.includes('primary key')) {
            actions.push({
                label: `Set "${header}" as Primary Key`,
                onClick: () => {
                    onSuggestion({
                        type: 'primary-key',
                        field: header,
                        value: true,
                        reason: 'AI recommended based on analysis'
                    });
                    addMessage('assistant', `✅ Set "${header}" as primary key!`);
                }
            });
        }
    });

    return actions.slice(0, 2); // Limit to 2 actions max
}
