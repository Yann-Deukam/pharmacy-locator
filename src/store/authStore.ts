/**
 * src/store/authStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Zustand store for authentication state.
 * Wraps the Supabase auth layer so the UI only ever reads from here.
 *
 * Usage:
 *   const { user, isGuest, signIn, signOut } = useAuthStore();
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { create } from "zustand";
import { supabase, type AuthUser } from "@/lib/supabase";

interface AuthState {
  user: AuthUser | null;
  /** True when the user chose "Continue as guest" */
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;

  /** Initialise — call once at app startup to restore session */
  init: () => Promise<void>;

  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;

  /** Let the user skip auth and browse anonymously */
  continueAsGuest: () => void;
  /** Call this when a guest tries a protected action to show the login modal */
  requireAuth: () => boolean; // returns true if already authed, false if guest
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isGuest: false,
  isLoading: true,
  error: null,

  init: async () => {
    set({ isLoading: true });
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user ?? null;
    set({ user, isLoading: false });

    // Subscribe to future auth changes
    supabase.auth.onAuthStateChange((event: string, session: any) => {
      set({ user: session?.user ?? null, isGuest: false });
    });
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
    set({ user: data.user, isGuest: false, isLoading: false });
    return { success: true };
  },

  signUp: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
    set({ user: data.user, isGuest: false, isLoading: false });
    return { success: true };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isGuest: false });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  continueAsGuest: () => set({ isGuest: true, user: null }),

  requireAuth: () => {
    const { user, isGuest } = get();
    return !!(user && !isGuest);
  },
}));

