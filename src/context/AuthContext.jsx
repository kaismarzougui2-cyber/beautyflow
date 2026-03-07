import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);

  const loadProfile = async (uid) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    setProfile(data ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setUser(null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  // role: 'pro' | 'client'
  const signUp = (email, password, role = "pro") =>
    supabase.auth.signUp({ email, password, options: { data: { role } } });

  const signOut = () => supabase.auth.signOut();

  const saveProfile = async (data) => {
    const { data: updated, error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...data })
      .select()
      .single();
    if (!error) setProfile(updated);
    return { data: updated, error };
  };

  return (
    <AuthCtx.Provider value={{ user, profile, signIn, signUp, signOut, saveProfile, loadProfile }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
