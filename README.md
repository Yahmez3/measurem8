# MeasureMate — Universal Unit Converter

A fully static, dependency-free unit converter site: 10 measurement families,
family-aware grey-out of incompatible units, and an ingredient-accurate
cups ↔ grams cooking converter (36 ingredients with published spoon-and-level
densities).

## Files

| File | Purpose |
|---|---|
| `index.html` | Home: the tool + 800-word explainer + quick-reference tables |
| `app.js` | All converter logic and unit/ingredient data |
| `styles.css` | Site-wide styles (soft stone palette, teal accent) |
| `cups-to-grams.html` | Landing page, tool preset to cooking → flour, cups → g |
| `cm-to-inches.html` | Landing page, tool preset to cm → inches |
| `celsius-to-fahrenheit.html` | Landing page, tool preset to °C → °F |
| `faq.html`, `about.html`, `contact.html`, `privacy.html`, `terms.html` | Supporting pages (AdSense requirements) |

## Deploying

No build step. Upload the folder to any static host — Cloudflare Pages,
Netlify, GitHub Pages, or plain S3. To preview locally:

```sh
node serve.js          # http://localhost:8413 (or: python3 -m http.server 8413)
```

(`serve.js` is a dependency-free static server for local preview only — don't
upload it, or do; it's harmless on a static host.)

## Before going live

1. **AdSense** — the site-level loader script (ca-pub-7686583236583712) is in
   the `<head>` of every page, and `ads.txt` is at the root. Remaining: once
   the site is approved, either enable **Auto ads** in the AdSense dashboard
   (then consider removing the placeholder `.ad-slot` boxes), or create
   display ad units and paste their `<ins class="adsbygoogle">` code into the
   labelled `.ad-slot` blocks (search the HTML for `AdSense:` comments —
   index has three, landing pages/FAQ/contact/privacy two, about/terms one).
2. **Contact email** — done: `hello@measurem8.app` is on the contact page,
   forwarding to the owner's inbox via Cloudflare Email Routing (manage rules
   in the Cloudflare dashboard → measurem8.app → Email Routing).
3. **Domain** — done: the site is wired for **https://measurem8.app** —
   canonical + Open Graph tags on every page, plus `sitemap.xml` and
   `robots.txt`. After deploying, submit the sitemap in Google Search Console.
   (If the domain ever changes, find-and-replace `measurem8.app` across the
   HTML files, sitemap and robots.txt.)
4. **Brand** — the site is named "MeasureMate"; rename by find-and-replace
   across the HTML files if you prefer something else.

## Presets / deep links

The tool reads data attributes on `#converter-root` and URL parameters:
`?tab=cooking&ingredient=sugar-brown&ckfrom=cup&ckto=g&amount=2` or
`?from=km&to=mile&amount=10` — handy for linking specific conversions
from future content pages.
