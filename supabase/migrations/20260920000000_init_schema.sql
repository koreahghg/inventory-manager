-- ============================================================================
-- inventory-manager: initial schema
--
-- Design principle (see README §9): stock quantities and amounts are never
-- stored as standalone "current value" columns. Everything is derived from
-- an append-only ledger of purchase and sale transactions, so historical
-- and period-based statistics stay accurate and auditable.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- updated_at helper
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- products: identity/attributes of a sellable item. Quantity and purchase
-- price live on `purchases`, not here, because both vary batch to batch.
-- ----------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  style_code text,
  size text,
  color text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();

create index products_name_idx on products (name);
create index products_style_code_idx on products (style_code);

-- ----------------------------------------------------------------------------
-- product_images
-- ----------------------------------------------------------------------------
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url text not null,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on product_images (product_id);

-- Only one primary image per product.
create unique index product_images_one_primary_per_product
  on product_images (product_id)
  where is_primary;

-- ----------------------------------------------------------------------------
-- logistics_codes: single-use codes. A code becomes "used" the moment it is
-- attached to a purchase (see trigger below) and can never be reused.
-- ----------------------------------------------------------------------------
create table logistics_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  status text not null default 'available'
    check (status in ('available', 'used')),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index logistics_codes_status_idx on logistics_codes (status);

-- ----------------------------------------------------------------------------
-- purchases: one row per purchase batch (append-only — see README §5, no
-- update/delete policy is granted to the app role, only insert/select).
-- ----------------------------------------------------------------------------
create table purchases (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete restrict,
  logistics_code_id uuid unique references logistics_codes (id) on delete restrict,
  purchase_date date not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  vendor text,
  memo text,
  created_at timestamptz not null default now()
);

create index purchases_product_id_idx on purchases (product_id);
create index purchases_purchase_date_idx on purchases (purchase_date);

-- Attaching a logistics code to a purchase consumes it permanently.
create or replace function consume_logistics_code()
returns trigger
language plpgsql
as $$
begin
  if new.logistics_code_id is not null then
    update logistics_codes
    set status = 'used', used_at = now()
    where id = new.logistics_code_id
      and status = 'available';

    if not found then
      raise exception 'logistics code % is not available', new.logistics_code_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger purchases_consume_logistics_code
  before insert on purchases
  for each row
  execute function consume_logistics_code();

-- ----------------------------------------------------------------------------
-- sales: one row per sale. Each sale draws its cost basis from a specific
-- purchase batch (`purchase_id`), so unit_price differences between batches
-- are preserved instead of averaged away, and profit is exactly
-- computable per README §6:
--   순이익 = 판매금액 - 매입금액 - 수수료 - 배송비 - 기타 비용
-- ----------------------------------------------------------------------------
create table sales (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases (id) on delete restrict,
  sale_date date not null,
  quantity integer not null default 1 check (quantity > 0),
  sale_price numeric(12, 2) not null check (sale_price >= 0),
  platform text,
  fee numeric(12, 2) not null default 0 check (fee >= 0),
  shipping_fee numeric(12, 2) not null default 0 check (shipping_fee >= 0),
  other_fee numeric(12, 2) not null default 0 check (other_fee >= 0),
  memo text,
  created_at timestamptz not null default now()
);

create index sales_purchase_id_idx on sales (purchase_id);
create index sales_sale_date_idx on sales (sale_date);

-- Prevent selling more units than remain in the referenced purchase batch.
create or replace function check_sale_does_not_exceed_stock()
returns trigger
language plpgsql
as $$
declare
  batch_quantity integer;
  already_sold integer;
begin
  select quantity into batch_quantity
  from purchases
  where id = new.purchase_id;

  select coalesce(sum(quantity), 0) into already_sold
  from sales
  where purchase_id = new.purchase_id
    and id <> new.id;

  if already_sold + new.quantity > batch_quantity then
    raise exception 'sale quantity exceeds remaining stock for purchase %', new.purchase_id;
  end if;

  return new;
