# Stray Dog — Shopify Theme

Kith-layout storefront for Stray Dog Clothing (streetwear: hats + tees, rescue-dog mission).

## Verify

```bash
shopify theme check        # 0 offenses expected
shopify theme dev --store <store>   # needs collaborator access
shopify theme push
```

## Local preview

`preview/index.html` is a static render of the homepage (same CSS/classes as the Liquid output).
Serve it: `cd preview && python3 -m http.server 8817`

## Required admin setup (after pushing the theme)

Collections to create (handles must match):
- `hats`, `shirts`, `coming-soon`, `new-arrivals`
- Nav/footer links fall back to `/collections/all` until these exist.

Pages to create + assign templates (Online Store → Pages → Template):
- `about` → `page.about`
- `mission` → `page.mission`
- `community` → `page.community`
- `contact` → `page.contact`
- `faq` → `page.faq`
- `size-guide` → `page.size-guide`

Products: use options named exactly `Color` and `Size` for swatches + size picker to activate.

## Structure

- `layout/theme.liquid` — main layout (cart drawer + search modal rendered here)
- `sections/header|footer.liquid` + `header-group|footer-group.json`
- Homepage sections in `templates/index.json` order:
  hero slideshow → new arrivals carousel → coming soon carousel → shop hats → shop shirts → marquee → featured drop slideshow → drop carousel → mission → community → about → values → newsletter
- `snippets/demo-products.liquid` — fallback products shown until real collections exist; every section prefers `collections[handle]` when configured
- `assets/base.css` — design tokens (Kith-style: black/white, hairline rules, uppercase labels)
- `assets/theme.js` — slideshow, carousels, drawers, ajax ATC + qty, PDP variant/size logic, predictive search, zoom
- Assets: hero-*.webp (1672×941 lifestyle), hat-*/tee-*.webp (1254² products), straydog-logo-{black,white}.png

## Editing for the merchant

All homepage sections are editable in the theme editor (images, headings, copy, links, collection sources).
Community gallery tiles accept uploaded images — the client swaps them without code.
