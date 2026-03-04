import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useAdmin() {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function checkAdmin() {
            if (!user) {
                if (mounted) {
                    setIsAdmin(false);
                    setLoading(false);
                }
                return;
            }
            try {
                const { data, error } = await supabase.rpc('is_admin');
                if (error) throw error;
                if (mounted) {
                    setIsAdmin(data === true);
                }
            } catch (error) {
                console.error("Error checking admin status:", error);
                if (mounted) setIsAdmin(false);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        checkAdmin();

        return () => { mounted = false; };
    }, [user]);

    return { isAdmin, loading };
}
