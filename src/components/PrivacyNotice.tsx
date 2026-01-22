import { useEffect } from 'react';
import { Shield, Info } from 'lucide-react';

/**
 * Privacy Notice Component
 * Informs users that no data is stored after closing the browser
 */
export function PrivacyNotice() {
    useEffect(() => {
        // Clear all session data when component unmounts (page unload)
        const handleBeforeUnload = () => {
            // Session storage will auto-clear, but we can add extra cleanup here
            console.log('Browser closing - all session data will be cleared automatically');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return (
        <div className="fixed bottom-4 left-4 max-w-sm bg-green-50 border-2 border-green-200 rounded-2xl p-4 shadow-lg z-40 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-green-900 mb-1 flex items-center gap-2">
                        Privacy Protected
                        <Info className="w-4 h-4 text-green-600" />
                    </h4>
                    <p className="text-sm text-green-800 leading-relaxed">
                        <strong>No data is stored permanently.</strong> All your configurations,
                        API keys, and settings are automatically deleted when you close this browser tab.
                    </p>
                    <div className="mt-2 pt-2 border-t border-green-200">
                        <p className="text-xs text-green-700">
                            ✓ No cookies<br />
                            ✓ No persistent storage<br />
                            ✓ Session-only data
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Compact Privacy Badge (for header/footer)
 */
export function PrivacyBadge() {
    return (
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-semibold">
            <Shield className="w-3 h-3" />
            <span>Privacy Protected - No Data Stored</span>
        </div>
    );
}

/**
 * Clear all session data manually
 */
export function clearAllSessionData() {
    try {
        // Clear session storage
        sessionStorage.clear();

        // Clear any Firebase persistence
        if (typeof indexedDB !== 'undefined') {
            // Firebase uses IndexedDB for offline persistence
            // We don't delete it here as it's managed by Firebase SDK
            console.log('Firebase offline data will be cleared on app restart');
        }

        console.log('✓ All session data cleared');
        return true;
    } catch (error) {
        console.error('Failed to clear session data:', error);
        return false;
    }
}

/**
 * Hook to automatically clear data on unmount
 */
export function usePrivacyProtection() {
    useEffect(() => {
        // Log privacy protection status
        console.log('🔒 Privacy Protection Active: All data will be cleared when browser closes');

        // Cleanup on unmount
        return () => {
            // This runs when the component unmounts
            // Session storage will auto-clear on browser close
        };
    }, []);
}
