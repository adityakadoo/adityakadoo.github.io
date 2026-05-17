# Scrolls

Course notes and learning logs, built with [Astro](https://astro.build/) and deployed to [GitHub Pages](https://adityakadoo.github.io/).

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

Content lives in `src/content/`. Styles and fonts from the original Hugo site are in `public/css/` and `public/font/`. Course images are in `public/content-images/`.

## Deploy

Pushes to `main` deploy via GitHub Actions. In the repository **Settings → Pages**, set **Build and deployment** source to **GitHub Actions** (not the legacy `gh-pages` branch).
