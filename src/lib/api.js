import { supabase } from './supabase.js'

// Thin data-access layer. Every dashboard page should go through these
// functions rather than calling `supabase.from(...)` directly — keeps the
// query shape in one place and makes swapping in real APIs later (per the
// Phase 4 "Real APIs" step) a one-file change.

export async function getAccounts() {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  // map snake_case DB columns -> the camelCase shape mockData.js used
  return data.map((a) => ({
    id: a.id,
    currency: a.currency,
    label: a.label,
    balance: Number(a.balance),
    accountNumber: a.account_number,
  }))
}

export async function getTransactions({ limit } = {}) {
  let query = supabase
    .from('transactions')
    .select('*, accounts!inner(owner_id)')
    .order('created_at', { ascending: false })
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    date: t.created_at,
    currency: t.currency,
    amount: Number(t.amount),
    type: t.type,
  }))
}

export async function getBeneficiaries() {
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map((b) => ({
    id: b.id,
    name: b.name,
    bank: b.bank,
    accountNumber: b.account_number,
  }))
}

export async function addBeneficiary({ name, bank, accountNumber }) {
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('beneficiaries')
    .insert({ owner_id: userData.user.id, name, bank, account_number: accountNumber })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Simulated deposit into an account you own. No real payment
 * processor connected yet — this is a demo top-up, not a real
 * money-in rail.
 */
export async function fundAccount({ accountId, amount, description }) {
  const { error } = await supabase.rpc('fund_account', {
    p_account_id: accountId,
    p_amount: amount,
    p_description: description ?? 'Deposit',
  })
  if (error) throw error
}

// ---------------------------------------------------------------
// SAVINGS
// ---------------------------------------------------------------

export async function getSavingsGoals() {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map((g) => ({
    id: g.id,
    name: g.name,
    target: Number(g.target),
    saved: Number(g.saved),
    currency: g.currency,
  }))
}

export async function createSavingsGoal({ name, target, currency }) {
  const { data: userData } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('savings_goals')
    .insert({ owner_id: userData.user.id, name, target, currency })
  if (error) throw error
}

export async function contributeToSavings({ goalId, accountId, amount }) {
  const { error } = await supabase.rpc('contribute_to_savings', {
    p_goal_id: goalId,
    p_account_id: accountId,
    p_amount: amount,
  })
  if (error) throw error
}

export async function withdrawFromSavings({ goalId, accountId, amount }) {
  const { error } = await supabase.rpc('withdraw_from_savings', {
    p_goal_id: goalId,
    p_account_id: accountId,
    p_amount: amount,
  })
  if (error) throw error
}

// ---------------------------------------------------------------
// CARDS
// ---------------------------------------------------------------

export async function getCards() {
  const { data, error } = await supabase
    .from('cards')
    .select('*, accounts(currency, balance)')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map((c) => ({
    id: c.id,
    type: c.type,
    variant: c.variant,
    last4: c.last4,
    holder: c.holder,
    expiry: c.expiry,
    currency: c.accounts.currency,
    balance: Number(c.accounts.balance), // reflects the linked account, always accurate
    frozen: c.frozen,
    spendingLimit: Number(c.spending_limit),
    accountId: c.account_id,
  }))
}

export async function issueCard({ accountId, type, variant, spendingLimit }) {
  const { error } = await supabase.rpc('issue_card', {
    p_account_id: accountId,
    p_type: type,
    p_variant: variant,
    p_spending_limit: spendingLimit ?? 0,
  })
  if (error) throw error
}

export async function toggleCardFreeze({ cardId, frozen }) {
  const { error } = await supabase.from('cards').update({ frozen }).eq('id', cardId)
  if (error) throw error
}

export async function updateCardLimit({ cardId, spendingLimit }) {
  const { error } = await supabase.from('cards').update({ spending_limit: spendingLimit }).eq('id', cardId)
  if (error) throw error
}

// ---------------------------------------------------------------
// BUSINESS
// ---------------------------------------------------------------

export async function getBusiness() {
  const { data, error } = await supabase.from('businesses').select('*').maybeSingle()
  if (error) throw error
  return data
}

export async function createBusiness({ name }) {
  const { data, error } = await supabase.rpc('create_business', { p_name: name })
  if (error) throw error
  return data
}

export async function getBusinessAccounts() {
  const { data: business } = await supabase.from('businesses').select('id').maybeSingle()
  if (!business) return []
  const { data, error } = await supabase
    .from('business_accounts')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map((a) => ({
    id: a.id,
    currency: a.currency,
    label: a.label,
    balance: Number(a.balance),
    accountNumber: a.account_number,
  }))
}

export async function getBusinessTransactions({ limit } = {}) {
  let query = supabase
    .from('business_transactions')
    .select('*, business_accounts!inner(business_id, businesses!inner(owner_id))')
    .order('created_at', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) throw error
  return data.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    date: t.created_at,
    currency: t.currency,
    amount: Number(t.amount),
    type: t.type,
  }))
}

