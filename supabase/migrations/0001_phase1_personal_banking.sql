-- ============================================================
-- VAULTA Phase 1 — Personal Banking backend
-- Auth (built-in) -> profiles -> accounts -> transactions -> beneficiaries
-- Run this once in Supabase SQL Editor (or via `supabase db push`)
-- ============================================================

-- ------------------------------------------------------------
-- 1. CURRENCIES (reference table — created first, profiles/
-- accounts/transactions all reference it)
-- ------------------------------------------------------------
create table public.currencies (
  code text primary key,          -- 'NGN', 'USD', 'EUR', 'GBP', 'XOF'
  name text not null,
  symbol text not null
);

insert into public.currencies (code, name, symbol) values
  ('NGN', 'Nigerian Naira', '₦'),
  ('USD', 'US Dollar', '$'),
  ('EUR', 'Euro', '€'),
  ('GBP', 'British Pound', '£'),
  ('XOF', 'West African CFA Franc', 'CFA');

-- ------------------------------------------------------------
-- 2. PROFILES
-- One row per auth user. Supabase Auth already gives us
-- auth.users (email, password, id) — this table extends it
-- with the app-facing fields the dashboard needs.
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  full_name text not null,
  primary_currency text not null default 'NGN' references public.currencies(code),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. ACCOUNTS
-- A user can hold one account per currency (mirrors the 5
-- mock accounts: NGN/USD/EUR/GBP/XOF).
-- ------------------------------------------------------------
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  currency text not null references public.currencies(code),
  label text not null,
  account_number text not null unique,
  balance numeric(18,2) not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  unique (owner_id, currency)
);

create index accounts_owner_id_idx on public.accounts(owner_id);

-- ------------------------------------------------------------
-- 4. TRANSACTIONS
-- Every balance-affecting event: card spend, income, or one
-- leg of a transfer. `transfer_id` links the two legs of an
-- internal transfer together (see transfer_funds() below).
-- ------------------------------------------------------------
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name text not null,
  category text not null,
  currency text not null references public.currencies(code),
  amount numeric(18,2) not null,          -- negative = debit, positive = credit
  type text not null check (type in ('debit', 'credit')),
  transfer_id uuid,                        -- null for non-transfer transactions
  created_at timestamptz not null default now()
);

create index transactions_account_id_idx on public.transactions(account_id);
create index transactions_created_at_idx on public.transactions(created_at desc);

-- ------------------------------------------------------------
-- 5. BENEFICIARIES
-- Saved transfer recipients, scoped to the user who saved them.
-- ------------------------------------------------------------
create table public.beneficiaries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  bank text not null,
  account_number text not null,
  created_at timestamptz not null default now()
);

