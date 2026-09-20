-- Sale cancellation (returns / mistaken entries). The row is never deleted
-- (keeps the ledger intact per README §9) — it's marked canceled instead,
-- which frees the underlying purchase batch's stock back up and is excluded
-- from every profit/amount aggregate.
alter table sales add column canceled_at timestamptz;
alter table sales add column cancel_reason text;

drop view if exists v_dashboard_totals;
drop view if exists v_sales_detail;
drop view if exists v_product_stock;
drop view if exists v_purchase_stock;

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
  where canceled_at is null
  group by purchase_id
) s on s.purchase_id = p.id;

-- Adds oldest_available_purchase_date so slow-moving stock can be flagged
-- in the UI (README-adjacent nice-to-have, not in the original spec).
create view v_product_stock with (security_invoker = true) as
select
  product_id,
  sum(purchased_quantity) as purchased_quantity,
  sum(sold_quantity) as sold_quantity,
  sum(remaining_quantity) as remaining_quantity,
  sum(remaining_cost) as remaining_cost,
  min(purchase_date) filter (where remaining_quantity > 0) as oldest_available_purchase_date
from v_purchase_stock
group by product_id;

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
  s.canceled_at,
  s.cancel_reason,
  pu.id as purchase_id,
  pu.product_id,
  pu.unit_price as purchase_unit_price,
  s.quantity * pu.unit_price as matched_purchase_cost,
  s.sale_price
    - (s.quantity * pu.unit_price)
    - s.fee - s.shipping_fee - s.other_fee as net_profit
from sales s
join purchases pu on pu.id = s.purchase_id;

create view v_dashboard_totals with (security_invoker = true) as
select
  coalesce((select sum(quantity * unit_price) from purchases), 0) as total_purchase_amount,
  coalesce((select sum(quantity) from purchases), 0) as total_purchase_quantity,
  coalesce((select sum(sale_price) from sales where canceled_at is null), 0) as total_sale_amount,
  coalesce((select sum(quantity) from sales where canceled_at is null), 0) as total_sale_quantity,
  coalesce((select sum(net_profit) from v_sales_detail where canceled_at is null), 0) as total_net_profit,
  coalesce((select sum(remaining_quantity) from v_product_stock), 0) as current_stock_quantity,
  coalesce((select sum(remaining_cost) from v_product_stock), 0) as current_stock_amount;

-- Canceling a sale must not re-trigger the "exceeds remaining stock" check,
-- and un-canceling one (not currently exposed in the UI) still should.
create or replace function check_sale_does_not_exceed_stock()
returns trigger
language plpgsql
as $$
declare
  batch_quantity integer;
  already_sold integer;
begin
  if new.canceled_at is not null then
    return new;
  end if;

  select quantity into batch_quantity
  from purchases
  where id = new.purchase_id;

  select coalesce(sum(quantity), 0) into already_sold
  from sales
  where purchase_id = new.purchase_id
    and id <> new.id
    and canceled_at is null;

  if already_sold + new.quantity > batch_quantity then
    raise exception 'sale quantity exceeds remaining stock for purchase %', new.purchase_id;
  end if;

  return new;
end;
$$;
