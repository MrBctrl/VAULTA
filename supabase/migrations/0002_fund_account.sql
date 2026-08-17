-- ============================================================
-- VAULTA Phase 2a — Fund Account (simulated deposit)
-- Run this AFTER 0001_phase1_personal_banking.sql is already applied.
-- ============================================================

-- ============================================================
-- FUND ACCOUNT — simulated deposit into your own account.
-- No real payment processor connected yet (Paystack/Flutterwave
-- come in a later phase), so this is an honest "demo top-up" a
-- user can only perform on an account they own — not a real
-- money-in rail yet. Still goes through the same audit trail as
-- everything else: one transaction row, balance updated atomically.
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
