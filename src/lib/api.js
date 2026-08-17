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
    spend: 0, // real spend attribution is a later phase — no card-linked tracking yet
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
