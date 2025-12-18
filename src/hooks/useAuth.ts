import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, type User, signInAnonymously } from 'firebase/auth';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signIn = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Auth error", error);
        }
    }

    return { user, loading, signIn };
};
