/**
 * src/services/mockPharmacyService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Mock pharmacy data + TanStack Query hook.
 *
 * TO SWITCH TO REAL DATA:
 *   Replace `useMockPharmacies` with `usePharmacies` from
 *   `@/services/pharmacyService` (create that file, call your Supabase Edge
 *   Function that wraps the Google Places Nearby Search API).
 *
 *   The `Pharmacy` type below is intentionally identical to what the real
 *   service returns so the swap is a one-line import change in home.tsx.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useQuery } from "@tanstack/react-query";

export interface Pharmacy {
  placeId: string;
  name: string;
  address: string;
  openNow: boolean;
  is24h: boolean;
  latitude: number;
  longitude: number;
  distance?: number; // metres from user, computed client-side
  phone?: string;
  rating?: number;
  ratingCount?: number;
  website?: string;
}

// 10 richer mock entries spread around Douala
const MOCK_DATA: Pharmacy[] = [
  {
    placeId: "mock-1",
    name: "Pharmacie Centrale",
    address: "123 Rue de la Liberté, Bonanjo, Douala",
    openNow: true,
    is24h: false,
    latitude: 4.0485,
    longitude: 9.7045,
    distance: 320,
    phone: "+237 233 42 10 00",
    rating: 4.3,
    ratingCount: 87,
  },
  {
    placeId: "mock-2",
    name: "Pharmacie du Marché",
    address: "45 Avenue de la République, Akwa, Douala",
    openNow: false,
    is24h: false,
    latitude: 4.0501,
    longitude: 9.7002,
    distance: 740,
    phone: "+237 233 42 55 11",
    rating: 3.9,
    ratingCount: 44,
  },
  {
    placeId: "mock-3",
    name: "Pharmacie 24/7 Santé",
    address: "78 Boulevard du Littoral, Bali, Douala",
    openNow: true,
    is24h: true,
    latitude: 4.0523,
    longitude: 9.706,
    distance: 1100,
    phone: "+237 243 00 24 24",
    rating: 4.7,
    ratingCount: 212,
  },
  {
    placeId: "mock-4",
    name: "Pharmacie Nouvelle Vie",
    address: "12 Rue Joffre, Bonapriso, Douala",
    openNow: true,
    is24h: false,
    latitude: 4.045,
    longitude: 9.698,
    distance: 2300,
    phone: "+237 233 43 00 01",
    rating: 4.1,
    ratingCount: 63,
  },
  {
    placeId: "mock-5",
    name: "Pharmacie Bonaberi",
    address: "5 Carrefour Bonaberi, Douala",
    openNow: false,
    is24h: false,
    latitude: 4.072,
    longitude: 9.675,
    distance: 4800,
    phone: "+237 233 87 15 00",
    rating: 3.6,
    ratingCount: 29,
  },
  {
    placeId: "mock-6",
    name: "Pharmacie du Peuple",
    address: "Avenue Ahmadou Ahidjo, Douala",
    openNow: true,
    is24h: true,
    latitude: 4.055,
    longitude: 9.712,
    distance: 980,
    phone: "+237 233 42 88 77",
    rating: 4.5,
    ratingCount: 134,
    website: "https://pharmaciedupeuple.cm",
  },
];

/**
 * Returns pharmacies filtered by radius and optionally by open status.
 * In production this would be a network call; here we just filter mock data.
 */
export function useMockPharmacies(options?: {
  maxDistanceMetres?: number; // undefined = all
  onlyOpen?: boolean;
}) {
  const { maxDistanceMetres, onlyOpen } = options ?? {};

  return useQuery<Pharmacy[]>({
    queryKey: ["mockPharmacies", maxDistanceMetres, onlyOpen],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 600)); // simulate latency
      let results = [...MOCK_DATA];
      if (maxDistanceMetres !== undefined) {
        results = results.filter((p) => (p.distance ?? 0) <= maxDistanceMetres);
      }
      if (onlyOpen) {
        results = results.filter((p) => p.openNow);
      }
      return results.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    },
  });
}
