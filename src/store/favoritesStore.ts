/**
 * src/store/favoritesStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Zustand store for favorites.
 * - Guests: favorites are kept in-memory only (lost on reload, by design).
 * - Authenticated users: synced to Supabase.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { create } from "zustand";
import { supabase, type Favorite } from "@/lib/supabase";

interface FavoritesState {
  favorites: Favorite[];
  isLoading: boolean;

  /** Load favorites for the current user from Supabase (or leave empty for guests) */
  load: (userId: string) => Promise<void>;
  /** Add a pharmacy to favorites */
  add: (userId: string, placeId: string, placeName: string, placeAddress: string) => Promise<void>;
  /** Remove a pharmacy from favorites */
  remove: (userId: string, placeId: string) => Promise<void>;
  /** Is a given place already a favorite? */
  isFavorite: (placeId: string) => boolean;
  /** Clear local state on sign-out */
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,

  load: async (userId) => {
    set({ isLoading: true });
    // Real Supabase: await supabase.from("favorites").select("*").eq("user_id", userId).order("created_at")
    const result = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at");
    set({ favorites: result.data ?? [], isLoading: false });
  },

  add: async (userId, placeId, placeName, placeAddress) => {
    if (get().isFavorite(placeId)) return;
    const { data, error } = await supabase.from("favorites").insert({
      user_id: userId,
      place_id: placeId,
      place_name: placeName,
      place_address: placeAddress,
    });
    if (!error && data?.[0]) {
      set((s) => ({ favorites: [...s.favorites, data[0]] }));
    }
  },

  remove: async (userId, placeId) => {
    await supabase.from("favorites").delete().eq("place_id", placeId);
    set((s) => ({ favorites: s.favorites.filter((f) => f.place_id !== placeId) }));
  },

  isFavorite: (placeId) => get().favorites.some((f) => f.place_id === placeId),

  clear: () => set({ favorites: [] }),
}));

