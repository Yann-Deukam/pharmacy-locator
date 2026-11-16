/**
 * src/lib/supabase.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Supabase client + typed helpers.
 *
 * MOCK MODE (default)
 *   Works with no real credentials. Auth always "succeeds" with a fake session.
 *   Favorites are stored in module-level memory only (reset on reload).
 *
 * PRODUCTION MODE
 *   1. Create a .env file at the project root:
 *        EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *        EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 *   2. Set MOCK_MODE = false below (or delete the flag and the mock block).
 *   3. Run `npx expo install @supabase/supabase-js` if not already installed.
 *
 * Database schema (run in Supabase SQL Editor):
 *   See supabase/migrations/001_init.sql
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Toggle ──────────────────────────────────────────────────────────────────
const MOCK_MODE = true; // ← set to false when you have real credentials

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  place_id: string;
  place_name: string;
  place_address: string;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
}

// ─── Production client ────────────────────────────────────────────────────────
// Uncomment this block and set MOCK_MODE = false to use real Supabase.
//
// import { createClient } from "@supabase/supabase-js";
// const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
// const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Mock client ─────────────────────────────────────────────────────────────
// In-memory state so the UI actually reacts to sign-in / sign-out.
let _mockSession: AuthSession | null = null;
let _mockFavorites: Favorite[] = [];
let _mockProfile: Profile = {
  id: "mock-user-1",
  full_name: "Demo User",
  email: "demo@pharmanear.app",
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Listeners so auth state changes propagate (mimics Supabase's onAuthStateChange)
type AuthChangeCallback = (event: "SIGNED_IN" | "SIGNED_OUT", session: AuthSession | null) => void;
const _listeners: AuthChangeCallback[] = [];

function _notify(event: "SIGNED_IN" | "SIGNED_OUT", session: AuthSession | null) {
  _listeners.forEach((cb) => cb(event, session));
}

export const supabase = MOCK_MODE
  ? ({
      auth: {
        /** Sign in with email/password. Any non-empty credentials succeed in mock mode. */
        signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
          if (!email || !password) {
            return { data: null, error: { message: "Email and password are required." } };
          }
          _mockSession = {
            user: { id: "mock-user-1", email },
            access_token: "mock-token",
          };
          _mockProfile = { ..._mockProfile, email, full_name: _mockProfile.full_name ?? "Demo User" };
          _notify("SIGNED_IN", _mockSession);
          return { data: { session: _mockSession, user: _mockSession.user }, error: null };
        },

        /** Register. Always succeeds in mock mode. */
        signUp: async ({ email, password, options }: { email: string; password: string; options?: { data?: { full_name?: string } } }) => {
          if (!email || !password) {
            return { data: null, error: { message: "Email and password are required." } };
          }
          _mockSession = {
            user: { id: "mock-user-1", email },
            access_token: "mock-token",
          };
          _mockProfile = {
            ..._mockProfile,
            email,
            full_name: options?.data?.full_name ?? "New User",
          };
          _notify("SIGNED_IN", _mockSession);
          return { data: { session: _mockSession, user: _mockSession.user }, error: null };
        },

        /** Reset password — in mock mode just logs. */
        resetPasswordForEmail: async (email: string) => {
          console.info("[Mock] Password reset email sent to", email);
          return { data: {}, error: null };
        },

        signOut: async () => {
          _mockSession = null;
          _notify("SIGNED_OUT", null);
          return { error: null };
        },

        getSession: async () => ({ data: { session: _mockSession }, error: null }),

        onAuthStateChange: (cb: AuthChangeCallback) => {
          _listeners.push(cb);
          // Return an unsubscribe object matching the real Supabase API shape
          return {
            data: {
              subscription: {
                unsubscribe: () => {
                  const idx = _listeners.indexOf(cb);
                  if (idx !== -1) _listeners.splice(idx, 1);
                },
              },
            },
          };
        },
      },

      from: (table: string) => ({
        select: (_cols = "*") => ({
          eq: (col: string, val: string) => ({
            single: async () => {
              if (table === "profiles") return { data: _mockProfile, error: null };
              return { data: null, error: null };
            },
            order: (_col: string) => ({
              data: table === "favorites" ? _mockFavorites : [],
              error: null,
            }),
            then: (resolve: any) =>
              resolve({
                data: table === "favorites" ? _mockFavorites : [],
                error: null,
              }),
          }),
        }),
        insert: async (payload: any) => {
          if (table === "favorites") {
            const row: Favorite = {
              id: `fav-${Date.now()}`,
              user_id: _mockSession?.user.id ?? "guest",
              place_id: payload.place_id,
              place_name: payload.place_name,
              place_address: payload.place_address ?? "",
              created_at: new Date().toISOString(),
            };
            _mockFavorites.push(row);
            return { data: [row], error: null };
          }
          return { data: [payload], error: null };
        },
        delete: () => ({
          eq: (col: string, val: string) => {
            if (table === "favorites") {
              _mockFavorites = _mockFavorites.filter((f: any) => f[col] !== val);
            }
            return { data: [], error: null };
          },
        }),
        update: (payload: any) => ({
          eq: async (col: string, val: string) => {
            if (table === "profiles") {
              _mockProfile = { ..._mockProfile, ...payload, updated_at: new Date().toISOString() };
            }
            return { data: _mockProfile, error: null };
          },
        }),
      }),
    } as any)
  : (() => {
      // Real Supabase — replace the stub block above with:
      // import { createClient } from "@supabase/supabase-js";
      // return createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);
      throw new Error("Set MOCK_MODE=true or provide real Supabase credentials.");
    })();
