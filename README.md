# Basera — Nepal Rental Marketplace UI

Basera is a mobile-first React + Vite user interface for a Nepal-focused rental marketplace. It offers fast browsing for renters and a lightweight owner workflow to publish and manage listings. The project uses Supabase for data storage and Cloudinary for client-side image uploads.

Key features
- Responsive, mobile-first UI with dark mode
- Browse, search and filter rental listings
- Owner dashboard to create/edit listings
- Direct contact actions (call / SMS) and map previews
- Client-side image uploads to Cloudinary (unsigned preset)
- Listing gallery with lightbox and keyboard navigation

Quick start (developer)
1. Clone the repo:

	git clone <your-repo-url>
	cd gharkhoj-rental-marketplace-ui

2. Install dependencies:

	npm install

3. Create a local `.env` at the project root with these variables:

	VITE_SUPABASE_URL=your-supabase-url
	VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
	VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
	VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

	Note: see `cloudinary/README.md` for creating an unsigned upload preset.

4. Run the dev server:

	npm run dev

5. Open the local address printed by Vite (typically http://localhost:5173 or 5174).

Environment notes
- Cloudinary: the UI uses unsigned uploads. For production, use signed uploads via a server to protect your API secret.
- Supabase: the project expects `owners` and `listings` tables. `listings.owner_id` is intended to be the owner's UUID (Supabase auth user id). Align your schema or adapt the UI accordingly.

Important files
- `src/` — application source code
- `src/components/` — main UI components and screens
- `src/lib/cloudinary.ts` — client upload helper
- `src/lib/supabase.ts` — Supabase client and helpers
- `cloudinary/README.md` — Cloudinary setup notes

Deployment
- Build:

  npm run build

- This repo includes `vercel.json` tailored for Vite; you can deploy to Vercel or any static host that supports SPA routing.





