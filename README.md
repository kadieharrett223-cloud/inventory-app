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

- Operational modules: Product Mapping, New Orders/Invoicing, Containers, Container Log, Products, Availability
- Container detail pages with milestone timeline and line-level product visibility
- Receipt-aware availability calculations (received containers add units into floor availability)
- API routes for container log fetch and tracking refresh

## Environment Variables

Configured in `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `QBO_CLIENT_ID`
- `QBO_CLIENT_SECRET`
- `QBO_REDIRECT_URI`
- `QBO_REALM_ID`
- `TRACKING_API_BASE_URL`
- `TRACKING_API_KEY`
- `NEXT_PUBLIC_GITHUB_REPO`
- `NEXT_PUBLIC_VERCEL_PROJECT`

## Supabase Setup

1. Open your Supabase SQL editor.
2. Run the schema file at [supabase/schema.sql](supabase/schema.sql).
3. Seed initial data (optional) from your own imports or scripts.

## Container Log APIs

- GET [src/app/api/container-log/route.ts](src/app/api/container-log/route.ts): returns container log records including line counts and total units.
- POST [src/app/api/container-log/[containerId]/refresh/route.ts](src/app/api/container-log/%5BcontainerId%5D/refresh/route.ts): refreshes tracking milestones, updates container status/inventory status.

When tracking credentials are not configured, refresh uses fallback milestone logic.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the GitHub repository in Vercel.
3. Add environment variables from `.env.example` in Vercel Project Settings.
4. Deploy.

## Next Build Steps

1. Replace static page datasets with live Supabase reads on all module pages.
2. Add QBO webhook ingestion for paid and partially paid invoices.
3. Add supplier/PO intake forms and persist container line entries through API routes.
4. Add auth and role permissions for sales, warehouse, and management users.
