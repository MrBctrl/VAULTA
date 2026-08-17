// VAULTA Multi-Currency System
// Reusable currency configuration + formatting. Never hardcode a currency
// symbol or Intl locale anywhere else in the app — always go through here.

export const CURRENCIES = {
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    flag: '🇳🇬',
    locale: 'en-NG',
    // Static demo rate: units of this currency per 1 USD.
    // Clearly a prototype figure — see formatConverted() below for the
    // "estimated" labelling requirement from the brief.
    perUSD: 1615,
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    locale: 'en-US',
    perUSD: 1,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    locale: 'de-DE',
    perUSD: 0.92,
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    locale: 'en-GB',
    perUSD: 0.78,
  },
  XOF: {
    code: 'XOF',
    name: 'West African CFA Franc',
    symbol: 'CFA',
    flag: '🌍',
    locale: 'fr-SN',
    perUSD: 603,
  },
}

export const CURRENCY_LIST = Object.values(CURRENCIES)

/**
 * Format a numeric amount in a given currency.
 *
 * Deliberately uses a consistent "symbol + en-US-style grouping" format
 * for every currency (symbol first, comma thousands separator, period
 * decimal) rather than each currency's native locale convention (e.g.
 * German Euro formatting would put the symbol last: "1.234,56 €").
 * This matches how real global fintech products (Stripe, Wise, Revolut)
 * present multi-currency amounts — consistent formatting across the
 * interface reads as more trustworthy than locale-accurate-but-inconsistent
 * formatting when currencies are shown side by side.
 */
export function formatCurrency(amount, currencyCode = 'NGN', options = {}) {
  const currency = CURRENCIES[currencyCode] ?? CURRENCIES.NGN
  const { compact = false } = options

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
    notation: compact ? 'compact' : 'standard',
  }).format(amount)

  return `${currency.symbol}${currency.code === 'XOF' ? ' ' : ''}${formatted}`
}

/** Convert an amount from one currency to another using static demo rates. */
export function convert(amount, fromCode, toCode) {
  const from = CURRENCIES[fromCode] ?? CURRENCIES.NGN
  const to = CURRENCIES[toCode] ?? CURRENCIES.NGN
  const usd = amount / from.perUSD
  return usd * to.perUSD
}

/**
 * Format an estimated converted value. Always prefixed with "≈" and
 * labelled — per the brief, converted values must never be presented as
 * live/authoritative figures.
 */
export function formatConverted(amount, fromCode, toCode) {
  const converted = convert(amount, fromCode, toCode)
  return `≈ ${formatCurrency(converted, toCode)}`
}
