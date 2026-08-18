-- ============================================================
-- VAULTA Phase 4b — Investments, Security, Expenses, Payroll,
-- Business Cards, Team spend tracking
-- Run this AFTER 0001, 0002, 0003 are already applied.
-- ============================================================

-- ------------------------------------------------------------
-- INVESTMENTS
-- `instruments` is a static reference table (like `currencies`) —
-- not a live market feed. Prices are seeded once and only change
-- if you manually update them. This is disclosed in the UI too.
-- ------------------------------------------------------------
create table public.instruments (
  symbol text primary key,
  name text not null,
  price numeric(18,2) not null check (price > 0),
  currency text not null references public.currencies(code)
);

insert into public.instruments (symbol, name, price, currency) values
  ('VAULTA-EQ', 'VAULTA Broad Equity Index', 128.40, 'NGN'),
  ('VAULTA-BND', 'VAULTA Government Bond Fund', 54.10, 'NGN'),
  ('VAULTA-USD-EQ', 'VAULTA Global Equity (USD)', 41.75, 'USD'),
  ('VAULTA-MM', 'VAULTA Money Market Fund', 100.00, 'NGN');

alter table public.instruments enable row level security;

create policy "instruments are readable by authenticated users"
  on public.instruments for select to authenticated using (true);

create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null references public.instruments(symbol),
  quantity numeric(18,4) not null default 0 check (quantity >= 0),
  avg_cost numeric(18,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (owner_id, symbol)
);

create index holdings_owner_id_idx on public.holdings(owner_id);

alter table public.holdings enable row level security;

create policy "users can view own holdings"
  on public.holdings for select using (auth.uid() = owner_id);
-- no insert/update policy — holdings only change via buy_instrument/sell_instrument below

