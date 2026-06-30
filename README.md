# Forge Ledger Inventory

Inventory app shell built with Next.js App Router and Tailwind CSS.

This first version focuses on the app look and navigation structure so backend integrations can be added cleanly.

## Tech Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Planned integrations: Supabase, QuickBooks Online, GitHub, Vercel

## Run Locally

1. Install dependencies:

	npm install

2. Create your env file:

	copy .env.example .env.local

3. Start dev server:

	npm run dev

4. Open:

	http://localhost:3000

## Current App Shell

- Sidebar navigation: Dashboard, Inventory, Suppliers, Orders, Settings
- Responsive top bar and page container
- Dashboard cards and stock table placeholders
- Integration status panel driven by env placeholders

## Environment Variables

Configured in `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `QBO_CLIENT_ID`
- `QBO_CLIENT_SECRET`
- `QBO_REDIRECT_URI`
- `QBO_REALM_ID`
- `NEXT_PUBLIC_GITHUB_REPO`
- `NEXT_PUBLIC_VERCEL_PROJECT`

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the GitHub repository in Vercel.
3. Add environment variables from `.env.example` in Vercel Project Settings.
4. Deploy.

## Next Build Steps

1. Add Supabase client and schema for inventory tables.
2. Build QBO OAuth flow and token storage.
3. Add API routes for synchronization jobs.
4. Connect dashboard cards and tables to live Supabase queries.
