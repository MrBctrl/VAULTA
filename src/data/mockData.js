// Realistic mock data for the VAULTA Personal Dashboard prototype.
// Static/simulated per the brief — no real financial infrastructure.

export const user = {
  firstName: 'Alexander',
  fullName: 'Alexander Okafor',
  primaryCurrency: 'NGN',
}

export const accounts = [
  { id: 'ngn', currency: 'NGN', label: 'Naira Account', balance: 4820500.0, accountNumber: '2201 5590 3312' },
  { id: 'usd', currency: 'USD', label: 'Dollar Account', balance: 8240.0, accountNumber: '4471 0092 1187' },
  { id: 'eur', currency: 'EUR', label: 'Euro Account', balance: 3420.5, accountNumber: '7712 4483 0056' },
  { id: 'gbp', currency: 'GBP', label: 'Pound Account', balance: 1250.0, accountNumber: '9034 1120 6678' },
  { id: 'xof', currency: 'XOF', label: 'CFA Account', balance: 1850000.0, accountNumber: '3390 2214 8801' },
]

export const overview = {
  totalBalanceNGN: 48920000.0, // net worth estimate, converted to primary currency
  availableToSpendNGN: 12450000.0,
  investmentsNGN: 128450000.0,
  investmentsChangePct: 12.4,
  savingsNGN: 8240000.0,
}

export const transactions = [
  { id: 1, name: 'Netflix', category: 'Entertainment', date: '2026-08-06', currency: 'NGN', amount: -8500, type: 'debit' },
  { id: 2, name: 'Salary — NEXCRAFT Ltd', category: 'Income', date: '2026-08-05', currency: 'NGN', amount: 850000, type: 'credit' },
  { id: 3, name: 'Amazon Web Services', category: 'Business', date: '2026-08-05', currency: 'USD', amount: -42.18, type: 'debit' },
  { id: 4, name: 'Client Payment — Adaeze O.', category: 'Income', date: '2026-08-04', currency: 'NGN', amount: 450000, type: 'credit' },
  { id: 5, name: 'Spotify', category: 'Entertainment', date: '2026-08-03', currency: 'NGN', amount: -2500, type: 'debit' },
  { id: 6, name: 'International Transfer — Berlin', category: 'Transfer', date: '2026-08-02', currency: 'EUR', amount: -250, type: 'debit' },
  { id: 7, name: 'Ikeja City Mall', category: 'Shopping', date: '2026-08-01', currency: 'NGN', amount: -34200, type: 'debit' },
  { id: 8, name: 'Uber', category: 'Transport', date: '2026-07-31', currency: 'NGN', amount: -4100, type: 'debit' },
  { id: 9, name: 'Jumia', category: 'Shopping', date: '2026-07-30', currency: 'NGN', amount: -18900, type: 'debit' },
  { id: 10, name: 'GTBank Transfer — Chidinma E.', category: 'Transfer', date: '2026-07-29', currency: 'NGN', amount: -100000, type: 'debit' },
  { id: 11, name: 'Freelance Payment', category: 'Income', date: '2026-07-28', currency: 'USD', amount: 1200, type: 'credit' },
  { id: 12, name: 'Ikeja Electric', category: 'Bills', date: '2026-07-27', currency: 'NGN', amount: -22000, type: 'debit' },
]

export const beneficiaries = [
  { id: 1, name: 'John Doe', bank: 'GTBank', accountNumber: '0123456789' },
  { id: 2, name: 'Chidinma Eze', bank: 'Access Bank', accountNumber: '0198765432' },
  { id: 3, name: 'Marcus Thompson', bank: 'Chase Bank (US)', accountNumber: '****4471' },
]

