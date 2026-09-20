-- 재고 위치/유통 상태 (온라인 재고 / 배송중 / 보유). 매입 금액·수량·매입처
-- 등 핵심 사실은 여전히 불변(append-only)이지만, 이 상태는 사용자가 화면에서
-- 직접 전환하는 운영성 필드라 예외적으로 수정 가능하게 둔다 — sales.canceled_at
-- 과 같은 성격.
alter table purchases
  add column stock_status text not null default 'in_hand'
  check (stock_status in ('online', 'in_transit', 'in_hand'));

create index purchases_stock_status_idx on purchases (stock_status);

-- purchases에 이미 부여된 블랭킷 UPDATE 권한(20260921000001 마이그레이션)을
-- 회수하고 stock_status 컬럼에만 다시 부여한다. 다른 핵심 필드는 여전히
-- RLS+컬럼 권한 이중으로 수정이 막혀 있다.
revoke update on purchases from authenticated;
grant update (stock_status) on purchases to authenticated;

create policy "authenticated update stock_status" on purchases
  for update to authenticated using (true) with check (true);

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
  p.stock_status,
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
