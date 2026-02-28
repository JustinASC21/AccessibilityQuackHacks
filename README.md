# Accessibility Quack Hacks

A Next.js + Supabase app with an auth-gated landing experience and a full-screen Google Map.

## Current app progress

- Unauthenticated users on `/` see a centered auth modal with:
  - Sign in
  - Sign up
- Authenticated users on `/` see a full-screen NYC map.
- The map now supports:
  - Browser location permission request
  - Plotting the user location marker
  - A top overlay search bar for place/address search
  - A **Use My Location** action to re-center on current location

## Tech stack

- Next.js (App Router)
- Supabase Auth (SSR + client auth)
- Tailwind CSS + shadcn/ui
- Google Maps JavaScript API

## Environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Google Cloud setup (required for map features)

In the same Google Cloud project as your API key, enable:

- Maps JavaScript API
- Geocoding API
- Places API (recommended)

Then restrict your API key:

- Application restriction: **HTTP referrers**
- Add local/dev origins, e.g.:
  - `http://localhost:3000/*`
- Add your production domain when deployed
- API restriction: limit to only the APIs above

## Supabase setup

1. Create/select a Supabase project.
2. Copy values from **Project Settings → API**.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`.

## Start developing locally

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open:

- http://localhost:3000

## Useful scripts

- `npm run dev` — start local development server
- `npm run lint` — run ESLint
- `npm run build` — production build
- `npm run start` — run production server

## Project notes

- Root route behavior is auth-gated in `app/page.tsx`.
- Landing auth modal is in `components/auth-landing-modal.tsx`.
- Interactive map is in `components/nyc-map.tsx`.

## Security note

If any API keys are ever shared publicly, rotate/regenerate them immediately in the provider dashboard and update `.env.local`.
