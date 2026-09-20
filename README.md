# Textile Trade Hub

Create a modern, ultra-user-friendly B2B Textile & Commodity Trading marketplace web application optimized for mobile and desktop, inspired by WhatsApp and OLX interface style. It must be lightweight, fast, and feature a built-in Dark/Light mode toggle (especially comfortable for night viewing to protect eyes).

Here are the core features required:

1. TOP MARKET RATES TICKER CARD:

- Display a live market information banner at the very top with prices for: WTI Crude Oil, Brent Crude, Gold, Silver, and PSX 100 Index.

2. AUTHENTICATION & USER PROFILE:

- "Login with Google" via Supabase Auth (zero maintenance).

- Mandatory profile completion on first login: Full Name, Company Name, City, and WhatsApp Number.

3. POSTING SYSTEM & CATEGORIES:

- Category selection: Yarn, Cotton, Fabric.

- Input fields: Item details, Quantity, Rate, and an option to upload an image (JPEG/PNG for official company rate lists).

- Mandatory details display: Every post must clearly show the Poster's Name, Company Name, City, and a direct "Contact on WhatsApp" button.

4. FEED, SEARCH & COMMENTS:

- Main feed displaying all posts chronologically with Pinned Posts at the top.

- Smart Search bar with category filters (Yarn, Cotton, Fabric) and city filters.

- Public comment section under each post for discussions.

- Anti-spam safeguard: Daily posting limit per user and basic inappropriate word filtering.

5. ADVANCED ADMIN DASHBOARD (Private, accessible only to the site owner):

- Dynamic Site Settings: Ability to change the Website Title, Header Text, and Brand Name directly from the admin panel without editing code.

- Theme & Color Palette Switcher: An option in the admin panel to choose from 5-6 professional color schemes (including a soothing, eye-friendly Dark Mode for night use).

- Post Management: Ability to Pin/Unpin posts, delete spam posts, and block unauthorized users.

Please build a clean, production-ready frontend UI using Tailwind CSS and integrate it seamlessly with Supabase backend tables (profiles, posts, market_rates, comments). Ensure the code is robust and structured cleanly to minimize debugging and credit usage.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://texperts1.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/851f87f9-69c7-4a31-bfb6-26f8d8fdcc0f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
