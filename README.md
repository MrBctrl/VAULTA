# VAULTA — Premium Digital Banking Website

**NEXCRAFT Flagship Portfolio — Project 05**
Premium Digital Banking & Financial Technology

A real Vite + React + Tailwind CSS implementation of the VAULTA homepage, built from the locked NEXCRAFT design system (colour tokens, typography, spacing, components) and the locked homepage section order.

## Stack

- **Vite** — build tool / dev server
- **React 18**
- **Tailwind CSS** — using the exact VAULTA design tokens (Midnight Navy, Electric Blue, Slate, Soft Silver, status colours)
- **lucide-react** — icon set
- Fonts: **Space Grotesk** (headlines), **Inter** (body), **JetBrains Mono** (financial figures)

## Structure

```
vaulta-web/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js       # locked VAULTA design tokens
├── postcss.config.js
├── public/
│   └── vaulta-mark.svg      # favicon
└── src/
    ├── main.jsx
    ├── App.jsx              # assembles the locked homepage sequence
    ├── index.css
    └── components/
        ├── Logo.jsx
        ├── Navbar.jsx
        ├── Hero.jsx
        ├── KeyFeatures.jsx
        ├── PersonalBanking.jsx
        ├── BusinessBanking.jsx
        ├── Cards.jsx
        ├── Investments.jsx
        ├── Security.jsx
        ├── Testimonials.jsx
        ├── DownloadApp.jsx
        └── Footer.jsx
```

## Homepage section order (locked spec)

Navigation → Hero → Key Features → Personal Banking → Business Banking → Cards → Investments → Security → Testimonials → Download App CTA → Footer

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

The production build outputs to `dist/`.

## Pushing to GitHub

This folder is already a git repository with an initial commit. To push it to your own GitHub repo:

```bash
# 1. Create a new empty repository on GitHub (no README/license), then:
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

## Design tokens implemented

| Token | Value |
|---|---|
| Navy (primary) | `#0B2545` |
| Electric Blue (secondary accent) | `#2F6FED` |
| Slate Grey | `#64748B` |
| Soft Silver | `#E2E8F0` |
| Success / Warning / Error | `#10B981` / `#F59E0B` / `#DC2626` |
| Spacing scale | 8 · 16 · 24 · 32 · 48 · 64 · 96 · 128 |
| Radius | Cards 20px · Buttons 14px · Inputs 14px · Charts 18px |

## Notes

- Balances, account numbers, and all financial figures use the `.num` utility class (JetBrains Mono, tabular numerals) per the locked typography spec.
- This is the Homepage build only. Personal Banking, Business Banking, Cards, Investments, Security, and Support are implemented as in-page sections (anchored) rather than separate routes — matching the scope of Website UI Task 1 ("Homepage (Desktop)"). Additional routed pages (Pricing, standalone Security page, Signup flow, etc.) are tracked separately in the VAULTA Asana project under **04 Website UI**.
