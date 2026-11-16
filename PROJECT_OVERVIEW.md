# Project scaffold overview

Below is a quick reference of every file that has been added or modified by the scaffold. All paths are **absolute** to your workspace (`c:\Users\yannd\Documents\My life\professional\pharmacy-app`).

---
## Root layout (Expo Router entry point)
- `app/_layout.tsx` – Wraps the whole app in `ThemeProvider` and `QueryClientProvider`. This replaces the default `App.tsx` UI.

## Theme system
- `src/theme/colors.ts` – Light & dark colour token definitions.
- `src/theme/ThemeProvider.tsx` – Context that manages `light|dark|system` theme, persists the choice via SecureStore, and exposes `useTheme`.
- `src/theme/index.ts` – Re‑exports `ThemeProvider`, `useTheme`, and `colors` for easy imports.

## UI components
- `src/components/ui/Header.tsx` – Consistent header with back button, settings icon, and theme toggle.

## Navigation
- `app/(tabs)/_layout.tsx` – Bottom‑tab navigator with Home, Search, Favorites, Profile tabs.
- `app/(tabs)/home.tsx` – Home screen showing a placeholder map view and a list of mock pharmacies.
- `app/(onboarding)/[...onboarding].tsx` – Three‑page onboarding flow that stores a flag in SecureStore.

## Mock data & services
- `src/lib/supabase.ts` – Stub Supabase client (mock mode). Replace with real client by uncommenting the import / `createClient` lines and adding `.env` keys.
- `src/services/mockPharmacyService.ts` – `useMockPharmacies` hook that returns a static list of pharmacies (to be swapped for a real Places API hook later).

---
## How the folder layout maps to the architecture spec
```
pharmacy-app/
│   app/                  ← Expo Router screens & layouts
│   │   _layout.tsx       ← Root layout (theme + React‑Query)
│   │   (tabs)/          ← Bottom‑tab navigator layout + tab screens
│   │   │   _layout.tsx   ← Tabs definition
│   │   │   home.tsx      ← Home (map/list) screen
│   │   (onboarding)/    ← Catch‑all onboarding segment
│   │       [...onboarding].tsx
│   
│   src/                  ← Source code (components, libs, services)
│   │   theme/            ← Theme tokens & provider
│   │   components/ui/    ← Re‑usable UI pieces (Header)
│   │   lib/              ← Supabase client wrapper
│   │   services/         ← Mock pharmacy service (replace later)
│   
│   assets/               ← Place your onboarding illustration PNGs here
│   
│   App.tsx               ← *Default Expo template – you can delete this*
```

---
## Why you still see the default template
Expo creates an `App.tsx` file that renders a simple welcome screen. As soon as a **`app/`** directory is present, **Expo Router** takes over the entry point. To see the scaffolded UI you need to **remove or ignore the default `App.tsx`**.

### Quick fix
1. Delete the file `App.tsx` (or rename it if you want to keep it for reference).
2. Run the development server again:
   ```
   npx expo start
   ```
3. The app should now start at the root layout (`app/_layout.tsx`) and show the onboarding flow, then the bottom‑tab navigator with the Home screen.

If you prefer to keep `App.tsx`, replace its contents with the following one‑liner that simply forwards to the router:
```tsx
export { default } from "expo-router";
```
This tells Expo to load the router rather than the default UI.

---
## Next steps you can take
- **Onboarding** – Add your own PNGs to `assets/` and adjust the `require` paths in `[...onboarding].tsx`.
- **Authentication** – Create `src/features/auth/` screens and replace the mock Supabase client with a real one (uncomment the import in `supabase.ts`).
- **Map** – Install `react-native-maps`, configure the Google Maps SDK, and replace the placeholder view in `home.tsx` with a `<MapView>` that consumes real pharmacy data.
- **Favorites** – Build a Zustand store that reads/writes to `supabase.from('favorites')` for logged‑in users and falls back to local storage for guests.
- **Theme toggle** – The header’s toggle already works; you can move the button to wherever you need it.

---
## Ready to continue?
Let me know which feature you’d like to implement next (e.g., authentication screens, real map integration, favorites syncing) or if you need clarification on any of the files above.