export async function fundBusinessAccount({ accountId, amount, description }) {
  const { error } = await supabase.rpc('fund_business_account', {
    p_account_id: accountId,
    p_amount: amount,
    p_description: description ?? 'Deposit',
  })
  if (error) throw error
}

export async function businessTransferFunds({ fromAccountId, toAccountNumber, amount, description }) {
  const { data, error } = await supabase.rpc('business_transfer_funds', {
    p_from_account_id: fromAccountId,
    p_to_account_number: toAccountNumber,
    p_amount: amount,
    p_description: description ?? '',
  })
  if (error) throw error
  return data
}

export async function getInvoices() {
  const { data: business } = await supabase.from('businesses').select('id').maybeSingle()
  if (!business) return []
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('business_id', business.id)
    .order('invoice_date', { ascending: false })
  if (error) throw error
  return data.map((i) => ({
    id: i.id,
    client: i.client,
    amount: Number(i.amount),
    currency: i.currency,
    status: i.status,
    date: i.invoice_date,
  }))
}

export async function createInvoice({ businessId, client, amount, currency, invoiceDate }) {
  const { error } = await supabase.rpc('create_invoice', {
    p_business_id: businessId,
    p_client: client,
    p_amount: amount,
    p_currency: currency,
    p_invoice_date: invoiceDate ?? new Date().toISOString().slice(0, 10),
  })
  if (error) throw error
}

export async function markInvoicePaid({ invoiceId }) {
  const { error } = await supabase.rpc('mark_invoice_paid', { p_invoice_id: invoiceId })
  if (error) throw error
}

export async function getTeamMembers() {
  const { data: business } = await supabase.from('businesses').select('id').maybeSingle()
  if (!business) return []
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    // real spend now lives in getTeamSpendThisMonth() — attributed via
    // business_cards.team_member_id, not stored on the member row itself
    cardActive: m.card_active,
  }))
}

export async function addTeamMember({ businessId, name, role }) {
  const { error } = await supabase.from('team_members').insert({ business_id: businessId, name, role })
  if (error) throw error
}

export async function toggleTeamMemberCard({ memberId, cardActive }) {
  const { error } = await supabase.from('team_members').update({ card_active: cardActive }).eq('id', memberId)
  if (error) throw error
}

// ---------------------------------------------------------------
// PROFILE & BUSINESS SETTINGS
// ---------------------------------------------------------------

export async function updateProfile({ fullName, primaryCurrency }) {
  const { data: userData } = await supabase.auth.getUser()
  const patch = {}
  if (fullName !== undefined) patch.full_name = fullName
  if (primaryCurrency !== undefined) patch.primary_currency = primaryCurrency
  const { error } = await supabase.from('profiles').update(patch).eq('id', userData.user.id)
  if (error) throw error
}

export async function updateBusinessName({ businessId, name }) {
  const { error } = await supabase.from('businesses').update({ name }).eq('id', businessId)
  if (error) throw error
}

// ---------------------------------------------------------------
// INVESTMENTS
// Instrument prices are a static seeded reference table, not a
// live market feed — disclosed in the Investments UI.
// ---------------------------------------------------------------

export async function getInstruments() {
  const { data, error } = await supabase.from('instruments').select('*').order('symbol')
  if (error) throw error
  return data.map((i) => ({ symbol: i.symbol, name: i.name, price: Number(i.price), currency: i.currency }))
}

export async function getHoldings() {
  const { data, error } = await supabase
    .from('holdings')
    .select('*, instruments(name, price, currency)')
    .gt('quantity', 0)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map((h) => ({
    symbol: h.symbol,
    name: h.instruments.name,
    quantity: Number(h.quantity),
    avgCost: Number(h.avg_cost),
    price: Number(h.instruments.price),
    currency: h.instruments.currency,
  }))
}

export async function buyInstrument({ accountId, symbol, quantity }) {
  const { error } = await supabase.rpc('buy_instrument', {
    p_account_id: accountId,
    p_symbol: symbol,
    p_quantity: quantity,
  })
  if (error) throw error
}

export async function sellInstrument({ accountId, symbol, quantity }) {
  const { error } = await supabase.rpc('sell_instrument', {
    p_account_id: accountId,
    p_symbol: symbol,
    p_quantity: quantity,
  })
  if (error) throw error
}

// ---------------------------------------------------------------
// SECURITY — real login activity
// ---------------------------------------------------------------

export async function logLoginActivity() {
  const { data: userData } = await supabase.auth.getUser()
  const device = describeDevice()
  const { error } = await supabase
    .from('login_activity')
    .insert({ owner_id: userData.user.id, device_label: device })
  if (error) throw error
}

export async function getLoginActivity() {
  const { data, error } = await supabase
    .from('login_activity')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data.map((a) => ({ id: a.id, deviceLabel: a.device_label, occurredAt: a.occurred_at }))
}

