# Marota SEO Implementation Checklist (Vite + React)

## Already implemented in this repo

- Dynamic route SEO tags in `src/components/Layout.jsx`
  - Title and description per route
  - `og:title`, `og:description`, `og:url`
  - Dynamic canonical URL per route
  - `robots`/`googlebot` control (`noindex` for login/signup/dashboard/admin/profile/my-courses/learning)
- Expanded public sitemap in `public/sitemap.xml`
  - Includes `/`, `/about`, `/courses`, `/portfolio`, `/gallery`, `/instructors`, `/contact`, `/privacy`, `/terms`
- Baseline metadata + schema in `index.html`
  - Open Graph + Twitter tags
  - `EducationalOrganization` + `WebSite` JSON-LD
  - Updated social profiles (Facebook, TikTok, Telegram, YouTube)
- Crawl allow in `public/robots.txt` with sitemap reference

## Google Search Console steps (do this now)

1. Add property: `marota.tech` as **Domain property**
2. Verify by DNS TXT record at your domain registrar
3. Submit sitemap: `https://marota.tech/sitemap.xml`
4. Use URL Inspection and request indexing for:
   - `https://marota.tech/`
   - `https://marota.tech/courses/`
   - `https://marota.tech/about/`
   - `https://marota.tech/contact/`

## Vercel + domain checks

- Ensure both `marota.tech` and `www.marota.tech` resolve to the same site (single canonical host)
- Configure one preferred host with 301 redirect (example: `www` -> root)
- Confirm HTTPS is active and automatic redirect from HTTP to HTTPS is enabled

## Technical quality checks

- Keep pages returning `200 OK` (no redirect loops)
- Ensure there is no accidental `noindex` on public pages
- Test with Rich Results Test for homepage structured data
- Run Lighthouse (mobile + desktop) and improve Core Web Vitals where possible

## Content and ranking reality

- Ranking on page 1 cannot be guaranteed immediately
- New domains often need days to weeks before stable visibility
- Publish fresh content regularly (course updates, success stories, announcements)
- Build trusted backlinks (partners, education directories, local listings)

## Suggested next improvements

- Add dedicated OG image (`/og-image.jpg`) for better social previews
- Add per-route JSON-LD where relevant (e.g., `Course` schema for courses page)
- Add internal breadcrumb navigation + `BreadcrumbList` schema
- Add server-side rendering or prerendering for better crawler consistency on JS-heavy pages
