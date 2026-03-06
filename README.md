# Weed Strain Searcher

A Vercel-ready Next.js app that searches cannabis strains and aggregates details across multiple providers.

## Included providers
- Cannlytics
- Otreeba
- Leafly scraping fallback
- AllBud scraping fallback

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
3. Add environment variables from `.env.example`.
4. Deploy.

## Notes
- Scraping adapters are fallbacks and may break if page structure changes.
- Use only data sources you are authorized to access.
- For production, add rate limiting and caching.


## Security note

This project is pinned to **Next.js 16.1.6** to avoid Vercel deployment failures caused by CVE-2025-66478 checks against older vulnerable versions.
