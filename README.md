# Accessibility Quack Hacks

A Next.js + Supabase app with an auth-gated landing experience and an interactive full-screen Google Map for discovering accessible locations in NYC.

## Current app progress

- Unauthenticated users on `/` see a centered auth modal with:
  - Sign in
  - Sign up
- Authenticated users on `/` see:
  - Full-screen NYC map with location search
  - Browser location permission request
  - User location marker plotting
  - Top overlay search bar for place/address search
  - **Use My Location** action to re-center on current location
  - Interactive location detail panels with reviews, ratings, and service request submission

## Features

- **Location Search**: Search for addresses and places using Google Places API
- **Location Details**: View reviews, comfort ratings, and accessibility tags for each location
- **User Reviews**: Add reviews with comfort scores and accessibility information
- **Service Requests**: Report accessibility issues (broken ramps, elevator outages, etc.)
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS and shadcn/ui

## Tech stack

- **Framework**: Next.js 14+ (App Router)
- **Authentication**: Supabase Auth (SSR + client auth)
- **Styling**: Tailwind CSS + shadcn/ui
- **Maps**: Google Maps JavaScript API
- **State Management**: React Context API
- **Storage**: Browser SessionStorage (for client-side review persistence)

## Project structure

- `app/page.tsx` — Auth-gated root route
- `app/layout.tsx` — Root layout with providers
- `components/auth-landing-modal.tsx` — Authentication modal
- `components/nyc-map.tsx` — Interactive Google Map component
- `components/home-map-client.tsx` — Client-side map wrapper
- `components/location-detail-panel.tsx` — Location reviews, ratings, and service requests
- `components/selected-location-context.tsx` — Shared location state context

## Environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Setup & installation

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase project
- A Google Cloud project with Maps API enabled

### Supabase setup

1. Create/select a Supabase project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API**
3. Copy `Project URL` and `Anon Public Key`
4. Set in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = Anon Public Key

### Google Cloud setup (required for map features)

1. Create/select a Google Cloud project
2. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (recommended for address search)
3. Create an API key (Credentials → Create Credentials → API Key)
4. Restrict your API key:
   - **Application restriction**: HTTP referrers
   - **Allowed referrers**:
     - `http://localhost:3000/*` (development)
     - Your production domain (when deployed)
   - **API restriction**: Limit to Maps JavaScript API, Geocoding API, and Places API only
5. Set in `.env.local`:
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = Your API key

### Install & run locally

1. Clone the repository:
```bash
git clone <your-repo-url>
cd AccessibilityQuackHacks
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` with the variables from above

4. Start the dev server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available scripts

- `npm run dev` — Start local development server
- `npm run lint` — Run ESLint
- `npm run build` — Production build
- `npm run start` — Run production server

## Attribution & external resources

### Libraries & frameworks

- [Next.js](https://nextjs.org/) — React framework with App Router
- [React](https://react.dev/) — UI library
- [Supabase](https://supabase.com/) — Open-source Firebase alternative for auth
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) — High-quality React components

### APIs & services

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) — Interactive maps
- [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding) — Address-to-coordinates conversion
- [Google Places API](https://developers.google.com/maps/documentation/places) — Place search and autocomplete

## Security note

If any API keys are ever pushed to version control or shared publicly:

1. **Immediately revoke** the key in the provider dashboard
2. **Regenerate** a new key
3. **Update** `.env.local` with the new key
4. Consider using [git-secrets](https://github.com/awslabs/git-secrets) or similar tools to prevent future leaks

## Artificial Intelligence Use
Artifical Intelligence was used to prepare frontend templates.

## License

Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)

For more information, see the [LICENSE](./LICENSE) file or visit [creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/).
