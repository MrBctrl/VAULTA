-- ============================================================
-- VAULTA Phase 3 — Savings, Cards, Business Banking
-- Run this AFTER 0001 and 0002 are already applied.
-- ============================================================

-- ------------------------------------------------------------
-- SAVINGS GOALS
-- ------------------------------------------------------------
create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target numeric(18,2) not null check (target > 0),
  saved numeric(18,2) not null default 0 check (saved >= 0),
  currency text not null references public.currencies(code),
  created_at timestamptz not null default now()
);

create index savings_goals_owner_id_idx on public.savings_goals(owner_id);

alter table public.savings_goals enable row level security;

create policy "users can view own savings goals"
  on public.savings_goals for select using (auth.uid() = owner_id);

create policy "users can insert own savings goals"
  on public.savings_goals for insert with check (auth.uid() = owner_id);

create policy "users can delete own savings goals"
  on public.savings_goals for delete using (auth.uid() = owner_id);
-- no direct update policy — saved amount only changes via the two
-- functions below, same pattern as accounts.balance

-- Move money from an account into a savings goal.
create function public.contribute_to_savings(
  p_goal_id uuid,
  p_account_id uuid,
  p_amount numeric
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_goal public.savings_goals%rowtype;
  v_account public.accounts%rowtype;
begin
  if p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  select * into v_goal from public.savings_goals where id = p_goal_id for update;
  if v_goal.owner_id <> auth.uid() then
    raise exception 'Not authorized for this goal';
  end if;

  select * into v_account from public.accounts where id = p_account_id for update;
  if v_account.owner_id <> auth.uid() then
    raise exception 'Not authorized for this account';
  end if;

  if v_account.balance < p_amount then
    raise exception 'Insufficient funds';
  end if;

  if v_account.currency <> v_goal.currency then
    raise exception 'Account and goal currency must match in this phase';
  end if;

  update public.accounts set balance = balance - p_amount where id = v_account.id;
  update public.savings_goals set saved = saved + p_amount where id = v_goal.id;

  insert into public.transactions (account_id, name, category, currency, amount, type)
  values (v_account.id, 'Savings: ' || v_goal.name, 'Savings', v_account.currency, -p_amount, 'debit');
end;
$$;

-- Move money back from a savings goal into an account.
create function public.withdraw_from_savings(
  p_goal_id uuid,
  p_account_id uuid,
  p_amount numeric
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_goal public.savings_goals%rowtype;
  v_account public.accounts%rowtype;
begin
  if p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  select * into v_goal from public.savings_goals where id = p_goal_id for update;
  if v_goal.owner_id <> auth.uid() then
    raise exception 'Not authorized for this goal';
  end if;

  if v_goal.saved < p_amount then
    raise exception 'Insufficient savings balance';
  end if;

  select * into v_account from public.accounts where id = p_account_id for update;
  if v_account.owner_id <> auth.uid() then
    raise exception 'Not authorized for this account';
  end if;

  update public.savings_goals set saved = saved - p_amount where id = v_goal.id;
  update public.accounts set balance = balance + p_amount where id = v_account.id;

  insert into public.transactions (account_id, name, category, currency, amount, type)
  values (v_account.id, 'Withdrawal: ' || v_goal.name, 'Savings', v_account.currency, p_amount, 'credit');
end;
$$;

-- ------------------------------------------------------------
-- CARDS
-- Cards are linked to an existing account (they draw from that
-- account's balance — no separate card balance is stored, unlike
-- the old mock data, since that would just be a second source of
-- truth that could drift from the real account balance).
-- ------------------------------------------------------------
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  type text not null,               -- 'Personal Card', 'Virtual Card'
  variant text not null,            -- 'physical', 'virtual'
  last4 text not null,
  holder text not null,
  expiry text not null,             -- 'MM/YY'
  spending_limit numeric(18,2) not null default 0,
  frozen boolean not null default false,
  created_at timestamptz not null default now()
);

create index cards_owner_id_idx on public.cards(owner_id);

alter table public.cards enable row level security;

create policy "users can view own cards"
  on public.cards for select using (auth.uid() = owner_id);

create policy "users can insert own cards"
  on public.cards for insert with check (auth.uid() = owner_id);

create policy "users can update own cards"
  on public.cards for update using (auth.uid() = owner_id);

-- Issue a new virtual card against an account you own.
create function public.issue_card(
  p_account_id uuid,
  p_type text,
  p_variant text,
  p_spending_limit numeric default 0
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_account public.accounts%rowtype;
  v_profile public.profiles%rowtype;
  v_card_id uuid;
begin
  select * into v_account from public.accounts where id = p_account_id;
  if v_account.owner_id <> auth.uid() then
    raise exception 'Not authorized for this account';
  end if;

  select * into v_profile from public.profiles where id = auth.uid();

  insert into public.cards (owner_id, account_id, type, variant, last4, holder, expiry, spending_limit)
  values (
    auth.uid(),
    v_account.id,
    p_type,
    p_variant,
    lpad((floor(random() * 10000))::text, 4, '0'),
    upper(v_profile.full_name),
    to_char(now() + interval '4 years', 'MM/YY'),
    p_spending_limit
  )
  returning id into v_card_id;

  return v_card_id;
end;
$$;

-- ------------------------------------------------------------
-- BUSINESS BANKING
-- One business per owner in this phase. Mirrors the personal
-- accounts/transactions structure so the same mental model
-- (and later, the same api.js patterns) applies.
-- ------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

create policy "owners can view own business"
  on public.businesses for select using (auth.uid() = owner_id);

create policy "owners can insert own business"
  on public.businesses for insert with check (auth.uid() = owner_id);

create table public.business_accounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  currency text not null references public.currencies(code),
  label text not null,
  account_number text not null unique,
  balance numeric(18,2) not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  unique (business_id, currency)
);

create index business_accounts_business_id_idx on public.business_accounts(business_id);

alter table public.business_accounts enable row level security;

create policy "owners can view own business accounts"
  on public.business_accounts for select
  using (exists (select 1 from public.businesses where businesses.id = business_accounts.business_id and businesses.owner_id = auth.uid()));

create table public.business_transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.business_accounts(id) on delete cascade,
  name text not null,
  category text not null,
  currency text not null references public.currencies(code),
  amount numeric(18,2) not null,
  type text not null check (type in ('debit', 'credit')),
  transfer_id uuid,
  created_at timestamptz not null default now()
);