export const cards = [
  {
    id: 'personal',
    type: 'Personal Card',
    variant: 'physical',
    last4: '4471',
    holder: 'ALEXANDER OKAFOR',
    expiry: '09/29',
    currency: 'NGN',
    balance: 4820500.0,
    frozen: false,
    spendingLimit: 500000,
  },
  {
    id: 'virtual',
    type: 'Virtual Card',
    variant: 'virtual',
    last4: '8823',
    holder: 'ALEXANDER OKAFOR',
    expiry: '02/28',
    currency: 'USD',
    balance: 8240.0,
    frozen: false,
    spendingLimit: 2000,
  },
  {
    id: 'business',
    type: 'Business Card',
    variant: 'business',
    last4: '2290',
    holder: 'NEXCRAFT CREATIVE STUDIO',
    expiry: '11/28',
    currency: 'NGN',
    balance: 2450000.0,
    frozen: true,
    spendingLimit: 1000000,
  },
]

export const savingsGoals = [
  { id: 1, name: 'Emergency Fund', target: 2000000, saved: 750000, currency: 'NGN' },
  { id: 2, name: 'Travel Fund', target: 1000000, saved: 420000, currency: 'NGN' },
  { id: 3, name: 'New MacBook', target: 1800000, saved: 1260000, currency: 'NGN' },
]

export const investmentAllocation = [
  { label: 'Equities', pct: 38, color: '#2F6FED' },
  { label: 'Bonds', pct: 22, color: '#0B2545' },
  { label: 'ETFs', pct: 24, color: '#64748B' },
  { label: 'Funds', pct: 11, color: '#10B981' },
  { label: 'Cash', pct: 5, color: '#E2E8F0' },
]

export const portfolioHistory = [82, 86, 84, 91, 95, 93, 101, 108, 104, 112, 121, 128.45]

export const spendingCategories = [
  { label: 'Housing', amount: 320000, color: '#0B2545' },
  { label: 'Food', amount: 148000, color: '#2F6FED' },
  { label: 'Transport', amount: 62000, color: '#64748B' },
  { label: 'Entertainment', amount: 41000, color: '#10B981' },
  { label: 'Shopping', amount: 96000, color: '#F59E0B' },
  { label: 'Bills', amount: 74000, color: '#DC2626' },
]

export const spendingTrend = [612000, 580000, 705000, 641000, 690000, 741000]

export const securityScore = 94

export const loginActivity = [
  { device: 'iPhone 15 Pro — Lagos, NG', time: 'Today, 08:14', status: 'This device' },
  { device: 'MacBook Pro — Lagos, NG', time: 'Yesterday, 21:02', status: 'Trusted' },
  { device: 'Chrome on Windows — Abuja, NG', time: '3 days ago', status: 'Trusted' },
]

// ---- Business dashboard mock data ----

export const business = {
  name: 'NEXCRAFT Creative Studio',
  cashPositionNGN: 24850000.0,
  revenueNGN: 8420000.0,
  expensesNGN: 3180000.0,
  outstandingInvoicesNGN: 2450000.0,
}

export const invoices = [
  { id: 'INV-0231', client: 'Aurora Estates', amount: 1200000, currency: 'NGN', status: 'Paid', date: '2026-08-02' },
  { id: 'INV-0232', client: 'Lagos Fintech Summit', amount: 850000, currency: 'NGN', status: 'Outstanding', date: '2026-08-04' },
  { id: 'INV-0233', client: 'Ember & Oak Ltd', amount: 400000, currency: 'NGN', status: 'Outstanding', date: '2026-08-06' },
  { id: 'INV-0234', client: 'Lumen Education Group', amount: 620000, currency: 'NGN', status: 'Paid', date: '2026-07-29' },
]

export const team = [
  { id: 1, name: 'Adaeze Obi', role: 'Lead Designer', spend: 184000, cardActive: true },
  { id: 2, name: 'Tunde Alabi', role: 'Frontend Engineer', spend: 96000, cardActive: true },
  { id: 3, name: 'Ifeoma Kalu', role: 'Operations', spend: 42000, cardActive: false },
]

export const cashFlowHistory = [3.1, 3.6, 3.2, 4.1, 3.9, 4.6, 4.2, 5.1, 4.8, 5.6, 6.1, 6.8]