create index beneficiaries_owner_id_idx on public.beneficiaries(owner_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- Every table: a user can only ever see/touch their own rows.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.beneficiaries enable row level security;
alter table public.currencies enable row level security;

-- currencies: readable by anyone signed in, not editable by clients
create policy "currencies are readable by authenticated users"
  on public.currencies for select
  to authenticated
  using (true);

-- profiles: user can read/update only their own profile row
create policy "users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- accounts: user can only see/manage accounts they own
create policy "users can view own accounts"
  on public.accounts for select
  using (auth.uid() = owner_id);

create policy "users can insert own accounts"
  on public.accounts for insert
  with check (auth.uid() = owner_id);

-- no direct client-side UPDATE policy on accounts.balance —
-- balance only ever changes through transfer_funds() below,
-- which runs as SECURITY DEFINER and bypasses RLS safely.

-- transactions: user can only see transactions on accounts they own
create policy "users can view own transactions"
  on public.transactions for select
  using (
    exists (
      select 1 from public.accounts
      where accounts.id = transactions.account_id
      and accounts.owner_id = auth.uid()
    )
  );

-- no direct client-side INSERT policy on transactions either —
-- transactions are only ever created through transfer_funds().

-- beneficiaries: full CRUD, but only on your own saved beneficiaries
create policy "users can view own beneficiaries"
  on public.beneficiaries for select
  using (auth.uid() = owner_id);

create policy "users can insert own beneficiaries"
  on public.beneficiaries for insert
  with check (auth.uid() = owner_id);

create policy "users can delete own beneficiaries"
  on public.beneficiaries for delete
  using (auth.uid() = owner_id);

-- ============================================================
-- AUTO-PROVISIONING
-- When a new user signs up via Supabase Auth, automatically:
--   1. create their profile row
--   2. open a starter NGN account with a zero balance
-- Reads first_name/full_name from the signup call's metadata
-- (see supabase.auth.signUp({ options: { data: {...} } }) on
-- the frontend side).
-- ============================================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, full_name, primary_currency)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', 'New'),
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'NGN'
  );

  insert into public.accounts (owner_id, currency, label, account_number, balance)
  values (
    new.id,
    'NGN',
    'Naira Account',
    -- simple demo account number generator: 12 random digits
    lpad((floor(random() * 999999999999))::text, 12, '0'),
    0
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- FUND ACCOUNT — simulated deposit into your own account.
-- Phase 1 has no real payment processor connected (Paystack/
-- Flutterwave come in a later phase per the protocol's payment
-- roadmap), so this is an honest "demo top-up" a user can only
-- perform on an account they own — not a real money-in rail yet.
-- Still goes through the same audit trail as everything else:
-- one transaction row, balance updated atomically.
-- ============================================================

create function public.fund_account(
  p_account_id uuid,
  p_amount numeric,
  p_description text default 'Deposit'
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_account public.accounts%rowtype;
begin
  if p_amount <= 0 then
    raise exception 'Deposit amount must be positive';
  end if;

  select * into v_account
  from public.accounts
  where id = p_account_id
  for update;

  if not found then
    raise exception 'Account not found';
  end if;

  if v_account.owner_id <> auth.uid() then
    raise exception 'Not authorized to fund this account';
  end if;

  update public.accounts
  set balance = balance + p_amount
  where id = v_account.id;

  insert into public.transactions (account_id, name, category, currency, amount, type)
  values (v_account.id, coalesce(nullif(p_description, ''), 'Deposit'), 'Deposit', v_account.currency, p_amount, 'credit');
end;
$$;

-- ============================================================
-- TRANSFER FUNDS — the only way transactions/balances change
-- between two accounts. Atomic: debits sender, credits
-- recipient's account, and writes both transaction legs — all
-- in one DB transaction. Runs as SECURITY DEFINER so it can
-- update balances even though clients have no direct
-- UPDATE/INSERT rights on those tables.
-- ============================================================

create function public.transfer_funds(
  p_from_account_id uuid,
  p_to_account_number text,
  p_amount numeric,
  p_description text default ''
)
returns uuid  -- returns the transfer_id
language plpgsql
security definer set search_path = public
as $$
declare
  v_from_account public.accounts%rowtype;
  v_to_account public.accounts%rowtype;
  v_transfer_id uuid := gen_random_uuid();
begin
  if p_amount <= 0 then
    raise exception 'Transfer amount must be positive';
  end if;

  -- lock the sending account row to prevent race conditions
  select * into v_from_account
  from public.accounts
  where id = p_from_account_id
  for update;

  if v_from_account.owner_id <> auth.uid() then
    raise exception 'Not authorized to transfer from this account';
  end if;

  if v_from_account.balance < p_amount then
    raise exception 'Insufficient funds';
  end if;

  select * into v_to_account
  from public.accounts
  where account_number = p_to_account_number
  for update;

  if not found then
    raise exception 'Recipient account not found';
  end if;

  -- debit sender
  update public.accounts
  set balance = balance - p_amount
  where id = v_from_account.id;

  insert into public.transactions (account_id, name, category, currency, amount, type, transfer_id)
  values (v_from_account.id, coalesce(nullif(p_description, ''), 'Transfer sent'), 'Transfer', v_from_account.currency, -p_amount, 'debit', v_transfer_id);

  -- credit recipient
  update public.accounts
  set balance = balance + p_amount
  where id = v_to_account.id;

  insert into public.transactions (account_id, name, category, currency, amount, type, transfer_id)
  values (v_to_account.id, coalesce(nullif(p_description, ''), 'Transfer received'), 'Transfer', v_to_account.currency, p_amount, 'credit', v_transfer_id);

  return v_transfer_id;
end;
$$;
