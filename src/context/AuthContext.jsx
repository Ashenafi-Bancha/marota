/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(true);
  const [signOutError, setSignOutError] = useState(null);

  const resolveRole = async (currentUser) => {
    if (!currentUser) {
      setRole("student");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (!error && data?.role) {
        setRole(String(data.role).toLowerCase());
        return;
      }

      const metadataRole = String(currentUser.user_metadata?.role || "").trim();
      if (metadataRole) {
        setRole(metadataRole.toLowerCase());
        return;
      }

      setRole("student");
    } catch {
      const metadataRole = String(currentUser.user_metadata?.role || "").trim();
      setRole(metadataRole ? metadataRole.toLowerCase() : "student");
    }
  };

  const ensureProfile = async (currentUser) => {
    if (!currentUser) return;

    const fallbackName = currentUser.email
      ? currentUser.email.split("@")[0]
      : "Student";

    const payload = {
      id: currentUser.id,
      full_name: currentUser.user_metadata?.full_name || fallbackName,
      phone: currentUser.user_metadata?.phone || null,
      role: "student",
    };

    await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user ?? null;
        setUser(sessionUser);
        resolveRole(sessionUser);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        if (sessionUser) {
          ensureProfile(sessionUser);
        }
        resolveRole(sessionUser);
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setSignOutError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSignOutError(error.message);
      return { error };
    }
    setUser(null);
    setRole("student");
    return { error: null };
  };

  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, role, isAdmin, loading, signOut, signOutError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
