# Hazoo Marketing website

Static site for https://www.hazoomarketing.com, hosted on Cloudflare Pages.

- Pages: one `.html` file per page in the root. Cloudflare serves them without `.html` (for example `/services`).
- `assets/`: stylesheet, script, logo, photo, background lines.
- `_redirects`: old addresses sent to their new pages.
- `sitemap.xml`, `robots.txt`, `404.html`.

No build step: the files are published as they are.
