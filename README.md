# VAULTA — Premium Digital Banking Website + Banking Product

**NEXCRAFT Flagship Portfolio — Project 05**
Premium Digital Banking & Financial Technology

A real Vite + React + Tailwind CSS implementation of VAULTA, expanded from a marketing website into a complete responsive banking product: the original public marketing site, a Personal Banking Dashboard, and a Business Dashboard — all sharing one design system and one multi-currency engine.

## What's here

1. **Public marketing website** (`/`) — unchanged from the original build. Discover VAULTA, explore Personal/Business/Cards/Investments/Security, Open Account, Sign In.
2. **Personal Dashboard** (`/dashboard/*`) — the authenticated private banking experience: Overview, Accounts, Transactions, Transfers, Cards, Savings, Investments, Analytics, Security, Settings.
3. **Business Dashboard** (`/business/*`) — a parallel dashboard for business banking: Overview, Accounts, Transactions, Invoices, Expenses, Team, Cards, Payroll, Analytics, Settings.

"Open Account" and "Sign In" on the marketing site route straight into the dashboard — there's no real backend, so authentication is simulated per the "don't overbuild" guidance in the brief. All financial data is realistic mock data (`src/data/mockData.js`).

## Stack

- **Vite** + **React 18** + **React Router 6**
- **Tailwind CSS** — locked VAULTA design tokens (Midnight Navy, Electric Blue, Slate, Soft Silver, status colours)
- **lucide-react** — icon set
- Fonts: **Space Grotesk** (headlines), **Inter** (body), **JetBrains Mono** (financial figures)
- Hand-rolled SVG charts (line/donut/bar) — no chart library dependency, per the brief's performance guidance

## Multi-currency system

Every amount in the app goes through `src/lib/currency.js` — never a hardcoded `$` or `₦` anywhere else. Supports **NGN, USD, EUR, GBP, XOF** with:

- Consistent symbol-first formatting across all currencies (matches how Stripe/Wise/Revolut present multi-currency amounts, rather than each currency's native locale convention)
- A `formatConverted()` helper that always prefixes estimated cross-currency conversions with "≈" and static demo exchange rates — never presented as a live rate
- A reusable `<CurrencySelector />` component and multi-currency `<AccountCard />`

## Responsive behaviour (tested at all 4 breakpoints)

| Breakpoint | Width | Pattern |
|---|---|---|
| Desktop | 1440px+ | Full sidebar with labels |
| Laptop | 1280px | Full sidebar with labels |
| Tablet | 768–1024px | **Icon-only rail** — its own considered layout, not a squeezed sidebar |
| Mobile | 375–430px | **Bottom tab bar** (4 primary items) + "More" bottom-sheet drawer for the rest |

Tables (e.g. Invoices) convert to stacked cards on mobile. All interactive elements meet comfortable touch-target sizing on mobile.

## Structure

```
vaulta-web/
├── src/
│   ├── App.jsx                     # router — full information architecture
│   ├── pages/
│   │   ├── MarketingHome.jsx       # the original marketing site, preserved exactly
│   │   └── NotFound.jsx
│   ├── components/                 # marketing site components (unchanged)
│   ├── lib/
│   │   └── currency.js             # multi-currency formatting system
│   ├── data/
│   │   └── mockData.js             # realistic mock financial data
│   └── dashboard/
│       ├── components/             # shared dashboard UI kit (Sidebar, MobileNav,
│       │                             Topbar, StatCard, AccountCard, TransactionRow,
│       │                             CurrencySelector, LineChart, DonutChart, BarChart,
│       │                             ProgressBar, DashboardLayout, BusinessLayout)
│       ├── personal/               # 10 Personal Dashboard pages
│       └── business/               # 10 Business Dashboard pages
```

## Getting started

```bash
npm install
npm run dev
```

Visit `/` for the marketing site, `/dashboard` for the personal banking product, `/business` for the business dashboard.

### Build for production

```bash
npm run build
npm run preview
```

## Pushing to GitHub

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

## Design tokens

| Token | Value |
|---|---|
| Navy (primary) | `#0B2545` |
| Electric Blue (secondary accent) | `#2F6FED` |
| Slate Grey | `#64748B` |
| Soft Silver | `#E2E8F0` |
| Success / Warning / Error | `#10B981` / `#F59E0B` / `#DC2626` |
| Spacing scale | 8 · 16 · 24 · 32 · 48 · 64 · 96 · 128 |
| Radius | Cards 20px · Buttons 14px · Inputs 14px · Charts 18px |

## Notes on scope

- The logo remains the original flat geometric mark from the locked Design System. A 3D "gem" logo concept was shared during this build but wasn't adopted — it directly contradicts the brief's own stated philosophy (no random 3D graphics, no AI-generated visual clutter, human-crafted not AI-looking).
- This is a design/UX prototype with simulated interactions and mock data, not a production banking backend — consistent with the brief's explicit "do not overbuild" instruction.
