/**
 * Data Upload Description Modal
 * Allows user to describe what data they're uploading before import
 */

import React, { useState } from 'react';
import { FileText, User, Calendar, Tag, ArrowRight, X } from 'lucide-react';

interface DataDescriptionModalProps {
    fileName: string;
    rowCount: number;
    onConfirm: (description: DataDescription) => void;
    onCancel: () => void;
}

export interface DataDescription {
    purpose: string;
    uploadedBy: string;
    dataSource: string;
    category: string;
    notes: string;
    timestamp: string;
}

export const DataDescriptionModal: React.FC<DataDescriptionModalProps> = ({
    fileName,
    rowCount,
    onConfirm,
    onCancel
}) => {
    const [description, setDescription] = useState<DataDescription>({
        purpose: '',
        uploadedBy: '',
        dataSource: '',
        category: '',
        notes: '',
        timestamp: new Date().toISOString()
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};

        if (!description.purpose.trim()) {
            newErrors.purpose = 'Please describe the purpose of this data';
        }
        if (!description.uploadedBy.trim()) {
            newErrors.uploadedBy = 'Please enter your name';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onConfirm(description);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-3xl font-black mb-2">Describe Your Data</h2>
                            <p className="text-blue-100">
                                Tell us about the data you're uploading for better tracking
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-white/20 rounded-xl transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
                            <div className="text-sm font-bold">File: {fileName}</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
                            <div className="text-sm font-bold">{rowCount} rows</div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Purpose */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            What is this data for? *
                        </label>
                        <textarea
                            value={description.purpose}
                            onChange={(e) => {
                                setDescription({ ...description, purpose: e.target.value });
                                setErrors({ ...errors, purpose: '' });
                            }}
                            placeholder="e.g., Customer data for Q4 2024, Product inventory update, User registration records..."
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none resize-none ${errors.purpose
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-slate-300 focus:border-blue-500'
                                }`}
                            rows={3}
                        />
                        {errors.purpose && (
                            <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>
                        )}
                    </div>

                    {/* Uploaded By */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <User className="w-4 h-4 text-green-600" />
                            Who is uploading this data? *
                        </label>
                        <input
                            type="text"
                            value={description.uploadedBy}
                            onChange={(e) => {
                                setDescription({ ...description, uploadedBy: e.target.value });
                                setErrors({ ...errors, uploadedBy: '' });
                            }}
                            placeholder="Your name or team name"
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none ${errors.uploadedBy
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-slate-300 focus:border-blue-500'
                                }`}
                        />
                        {errors.uploadedBy && (
                            <p className="text-red-500 text-sm mt-1">{errors.uploadedBy}</p>
                        )}
                    </div>

                    {/* Data Source */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            Where did this data come from?
                        </label>
                        <input
                            type="text"
                            value={description.dataSource}
                            onChange={(e) => setDescription({ ...description, dataSource: e.target.value })}
                            placeholder="e.g., CRM export, Manual entry, API integration, Excel spreadsheet..."
                            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <Tag className="w-4 h-4 text-orange-600" />
                            Category
                        </label>
                        <select
                            value={description.category}
                            onChange={(e) => setDescription({ ...description, category: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Select a category...</option>
                            <option value="customers">Customers</option>
                            <option value="products">Products</option>
                            <option value="orders">Orders</option>
                            <option value="users">Users</option>
                            <option value="inventory">Inventory</option>
                            <option value="financial">Financial</option>
                            <option value="analytics">Analytics</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <FileText className="w-4 h-4 text-slate-600" />
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            value={description.notes}
                            onChange={(e) => setDescription({ ...description, notes: e.target.value })}
                            placeholder="Any additional information about this data..."
                            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                        <p className="text-sm text-blue-900">
                            <strong>Why we ask:</strong> This information helps track data sources, maintain audit trails, and makes it easier to understand your data later.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-6 bg-slate-50 flex justify-between items-center">
                    <div className="text-sm text-slate-600">
                        * Required fields
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2"
                        >
                            Continue to Import
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
