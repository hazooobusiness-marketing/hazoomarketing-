# Hazoo Marketing website

Static site for https://www.hazoomarketing.com, hosted on Vercel.

- Pages: one `.html` file per page in the root. `vercel.json` turns on clean addresses, so `services.html` is served at `/services`, and `/services.html` redirects there.
- `vercel.json` also redirects old addresses from the previous site (`/booking-a-call`, `/process`, `/consultation`).
- `assets/`: stylesheet, script, logo, photo, background lines.
- `sitemap.xml`, `robots.txt`, `404.html`, site icons.
- Every page loads Google Tag Manager (GTM-MK8XSW66).

No build step: in Vercel, use Framework Preset "Other" and leave the build command empty.
