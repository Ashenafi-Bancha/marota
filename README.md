# Marota Website (Frontend)

A modern React + Vite web platform for **Marota Film and Software College**.

Production domain: **https://marota.tech**

---

## Overview

This frontend delivers:

- Public marketing pages (Home, About, Courses, Portfolio, Gallery, Instructors, Contact)
- Authentication (Email/Password + OAuth providers)
- Student experience (Dashboard, My Courses, Learning, Profile)
- Admin access flow
- Multi-theme UX (Marota, Dark, Bright)
- SEO-ready metadata, schema, `robots.txt`, and `sitemap.xml`

---

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 7
- **Routing:** React Router
- **Styling:** Tailwind CSS v4 + custom theme tokens
- **Auth & Data:** Supabase
- **Icons:** `react-icons`, `lucide-react`
- **Utilities:** `axios`, `qrcode`, `jspdf`

---

## Project Structure

```text
frontend/
├─ public/
│  ├─ robots.txt
│  └─ sitemap.xml
├─ src/
│  ├─ components/
│  ├─ context/
│  ├─ data/
│  ├─ lib/
│  ├─ pages/
│  ├─ utils/
│  ├─ App.jsx
│  ├─ index.css
│  └─ main.jsx
├─ index.html
├─ package.json
└─ vercel.json
```

---

## Key Features

### 1) Route-based Rendering

The app is structured as route pages instead of one long-scroll render for better UX and SEO:

- `/`
- `/about`
- `/courses`
- `/portfolio`
- `/gallery`
- `/instructors`
- `/contact`

### 2) Authentication

- Email/password login/register
- OAuth providers integrated in auth UI
- Protected routes for student/admin areas

### 3) Theming

Three available themes:

- **Marota** (default)
- **Dark**
- **Bright**

Theme is managed globally via context and UI icon switcher.

### 4) SEO Foundation

- Route-aware title + meta description updates
- Canonical URL updates per route
- Open Graph + Twitter metadata
- Structured data (`EducationalOrganization`, `WebSite`)
- `robots.txt` and `sitemap.xml`

---

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env` in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview production build

```bash
npm run preview
```

---

## Available Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview built app
- `npm run lint` — run ESLint
- `npm run deploy` — deploy `dist` to GitHub Pages

---

## Deployment

### Vercel

The project includes SPA rewrite rules in `vercel.json`:

```json
{
	"rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

This ensures deep routes work in production.

### Domain

Configured public domain:

- `https://marota.tech`

---

## SEO Operations Checklist

After each meaningful public content update:

1. Verify metadata on key routes (`/`, `/courses`, `/about`, `/contact`)
2. Confirm `public/sitemap.xml` includes all indexable pages
3. Confirm `public/robots.txt` points to sitemap
4. Build and deploy
5. In Google Search Console:
	 - Submit/refresh sitemap
	 - Request indexing for priority routes

For full operational guidance, see `SEO_CHECKLIST.md`.

---

## Security Notes

- Never commit secrets to the repository
- Keep Supabase keys in environment variables only
- Use route guards for protected pages

---

## Contribution Workflow

1. Create a feature branch
2. Make focused changes
3. Run:

```bash
npm run lint
npm run build
```

4. Open PR with clear scope and screenshots for UI changes

---

## Maintainers

Marota development team.

For updates, issues, and improvements, open a GitHub issue or PR.
