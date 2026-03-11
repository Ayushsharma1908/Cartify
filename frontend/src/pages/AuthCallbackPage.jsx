import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const syncSupabaseUser = useAuthStore((s) => s.syncSupabaseUser);
  const done = useRef(false);

  useEffect(() => {
    if (!supabase || done.current) return;

    const handleSession = async (session) => {
      if (done.current || !session) return;
      const ok = await syncSupabaseUser(session);
      if (ok && !done.current) {
        done.current = true;
        toast.success('Signed in with Google!');
        navigate('/', { replace: true });
      }
    };

    // Listen for auth state (Supabase parses URL hash and fires this)
    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        handleSession(session);
      }
    });

    // Check session immediately + poll briefly (hash parse can be async)
    const check = () => {
      const s = supabase.auth.session();
      if (s) handleSession(s);
    };
    check();
    const t = setInterval(check, 200);
    setTimeout(() => clearInterval(t), 3000);

    return () => {
      clearInterval(t);
      sub?.data?.unsubscribe?.();
    };
  }, [syncSupabaseUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-card px-8 py-6 text-center">
        <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-slate-700 text-sm font-medium">Finishing Google sign-in...</p>
      </div>
    </div>
  );
}