function describeDevice() {
  if (typeof navigator === 'undefined') return 'Unknown device'
  const ua = navigator.userAgent
  const browser = /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'Browser'
  const os = /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : 'Unknown OS'
  return `${browser} on ${os}`
}

// ---------------------------------------------------------------
// BUSINESS EXPENSES
// ---------------------------------------------------------------

export async function getExpenses() {
  const { data: business } = await supabase.from('businesses').select('id').maybeSingle()
  if (!business) return []
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('business_id', business.id)
    .order('expense_date', { ascending: false })
  if (error) throw error
  return data.map((e) => ({
    id: e.id,
    vendor: e.vendor,
    category: e.category,
    amount: Number(e.amount),
    currency: e.currency,
    date: e.expense_date,
  }))
}

export async function logExpense({ businessId, accountId, vendor, category, amount, expenseDate }) {
  const { error } = await supabase.rpc('log_expense', {
    p_business_id: businessId,
    p_account_id: accountId,
    p_vendor: vendor,
    p_category: category,
    p_amount: amount,
    p_expense_date: expenseDate ?? new Date().toISOString().slice(0, 10),
  })
  if (error) throw error
}

// ---------------------------------------------------------------
// PAYROLL
// ---------------------------------------------------------------

export async function getPayrollRuns() {
  const { data: business } = await supabase.from('businesses').select('id').maybeSingle()
  if (!business) return []
  const { data, error } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('business_id', business.id)
    .order('run_date', { ascending: false })
  if (error) throw error
  return data.map((r) => ({ id: r.id, totalAmount: Number(r.total_amount), currency: r.currency, runDate: r.run_date }))
}

export async function updateTeamMemberSalary({ memberId, salary }) {
  const { error } = await supabase.from('team_members').update({ salary }).eq('id', memberId)
  if (error) throw error
}

export async function runPayroll({ businessId, accountId }) {
  const { data, error } = await supabase.rpc('run_payroll', {
    p_business_id: businessId,
    p_account_id: accountId,
  })
  if (error) throw error
  return data
}

// ---------------------------------------------------------------
// BUSINESS CARDS + team spend
// ---------------------------------------------------------------

export async function getBusinessCards() {
  const { data, error } = await supabase
    .from('business_cards')
    .select('*, business_accounts(currency, balance), team_members(name)')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map((c) => ({
    id: c.id,
    last4: c.last4,
    holder: c.holder,
    expiry: c.expiry,
    currency: c.business_accounts.currency,
    balance: Number(c.business_accounts.balance),
    frozen: c.frozen,
    spendingLimit: Number(c.spending_limit),
    accountId: c.account_id,
    teamMemberId: c.team_member_id,
    teamMemberName: c.team_members?.name ?? null,
  }))
}

export async function issueBusinessCard({ businessId, accountId, teamMemberId, holder, spendingLimit }) {
  const { error } = await supabase.rpc('issue_business_card', {
    p_business_id: businessId,
    p_account_id: accountId,
    p_team_member_id: teamMemberId ?? null,
    p_holder: holder,
    p_spending_limit: spendingLimit ?? 0,
  })
  if (error) throw error
}

export async function toggleBusinessCardFreeze({ cardId, frozen }) {
  const { error } = await supabase.from('business_cards').update({ frozen }).eq('id', cardId)
  if (error) throw error
}

export async function logCardCharge({ cardId, amount, description }) {
  const { error } = await supabase.rpc('log_card_charge', {
    p_card_id: cardId,
    p_amount: amount,
    p_description: description,
  })
  if (error) throw error
}

/**
 * Real per-member spend this calendar month, summed from
 * business_transactions attributed to that member's card(s) via
 * log_card_charge. Members with no card or no logged charges show 0 —
 * that's an honest reflection of "no spend recorded", not a fake number.
 */
export async function getTeamSpendThisMonth() {
  const { data: business } = await supabase.from('businesses').select('id').maybeSingle()
  if (!business) return {}

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('business_transactions')
    .select('amount, card_id, business_cards!inner(team_member_id, business_id)')
    .eq('business_cards.business_id', business.id)
    .not('card_id', 'is', null)
    .gte('created_at', startOfMonth.toISOString())

  if (error) throw error

  const spendByMember = {}
  data.forEach((t) => {
    const memberId = t.business_cards.team_member_id
    if (!memberId) return
    spendByMember[memberId] = (spendByMember[memberId] ?? 0) + Math.abs(Number(t.amount))
  })
  return spendByMember
}

/**
 * Executes a real transfer via the transfer_funds() Postgres function —
 * atomic debit + credit + two transaction rows, all server-side.
 */
export async function transferFunds({ fromAccountId, toAccountNumber, amount, description }) {
  const { data, error } = await supabase.rpc('transfer_funds', {
    p_from_account_id: fromAccountId,
    p_to_account_number: toAccountNumber,
    p_amount: amount,
    p_description: description ?? '',
  })
  if (error) throw error
  return data // transfer_id
}