-- Buy: debits the matching-currency account at the instrument's current price.
create function public.buy_instrument(
  p_account_id uuid,
  p_symbol text,
  p_quantity numeric
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_account public.accounts%rowtype;
  v_instrument public.instruments%rowtype;
  v_cost numeric(18,2);
  v_existing public.holdings%rowtype;
begin
  if p_quantity <= 0 then
    raise exception 'Quantity must be positive';
  end if;

  select * into v_instrument from public.instruments where symbol = p_symbol;
  if not found then
    raise exception 'Unknown instrument';
  end if;

  select * into v_account from public.accounts where id = p_account_id for update;
  if v_account.owner_id <> auth.uid() then
    raise exception 'Not authorized for this account';
  end if;

  if v_account.currency <> v_instrument.currency then
    raise exception 'Account currency must match instrument currency';
  end if;

  v_cost := v_instrument.price * p_quantity;

  if v_account.balance < v_cost then
    raise exception 'Insufficient funds';
  end if;

  update public.accounts set balance = balance - v_cost where id = v_account.id;

  insert into public.transactions (account_id, name, category, currency, amount, type)
  values (v_account.id, 'Buy ' || v_instrument.name, 'Investment', v_account.currency, -v_cost, 'debit');

  select * into v_existing from public.holdings where owner_id = auth.uid() and symbol = p_symbol for update;

  if found then
    update public.holdings
    set
      avg_cost = ((avg_cost * quantity) + v_cost) / (quantity + p_quantity),
      quantity = quantity + p_quantity
    where id = v_existing.id;
  else
    insert into public.holdings (owner_id, symbol, quantity, avg_cost)
    values (auth.uid(), p_symbol, p_quantity, v_instrument.price);
  end if;
end;
$$;

-- Sell: credits the matching-currency account at the instrument's current price.
create function public.sell_instrument(
  p_account_id uuid,
  p_symbol text,
  p_quantity numeric
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_account public.accounts%rowtype;
  v_instrument public.instruments%rowtype;
  v_holding public.holdings%rowtype;
  v_proceeds numeric(18,2);
begin
  if p_quantity <= 0 then
    raise exception 'Quantity must be positive';
  end if;

  select * into v_holding from public.holdings where owner_id = auth.uid() and symbol = p_symbol for update;
  if not found or v_holding.quantity < p_quantity then
    raise exception 'Insufficient holdings';
  end if;

  select * into v_instrument from public.instruments where symbol = p_symbol;
  select * into v_account from public.accounts where id = p_account_id for update;

  if v_account.owner_id <> auth.uid() then
    raise exception 'Not authorized for this account';
  end if;

  if v_account.currency <> v_instrument.currency then
    raise exception 'Account currency must match instrument currency';
  end if;

  v_proceeds := v_instrument.price * p_quantity;

  update public.holdings set quantity = quantity - p_quantity where id = v_holding.id;
  update public.accounts set balance = balance + v_proceeds where id = v_account.id;

  insert into public.transactions (account_id, name, category, currency, amount, type)
  values (v_account.id, 'Sell ' || v_instrument.name, 'Investment', v_account.currency, v_proceeds, 'credit');
end;
$$;

-- ------------------------------------------------------------
-- SECURITY — real login activity log
-- Populated by the frontend right after a successful sign-in
-- (see AuthContext.jsx). Device info is self-reported by the
-- browser (User-Agent) — genuine data, but not a substitute for
-- real fraud/device-fingerprinting infrastructure.
-- ------------------------------------------------------------
create table public.login_activity (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  device_label text not null,
  occurred_at timestamptz not null default now()
);

create index login_activity_owner_id_idx on public.login_activity(owner_id);

alter table public.login_activity enable row level security;

create policy "users can view own login activity"
  on public.login_activity for select using (auth.uid() = owner_id);

create policy "users can insert own login activity"
  on public.login_activity for insert with check (auth.uid() = owner_id);

-- ------------------------------------------------------------
-- BUSINESS EXPENSES
-- ------------------------------------------------------------
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  vendor text not null,
  category text not null,
  amount numeric(18,2) not null check (amount > 0),
  currency text not null references public.currencies(code),
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index expenses_business_id_idx on public.expenses(business_id);

alter table public.expenses enable row level security;

create policy "owners can view own expenses"
  on public.expenses for select
  using (exists (select 1 from public.businesses where businesses.id = expenses.business_id and businesses.owner_id = auth.uid()));

-- Logging an expense debits the matching-currency business account —
-- it's a real payment out, not just a note.
create function public.log_expense(
  p_business_id uuid,
  p_account_id uuid,
  p_vendor text,
  p_category text,
  p_amount numeric,
  p_expense_date date default current_date
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_account public.business_accounts%rowtype;
  v_expense_id uuid;
begin
  if p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  if not exists (select 1 from public.businesses where id = p_business_id and owner_id = auth.uid()) then
    raise exception 'Not authorized for this business';
  end if;

  select * into v_account from public.business_accounts where id = p_account_id for update;
  if v_account.business_id <> p_business_id then
    raise exception 'Account does not belong to this business';
  end if;

  if v_account.balance < p_amount then
    raise exception 'Insufficient funds';
  end if;

  update public.business_accounts set balance = balance - p_amount where id = v_account.id;

  insert into public.business_transactions (account_id, name, category, currency, amount, type)
  values (v_account.id, p_vendor, 'Expense', v_account.currency, -p_amount, 'debit');

  insert into public.expenses (business_id, vendor, category, amount, currency, expense_date)
  values (p_business_id, p_vendor, p_category, p_amount, v_account.currency, p_expense_date)
  returning id into v_expense_id;

  return v_expense_id;
end;
$$;

-- ------------------------------------------------------------
-- PAYROLL
-- Each team member can have a salary. Running payroll debits the
-- business account for the sum of active salaries and logs one
-- transaction per member paid, plus a payroll_runs record.
-- ------------------------------------------------------------
alter table public.team_members add column salary numeric(18,2) not null default 0;

create table public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  total_amount numeric(18,2) not null,
  currency text not null references public.currencies(code),
  run_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index payroll_runs_business_id_idx on public.payroll_runs(business_id);

alter table public.payroll_runs enable row level security;

create policy "owners can view own payroll runs"
  on public.payroll_runs for select
  using (exists (select 1 from public.businesses where businesses.id = payroll_runs.business_id and businesses.owner_id = auth.uid()));

create function public.run_payroll(p_business_id uuid, p_account_id uuid)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_account public.business_accounts%rowtype;
  v_total numeric(18,2);
  v_run_id uuid;
  v_member record;
begin
  if not exists (select 1 from public.businesses where id = p_business_id and owner_id = auth.uid()) then
    raise exception 'Not authorized for this business';
  end if;

  select coalesce(sum(salary), 0) into v_total
  from public.team_members
  where business_id = p_business_id and salary > 0;

  if v_total <= 0 then
    raise exception 'No salaries set — add a salary to at least one team member first';
  end if;

  select * into v_account from public.business_accounts where id = p_account_id for update;
  if v_account.business_id <> p_business_id then
    raise exception 'Account does not belong to this business';
  end if;

  if v_account.balance < v_total then
    raise exception 'Insufficient funds to run payroll';
  end if;

  update public.business_accounts set balance = balance - v_total where id = v_account.id;

  insert into public.payroll_runs (business_id, total_amount, currency)
  values (p_business_id, v_total, v_account.currency)
  returning id into v_run_id;

  for v_member in select * from public.team_members where business_id = p_business_id and salary > 0 loop
    insert into public.business_transactions (account_id, name, category, currency, amount, type)
    values (v_account.id, 'Payroll: ' || v_member.name, 'Payroll', v_account.currency, -v_member.salary, 'debit');
  end loop;

  return v_run_id;
end;
$$;

-- ------------------------------------------------------------
-- BUSINESS CARDS + team spend tracking
-- A business card can optionally be assigned to a team member.
-- "Logging a charge" against a card is the honest version of
-- card-linked spend — there's no real card network processing
-- transactions automatically, so charges are entered manually
-- (e.g. reconciling a receipt), same as `log_expense`, but tied
-- to a specific card/team member so spend can be attributed.
-- ------------------------------------------------------------
create table public.business_cards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  account_id uuid not null references public.business_accounts(id) on delete cascade,
  team_member_id uuid references public.team_members(id) on delete set null,
  last4 text not null,
  holder text not null,
  expiry text not null,
  spending_limit numeric(18,2) not null default 0,
  frozen boolean not null default false,
  created_at timestamptz not null default now()
);

create index business_cards_business_id_idx on public.business_cards(business_id);

alter table public.business_cards enable row level security;

create policy "owners can view own business cards"
  on public.business_cards for select
  using (exists (select 1 from public.businesses where businesses.id = business_cards.business_id and businesses.owner_id = auth.uid()));

create policy "owners can update own business cards"
  on public.business_cards for update
  using (exists (select 1 from public.businesses where businesses.id = business_cards.business_id and businesses.owner_id = auth.uid()));

-- business_transactions needs a card_id column so log_card_charge()
-- below can attribute a debit to a specific card (added here, before
-- the function that references it, to keep dependency order explicit).
alter table public.business_transactions add column card_id uuid references public.business_cards(id);

create function public.issue_business_card(
  p_business_id uuid,
  p_account_id uuid,
  p_team_member_id uuid,
  p_holder text,
  p_spending_limit numeric default 0
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_card_id uuid;
begin
  if not exists (select 1 from public.businesses where id = p_business_id and owner_id = auth.uid()) then
    raise exception 'Not authorized for this business';
  end if;

  insert into public.business_cards (business_id, account_id, team_member_id, last4, holder, expiry, spending_limit)
  values (
    p_business_id,
    p_account_id,
    p_team_member_id,
    lpad((floor(random() * 10000))::text, 4, '0'),
    upper(p_holder),
    to_char(now() + interval '4 years', 'MM/YY'),
    p_spending_limit
  )
  returning id into v_card_id;

  if p_team_member_id is not null then
    update public.team_members set card_active = true where id = p_team_member_id;
  end if;

  return v_card_id;
end;
$$;

-- Log a charge against a business card — debits the linked account,
-- writes a transaction tagged with this card, so Team spend can sum it.
create function public.log_card_charge(
  p_card_id uuid,
  p_amount numeric,
  p_description text
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_card public.business_cards%rowtype;
  v_account public.business_accounts%rowtype;
begin
  if p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  select bc.* into v_card
  from public.business_cards bc
  join public.businesses b on b.id = bc.business_id
  where bc.id = p_card_id and b.owner_id = auth.uid();

  if not found then
    raise exception 'Not authorized for this card';
  end if;

  if v_card.frozen then
    raise exception 'Card is frozen';
  end if;

  select * into v_account from public.business_accounts where id = v_card.account_id for update;

  if v_account.balance < p_amount then
    raise exception 'Insufficient funds';
  end if;

  update public.business_accounts set balance = balance - p_amount where id = v_account.id;

  insert into public.business_transactions (account_id, name, category, currency, amount, type, card_id)
  values (v_account.id, p_description, 'Card Spend', v_account.currency, -p_amount, 'debit', p_card_id);
end;
$$;
