# Weed Strain Searcher

A Vercel-ready Next.js app that searches cannabis strains and aggregates details from Leafly and AllBud.

## Included providers
- Leafly scraping adapter
- AllBud scraping adapter

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`

## Deploy to Vercel
1. Upload this folder to GitHub.
2. Import the repo into Vercel.
3. Add environment variables from `.env.example` if you want to override the built-in browser-like user agents.
4. Deploy.

## Environment variables
This app works without any required environment variables.

Optional:
- `LEAFLY_USER_AGENT`
- `ALLBUD_USER_AGENT`

If you do not set them, the app uses a normal browser-style Chrome user agent by default.

## Notes
- This project now uses only Leafly and AllBud.
- Scraping adapters may break if page structure changes.
- Use only data sources you are authorized to access.
- For production, add rate limiting and caching.

## Security note

This project is pinned to **Next.js 16.1.6** to avoid Vercel deployment failures caused by CVE-2025-66478 checks against older vulnerable versions.