end;
$$;

create trigger sales_check_stock
  before insert or update on sales
  for each row
  execute function check_sale_does_not_exceed_stock();

-- ============================================================================
-- Read-optimized views
-- ============================================================================

-- Remaining quantity/cost per purchase batch.
create view v_purchase_stock with (security_invoker = true) as
select
  p.id as purchase_id,
  p.product_id,
  p.purchase_date,
  p.vendor,
  p.quantity as purchased_quantity,
  coalesce(s.sold_quantity, 0) as sold_quantity,
  p.quantity - coalesce(s.sold_quantity, 0) as remaining_quantity,
  p.unit_price,
  (p.quantity - coalesce(s.sold_quantity, 0)) * p.unit_price as remaining_cost
from purchases p
left join (
  select purchase_id, sum(quantity) as sold_quantity
  from sales
  group by purchase_id
) s on s.purchase_id = p.id;

-- Current stock summary per product.
create view v_product_stock with (security_invoker = true) as
select
  product_id,
  sum(purchased_quantity) as purchased_quantity,
  sum(sold_quantity) as sold_quantity,
  sum(remaining_quantity) as remaining_quantity,
  sum(remaining_cost) as remaining_cost
from v_purchase_stock
group by product_id;

-- Sales joined with their matched purchase cost and computed profit.
create view v_sales_detail with (security_invoker = true) as
select
  s.id as sale_id,
  s.sale_date,
  s.quantity,
  s.sale_price,
  s.platform,
  s.fee,
  s.shipping_fee,
  s.other_fee,
  s.memo,
  pu.id as purchase_id,
  pu.product_id,
  pu.unit_price as purchase_unit_price,
  s.quantity * pu.unit_price as matched_purchase_cost,
  s.sale_price
    - (s.quantity * pu.unit_price)
    - s.fee - s.shipping_fee - s.other_fee as net_profit
from sales s
join purchases pu on pu.id = s.purchase_id;

-- All-time dashboard totals (README §3 "전체" period). Period-scoped
-- (연도별/월별/일별) breakdowns are computed on demand from `purchases`,
-- `sales` and `v_sales_detail` rather than materialized here.
create view v_dashboard_totals with (security_invoker = true) as
select
  coalesce((select sum(quantity * unit_price) from purchases), 0) as total_purchase_amount,
  coalesce((select sum(quantity) from purchases), 0) as total_purchase_quantity,
  coalesce((select sum(sale_price) from sales), 0) as total_sale_amount,
  coalesce((select sum(quantity) from sales), 0) as total_sale_quantity,
  coalesce((select sum(net_profit) from v_sales_detail), 0) as total_net_profit,
  coalesce((select sum(remaining_quantity) from v_product_stock), 0) as current_stock_quantity,
  coalesce((select sum(remaining_cost) from v_product_stock), 0) as current_stock_amount;

-- ============================================================================
-- Row Level Security
--
-- Single-admin app: any authenticated user may read/write, purchases are
-- insert/select only (append-only ledger, see README §5), and no anonymous
-- access is permitted anywhere.
-- ============================================================================

alter table products enable row level security;
alter table product_images enable row level security;
alter table logistics_codes enable row level security;
alter table purchases enable row level security;
alter table sales enable row level security;

create policy "authenticated full access" on products
  for all to authenticated using (true) with check (true);

create policy "authenticated full access" on product_images
  for all to authenticated using (true) with check (true);

create policy "authenticated full access" on logistics_codes
  for all to authenticated using (true) with check (true);

-- purchases: append-only — read and insert, no update/delete.
create policy "authenticated read" on purchases
  for select to authenticated using (true);

create policy "authenticated insert" on purchases
  for insert to authenticated with check (true);

create policy "authenticated full access" on sales
  for all to authenticated using (true) with check (true);
