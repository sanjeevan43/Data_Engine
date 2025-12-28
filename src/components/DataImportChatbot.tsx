/**
 * Enhanced AI Chatbot Assistant for Data Import
 * Provides intelligent guidance for database configuration and data import
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Key, CheckCircle, UploadCloud } from 'lucide-react';

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
            content: "👋 **Welcome to SmartImport AI Assistant!**\n\nI'm here to help you import your data successfully. I can:\n\n🔑 **Analyze your CSV** and suggest the best primary key\n📊 **Recommend data types** for each field\n🗺️ **Help with field mapping** to your database\n✅ **Guide you through** the import process\n\n**Quick Start:**\n• Upload your CSV file first\n• I'll analyze it and provide recommendations\n• Ask me anything about your data!\n\nWhat would you like help with?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Enhanced AI analysis with actionable responses
    const analyzeQuestion = (question: string): { response: string; actions?: Action[] } => {
        const lowerQuestion = question.toLowerCase();

        // Check if CSV is loaded
        if (csvHeaders.length === 0) {
            return {
                response: "⚠️ **No CSV file detected yet!**\n\nPlease upload a CSV file first so I can analyze your data and provide specific recommendations.\n\n**Steps:**\n1. Click the upload area above\n2. Select your CSV file\n3. I'll analyze it automatically\n4. Then I can help you configure the import!",
                actions: []
            };
        }

        // Analyze CSV request
        if (lowerQuestion.includes('analyze') || lowerQuestion.includes('check') || lowerQuestion.includes('review')) {
            const idFields = csvHeaders.filter(h =>
                h.toLowerCase().includes('id') ||
                h.toLowerCase() === 'email' ||
                h.toLowerCase().includes('username')
            );

            const emailFields = csvHeaders.filter(h => h.toLowerCase().includes('email'));
            const dateFields = csvHeaders.filter(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('time'));
            const numberFields = csvHeaders.filter(h =>
                h.toLowerCase().includes('age') ||
                h.toLowerCase().includes('price') ||
                h.toLowerCase().includes('quantity') ||
                h.toLowerCase().includes('amount')
            );

            let analysis = `📊 **CSV Analysis Complete!**\n\n**Found ${csvHeaders.length} columns:**\n${csvHeaders.map(h => `• ${h}`).join('\n')}\n\n`;

            if (idFields.length > 0) {
                analysis += `\n🔑 **Recommended Primary Key:** ${idFields[0]}\n`;
            }
            if (emailFields.length > 0) {
                analysis += `📧 **Email fields:** ${emailFields.join(', ')}\n`;
            }
            if (dateFields.length > 0) {
                analysis += `📅 **Date fields:** ${dateFields.join(', ')}\n`;
            }
            if (numberFields.length > 0) {
                analysis += `🔢 **Number fields:** ${numberFields.join(', ')}\n`;
            }

            analysis += `\n**Next Steps:**\n✅ Review the field mappings\n✅ Set primary key if needed\n✅ Click "Import Data to Database"`;

            return { response: analysis };
        }

        // Primary Key Questions
        if (lowerQuestion.includes('primary key') || (lowerQuestion.includes('which field') && lowerQuestion.includes('id'))) {
            const idFields = csvHeaders.filter(h =>
                h.toLowerCase().includes('id') ||
                h.toLowerCase() === 'email' ||
                h.toLowerCase().includes('username')
            );

            if (idFields.length > 0) {
                return {
                    response: `🔑 **Primary Key Recommendation**\n\nI recommend using **"${idFields[0]}"** as your primary key because:\n\n✅ It appears to be a unique identifier\n✅ Primary keys must be unique for each record\n✅ This field name suggests it contains unique values\n\n**What is a Primary Key?**\nA primary key uniquely identifies each row in your database. It should:\n• Never be empty\n• Never change\n• Be unique for every record\n\n**Other candidates:** ${idFields.slice(1).join(', ') || 'None found'}`,
                    actions: idFields.length > 0 ? [{
                        label: `Set "${idFields[0]}" as Primary Key`,
                        onClick: () => {
                            onSuggestion({
                                type: 'primary-key',
                                field: idFields[0],
                                value: true,
                                reason: 'AI recommended based on field name analysis'
                            });
                            addMessage('assistant', `✅ Great! I've set "${idFields[0]}" as the primary key.`);
                        }
                    }] : []
                };
            }

            return {
                response: `🔍 **No obvious primary key found**\n\nYour fields: ${csvHeaders.join(', ')}\n\nFor a primary key, choose a field that:\n✅ Has unique values for each row\n✅ Never changes\n✅ Is never empty\n\n**Common examples:**\n• user_id\n• email\n• username\n• product_id\n\nWhich field would you like to use?`
            };
        }

        // Import help
        if (lowerQuestion.includes('import') || lowerQuestion.includes('upload') || lowerQuestion.includes('save')) {
            return {
                response: `📤 **Ready to Import Your Data?**\n\nHere's the process:\n\n1️⃣ **Review your mappings** - Make sure fields are mapped correctly\n2️⃣ **Set primary key** (optional but recommended)\n3️⃣ **Click "Import Data to Database"** button\n4️⃣ **Wait for confirmation** - You'll see a success message\n\n**Current Status:**\n• CSV loaded: ✅\n• Fields detected: ${csvHeaders.length}\n• Ready to import: ${currentMapping.length > 0 ? '✅' : '⚠️ Configure mappings first'}\n\nClick the green "Import Data to Database" button when ready!`
            };
        }

        // Data type help
        if (lowerQuestion.includes('data type') || lowerQuestion.includes('type')) {
            return {
                response: `📊 **Data Type Guide**\n\nChoose the right type for each field:\n\n📝 **String** - Text data\n   • Names, descriptions, addresses\n   • Example: "John Doe", "New York"\n\n🔢 **Number** - Numeric values\n   • Age, price, quantity, ratings\n   • Example: 25, 99.99, 1000\n\n✅ **Boolean** - True/false\n   • Active status, enabled/disabled\n   • Example: true, false\n\n📅 **Date** - Date and time\n   • Birth dates, timestamps\n   • Example: "2024-01-15"\n\n📧 **Email** - Email addresses\n   • User emails\n   • Example: "user@example.com"\n\n🔗 **URL** - Web links\n   • Website URLs\n   • Example: "https://example.com"\n\nWhich field do you need help with?`
            };
        }

        // Field-specific questions
        const mentionedField = csvHeaders.find(h => lowerQuestion.includes(h.toLowerCase()));
        if (mentionedField) {
            const fieldLower = mentionedField.toLowerCase();
            let suggestedType = 'string';
            let icon = '📝';

            if (fieldLower.includes('email')) {
                suggestedType = 'email';
                icon = '📧';
            } else if (fieldLower.includes('age') || fieldLower.includes('price') || fieldLower.includes('quantity') || fieldLower.includes('amount')) {
                suggestedType = 'number';
                icon = '🔢';
            } else if (fieldLower.includes('date') || fieldLower.includes('time') || fieldLower.includes('created') || fieldLower.includes('updated')) {
                suggestedType = 'date';
                icon = '📅';
            } else if (fieldLower.includes('url') || fieldLower.includes('website') || fieldLower.includes('link')) {
                suggestedType = 'url';
                icon = '🔗';
            } else if (fieldLower.includes('active') || fieldLower.includes('enabled') || fieldLower.includes('verified')) {
                suggestedType = 'boolean';
                icon = '✅';
            }

            return {
                response: `${icon} **Field: "${mentionedField}"**\n\n**Recommended Type:** ${suggestedType}\n\n**Why?** Based on the field name, this appears to be ${suggestedType} data.\n\n**Confidence:** ${suggestedType !== 'string' ? 'High ✅' : 'Medium ⚠️'}\n\nDoes this look correct?`,
                actions: [{
                    label: `Set as ${suggestedType}`,
                    onClick: () => {
                        onSuggestion({
                            type: 'data-type',
                            field: mentionedField,
                            value: suggestedType,
                            reason: `AI recommended based on field name "${mentionedField}"`
                        });
                        addMessage('assistant', `✅ Set "${mentionedField}" to ${suggestedType} type!`);
                    }
                }]
            };
        }

        // General help
        if (lowerQuestion.includes('help') || lowerQuestion.includes('how') || lowerQuestion.includes('what can you')) {
            return {
                response: `🤖 **I can help you with:**\n\n🔍 **"Analyze my CSV"**\n   Get a full analysis of your data\n\n🔑 **"What should be the primary key?"**\n   Get recommendations for unique identifiers\n\n📊 **"What data type for [field]?"**\n   Get type recommendations for specific fields\n\n📤 **"How do I import?"**\n   Step-by-step import guide\n\n🗺️ **"Help with mapping"**\n   Field mapping assistance\n\n**Just ask me anything!** I'm here to make your data import smooth and error-free.`
            };
        }

        // Default response
        return {
            response: `I'm here to help! Try asking:\n\n• "Analyze my CSV"\n• "Which field should be the primary key?"\n• "What data type for [field name]?"\n• "How do I import my data?"\n• "Help"\n\nWhat would you like to know?`
        };
    };

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

        addMessage('user', input);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking
        setTimeout(() => {
            const { response, actions } = analyzeQuestion(input);
            addMessage('assistant', response, actions);
            setIsTyping(false);
        }, 800);
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
                    className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-110 z-50 flex items-center gap-3 animate-pulse"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="font-bold">Need Help?</span>
                </button>
            )}

            {/* Chatbot Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-blue-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">SmartImport AI</h3>
                                <p className="text-xs text-blue-100">Your data import assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/20 rounded-lg transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-4 bg-gradient-to-b from-blue-50 to-white border-b border-slate-200">
                        <p className="text-xs text-slate-600 mb-2 font-bold uppercase tracking-wide">Quick Actions:</p>
                        <div className="flex gap-2">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setInput(action.question);
                                        setTimeout(() => handleSend(), 100);
                                    }}
                                    className="flex-1 px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md"
                                >
                                    <action.icon className="w-4 h-4 text-blue-600" />
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
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                            : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                        <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                                            }`}>
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
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                                className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-sm font-medium"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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