create index business_transactions_account_id_idx on public.business_transactions(account_id);

alter table public.business_transactions enable row level security;

create policy "owners can view own business transactions"
  on public.business_transactions for select
  using (
    exists (
      select 1 from public.business_accounts ba
      join public.businesses b on b.id = ba.business_id
      where ba.id = business_transactions.account_id and b.owner_id = auth.uid()
    )
  );

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  client text not null,
  amount numeric(18,2) not null check (amount > 0),
  currency text not null references public.currencies(code),
  status text not null default 'Outstanding' check (status in ('Outstanding', 'Paid', 'Overdue')),
  invoice_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index invoices_business_id_idx on public.invoices(business_id);

alter table public.invoices enable row level security;

create policy "owners can view own invoices"
  on public.invoices for select
  using (exists (select 1 from public.businesses where businesses.id = invoices.business_id and businesses.owner_id = auth.uid()));

create policy "owners can insert own invoices"
  on public.invoices for insert
  with check (exists (select 1 from public.businesses where businesses.id = invoices.business_id and businesses.owner_id = auth.uid()));

create policy "owners can update own invoices"
  on public.invoices for update
  using (exists (select 1 from public.businesses where businesses.id = invoices.business_id and businesses.owner_id = auth.uid()));

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  role text not null,
  card_active boolean not null default false,
  created_at timestamptz not null default now()
);
-- Note: no real spend tracking yet — that requires card-linked
-- transaction attribution, which is a later phase.

create index team_members_business_id_idx on public.team_members(business_id);

alter table public.team_members enable row level security;

create policy "owners can view own team"
  on public.team_members for select
  using (exists (select 1 from public.businesses where businesses.id = team_members.business_id and businesses.owner_id = auth.uid()));

create policy "owners can insert own team"
  on public.team_members for insert
  with check (exists (select 1 from public.businesses where businesses.id = team_members.business_id and businesses.owner_id = auth.uid()));

create policy "owners can update own team"
  on public.team_members for update
  using (exists (select 1 from public.businesses where businesses.id = team_members.business_id and businesses.owner_id = auth.uid()));

