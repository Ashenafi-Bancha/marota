# Marota Film and Software Collage Website

# Marota Film and Software College Website

## Project Overview

This project is the official website developed for **Marota Film and Software College**.  
The website was designed to provide information about the college, its courses, and its mission to empower young people through technology and creative media education.

The platform also serves as a digital gateway where students can explore available programs and learn more about the institution.

## Purpose of the Website

The website was created to:

- Present the **identity and vision** of Marota Film and Software College
- Showcase the **courses and training programs**
- Provide a **modern online presence** for the college
- Make it easier for students to **discover and enroll in courses**

## Key Features

- Modern and responsive design
- Course showcase section
- Information about the college and its mission
- Social media integration
- Clean and user-friendly interface

## Technologies Used

The website was developed using modern web technologies including:

- **React.js**
- **Tailwind CSS**
- **Node.js**
- **Express.js**
- **PostgreSQL**

These technologies ensure that the platform is scalable, fast, and easy to maintain.

## Developer

This website was designed and developed by:

**Ashenafi Bancha**  
Full-Stack Web Developer

The goal of this project was to create a **professional, modern, and scalable platform** that represents the vision of Marota and helps connect students with technology and creative opportunities.

## Future Improvements

Planned future improvements include:

- Online course enrollment system
- Student portal
- Learning management system
- Online certification system
- Blog and learning resources

---

Marota is not just a training center — it is a **gateway to technology and limitless creativity**.

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
