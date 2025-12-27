/**
 * AI Chatbot Assistant for Data Import
 * Helps users configure their import with natural language
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Key, Database } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatbotProps {
    csvHeaders: string[];
    currentMapping: any[];
    onSuggestion: (suggestion: ChatbotSuggestion) => void;
}

interface ChatbotSuggestion {
    type: 'primary-key' | 'foreign-key' | 'data-type' | 'mapping';
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
            content: "👋 Hi! I'm your AI assistant. I can help you:\n\n• Select the best primary key\n• Configure foreign keys\n• Choose data types\n• Map fields correctly\n\nJust ask me anything!",
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

    const analyzeQuestion = (question: string): string => {
        const lowerQuestion = question.toLowerCase();

        // Primary Key Questions
        if (lowerQuestion.includes('primary key') || lowerQuestion.includes('which field') && lowerQuestion.includes('id')) {
            const idFields = csvHeaders.filter(h =>
                h.toLowerCase().includes('id') ||
                h.toLowerCase() === 'email' ||
                h.toLowerCase().includes('username')
            );

            if (idFields.length > 0) {
                return `Based on your CSV headers, I recommend using **${idFields[0]}** as the primary key because:\n\n✅ It appears to be a unique identifier\n✅ Primary keys should be unique for each record\n✅ This field name suggests it contains unique values\n\nWould you like me to set this as the primary key?`;
            }

            return `I analyzed your fields: ${csvHeaders.join(', ')}\n\nI couldn't find an obvious ID field. For a primary key, you should choose a field that:\n\n✅ Has unique values for each row\n✅ Never changes\n✅ Is never empty\n\nWhich field do you think is unique?`;
        }

        // Foreign Key Questions
        if (lowerQuestion.includes('foreign key') || lowerQuestion.includes('reference') || lowerQuestion.includes('relation')) {
            return `Foreign keys link your data to other tables. For example:\n\n• If you have a "user_id" field, it might reference the "users" table\n• If you have a "product_id", it might reference the "products" table\n\nWhich field do you want to set as a foreign key? Tell me the field name and which table it references.`;
        }

        // Data Type Questions
        if (lowerQuestion.includes('data type') || lowerQuestion.includes('type of')) {
            return `I can help you choose the right data type! Here are the options:\n\n📝 **String** - Text data (names, descriptions)\n🔢 **Number** - Numeric values (age, price, quantity)\n✅ **Boolean** - True/false values\n📅 **Date** - Date and time values\n📧 **Email** - Email addresses\n🔗 **URL** - Website links\n\nWhich field do you want to configure?`;
        }

        // Field Mapping Questions
        if (lowerQuestion.includes('map') || lowerQuestion.includes('match') || lowerQuestion.includes('connect')) {
            return `Field mapping connects your CSV columns to database fields. The AI has already suggested mappings, but you can:\n\n• Accept AI suggestions\n• Manually change any field\n• Disable fields you don't want to import\n\nWhich field mapping do you want to change?`;
        }

        // General Help
        if (lowerQuestion.includes('help') || lowerQuestion.includes('how') || lowerQuestion.includes('what')) {
            return `I can help you with:\n\n🔑 **Primary Keys** - "Which field should be the primary key?"\n🔗 **Foreign Keys** - "How do I set up foreign keys?"\n📊 **Data Types** - "What data type should I use for [field]?"\n🗺️ **Field Mapping** - "How do I map my fields?"\n\nWhat would you like to know?`;
        }

        // Specific Field Questions
        const mentionedField = csvHeaders.find(h => lowerQuestion.includes(h.toLowerCase()));
        if (mentionedField) {
            const fieldLower = mentionedField.toLowerCase();
            let suggestedType = 'string';

            if (fieldLower.includes('email')) suggestedType = 'email';
            else if (fieldLower.includes('age') || fieldLower.includes('price') || fieldLower.includes('quantity')) suggestedType = 'number';
            else if (fieldLower.includes('date') || fieldLower.includes('time')) suggestedType = 'date';
            else if (fieldLower.includes('url') || fieldLower.includes('website')) suggestedType = 'url';
            else if (fieldLower.includes('active') || fieldLower.includes('enabled')) suggestedType = 'boolean';

            return `For the field **${mentionedField}**, I recommend:\n\n📊 **Data Type**: ${suggestedType}\n\nThis is based on the field name. Does this look correct?`;
        }

        // Default Response
        return `I'm here to help you configure your data import! You can ask me:\n\n• "Which field should be the primary key?"\n• "How do I set up a foreign key?"\n• "What data type for [field name]?"\n• "Help me map my fields"\n\nWhat would you like to know?`;
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking
        setTimeout(() => {
            const response = analyzeQuestion(input);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
            setIsTyping(false);
        }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickActions = [
        { label: 'Select Primary Key', icon: Key, question: 'Which field should be the primary key?' },
        { label: 'Setup Foreign Keys', icon: Database, question: 'How do I set up foreign keys?' },
        { label: 'Choose Data Types', icon: Sparkles, question: 'Help me choose data types' }
    ];

    return (
        <>
            {/* Chatbot Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-110 z-50 flex items-center gap-2"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="font-bold">AI Assistant</span>
                </button>
            )}

            {/* Chatbot Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-slate-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold">AI Assistant</h3>
                                <p className="text-xs text-blue-100">Here to help you import data</p>
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
                    <div className="p-3 bg-slate-50 border-b border-slate-200">
                        <p className="text-xs text-slate-600 mb-2 font-bold">Quick Actions:</p>
                        <div className="flex gap-2">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setInput(action.question);
                                        setTimeout(() => handleSend(), 100);
                                    }}
                                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-xs font-medium flex items-center justify-center gap-1"
                                >
                                    <action.icon className="w-3 h-3" />
                                    {action.label.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-900'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                                        }`}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                                className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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
