import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check active sessions (Supabase)
        supabase.auth.getSession().then(({ data: { session: sbSession } }) => {
            if (sbSession) {
                setSession(sbSession);
                setUser(sbSession.user);
            }
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, sbSession) => {
            if (sbSession) {
                setSession(sbSession);
                setUser(sbSession.user);
            } else {
                setSession(null);
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        // Visual confirmation for debugging/UX
        // alert("Efetuando logout..."); // Commented out to avoid annoyance, but good for testing.
        // Actually, let's keep it implicitly via specific UI behavior, but for this 'Debug' step, I'll trust the logic update below.

        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out from Supabase:", error);
        } finally {
            // Force removal of local tokens
            localStorage.removeItem('nutriassist_active_session');

            // Aggressively clear Supabase local storage artifacts if they persist
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));

            setSession(null);
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
