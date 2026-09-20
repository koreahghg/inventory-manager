-- "물류 코드" no longer means a single-use per-shipment tracking code.
-- It is now a one-time (or occasional) purchasing-eligibility fee: the app
-- blocks creating any purchase until at least one row exists here, recorded
-- as a registration date + fee. The old per-batch code string/consumption
-- model is fully discarded.

drop trigger if exists purchases_consume_logistics_code on purchases;
drop function if exists consume_logistics_code();

alter table purchases drop column if exists logistics_code_id;

drop table if exists logistics_codes;

create table logistics_registrations (
  id uuid primary key default gen_random_uuid(),
  registered_at date not null,
  fee numeric(12, 2) not null check (fee >= 0),
  memo text,
  created_at timestamptz not null default now()
);

alter table logistics_registrations enable row level security;

create policy "authenticated full access" on logistics_registrations
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on logistics_registrations to authenticated;

-- Recreate the product+purchase RPC without the removed logistics_code_id
-- parameter. Postgres can't CREATE OR REPLACE across a changed parameter
-- list, so the old signature has to be dropped first.
drop function if exists create_product_with_initial_purchase(
  text, text, text, text, text, text, date, integer, numeric, text, uuid, text
);

create or replace function create_product_with_initial_purchase(
  p_name text,
  p_brand text,
  p_style_code text,
  p_size text,
  p_color text,
  p_memo text,
  p_purchase_date date,
  p_quantity integer,
  p_unit_price numeric,
  p_vendor text,
  p_purchase_memo text
)
returns uuid
language plpgsql
security invoker
as $$
declare
  new_product_id uuid;
begin
  insert into products (name, brand, style_code, size, color, memo)
  values (p_name, p_brand, p_style_code, p_size, p_color, p_memo)
  returning id into new_product_id;

  insert into purchases (
    product_id, purchase_date, quantity, unit_price, vendor, memo
  )
  values (
    new_product_id, p_purchase_date, p_quantity, p_unit_price, p_vendor, p_purchase_memo
  );

  return new_product_id;
end;
$$;

grant execute on function create_product_with_initial_purchase(
  text, text, text, text, text, text, date, integer, numeric, text, text
) to authenticated;