-- Create a business (one per user) plus its starter NGN account.
create function public.create_business(p_name text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_business_id uuid;
begin
  if exists (select 1 from public.businesses where owner_id = auth.uid()) then
    raise exception 'You already have a business';
  end if;

  insert into public.businesses (owner_id, name)
  values (auth.uid(), p_name)
  returning id into v_business_id;

  insert into public.business_accounts (business_id, currency, label, account_number, balance)
  values (
    v_business_id,
    'NGN',
    p_name || ' — Naira Account',
    lpad((floor(random() * 999999999999))::text, 12, '0'),
    0
  );

  return v_business_id;
end;
$$;

-- Fund a business account (simulated deposit, same pattern as fund_account).
create function public.fund_business_account(
  p_account_id uuid,
  p_amount numeric,
  p_description text default 'Deposit'
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_account public.business_accounts%rowtype;
begin
  if p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  select ba.* into v_account
  from public.business_accounts ba
  join public.businesses b on b.id = ba.business_id
  where ba.id = p_account_id and b.owner_id = auth.uid()
  for update;

  if not found then
    raise exception 'Not authorized for this account';
  end if;

  update public.business_accounts set balance = balance + p_amount where id = v_account.id;

  insert into public.business_transactions (account_id, name, category, currency, amount, type)
  values (v_account.id, coalesce(nullif(p_description, ''), 'Deposit'), 'Deposit', v_account.currency, p_amount, 'credit');
end;
$$;

-- Transfer between business accounts (same VAULTA-to-VAULTA-business scope as personal).
create function public.business_transfer_funds(
  p_from_account_id uuid,
  p_to_account_number text,
  p_amount numeric,
  p_description text default ''
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_from_account public.business_accounts%rowtype;
  v_to_account public.business_accounts%rowtype;
  v_transfer_id uuid := gen_random_uuid();
begin
  if p_amount <= 0 then
    raise exception 'Transfer amount must be positive';
  end if;

  select ba.* into v_from_account
  from public.business_accounts ba
  join public.businesses b on b.id = ba.business_id
  where ba.id = p_from_account_id and b.owner_id = auth.uid()
  for update;

  if not found then
    raise exception 'Not authorized for this account';
  end if;

  if v_from_account.balance < p_amount then
    raise exception 'Insufficient funds';
  end if;

  select * into v_to_account from public.business_accounts where account_number = p_to_account_number for update;
  if not found then
    raise exception 'Recipient business account not found';
  end if;

  update public.business_accounts set balance = balance - p_amount where id = v_from_account.id;
  insert into public.business_transactions (account_id, name, category, currency, amount, type, transfer_id)
  values (v_from_account.id, coalesce(nullif(p_description, ''), 'Transfer sent'), 'Transfer', v_from_account.currency, -p_amount, 'debit', v_transfer_id);

  update public.business_accounts set balance = balance + p_amount where id = v_to_account.id;
  insert into public.business_transactions (account_id, name, category, currency, amount, type, transfer_id)
  values (v_to_account.id, coalesce(nullif(p_description, ''), 'Transfer received'), 'Transfer', v_to_account.currency, p_amount, 'credit', v_transfer_id);

  return v_transfer_id;
end;
$$;

-- Create an invoice for your business.
create function public.create_invoice(
  p_business_id uuid,
  p_client text,
  p_amount numeric,
  p_currency text,
  p_invoice_date date default current_date
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_invoice_id uuid;
begin
  if not exists (select 1 from public.businesses where id = p_business_id and owner_id = auth.uid()) then
    raise exception 'Not authorized for this business';
  end if;

  insert into public.invoices (business_id, client, amount, currency, invoice_date)
  values (p_business_id, p_client, p_amount, p_currency, p_invoice_date)
  returning id into v_invoice_id;

  return v_invoice_id;
end;
$$;

-- Mark an invoice paid — credits the business's matching-currency account.
create function public.mark_invoice_paid(p_invoice_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_invoice public.invoices%rowtype;
  v_account public.business_accounts%rowtype;
begin
  select i.* into v_invoice
  from public.invoices i
  join public.businesses b on b.id = i.business_id
  where i.id = p_invoice_id and b.owner_id = auth.uid();

  if not found then
    raise exception 'Not authorized for this invoice';
  end if;

  if v_invoice.status = 'Paid' then
    raise exception 'Invoice already paid';
  end if;

  select * into v_account
  from public.business_accounts
  where business_id = v_invoice.business_id and currency = v_invoice.currency
  for update;

  if not found then
    raise exception 'No matching-currency business account to credit';
  end if;

  update public.invoices set status = 'Paid' where id = v_invoice.id;
  update public.business_accounts set balance = balance + v_invoice.amount where id = v_account.id;

  insert into public.business_transactions (account_id, name, category, currency, amount, type)
  values (v_account.id, 'Invoice ' || v_invoice.client || ' paid', 'Income', v_invoice.currency, v_invoice.amount, 'credit');
end;
$$;
