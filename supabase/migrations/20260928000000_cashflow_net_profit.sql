-- 순이익 계산을 매출총이익 매칭 방식(판매 시점에 매입원가 차감)에서
-- 현금흐름 방식으로 바꾼다: 매입은 매입 시점에 즉시 비용(마이너스)으로
-- 반영되고, 판매 순이익은 더 이상 매입원가를 다시 차감하지 않는다
-- (그러면 같은 비용이 두 번 차감된다). matched_purchase_cost/
-- purchase_unit_price는 참고용 정보로만 남긴다.
--
-- v_dashboard_totals가 v_sales_detail을 참조하므로 의존성 역순으로 DROP한다.
-- 뷰를 DROP하면 그 위의 GRANT도 함께 사라지므로(20260922000000에서 이걸
-- 빠뜨렸던 버그를 20260927000000에서 고쳤다) 끝에서 다시 GRANT한다.
drop view if exists v_dashboard_totals;
drop view if exists v_sales_detail;
drop view if exists v_transactions;

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
  s.sale_price - s.fee - s.shipping_fee - s.other_fee as net_profit
from sales s
join purchases pu on pu.id = s.purchase_id;

create view v_dashboard_totals with (security_invoker = true) as
select
  coalesce((select sum(quantity * unit_price) from purchases), 0) as total_purchase_amount,
  coalesce((select sum(quantity) from purchases), 0) as total_purchase_quantity,
  coalesce((select sum(sale_price) from sales where canceled_at is null), 0) as total_sale_amount,
  coalesce((select sum(quantity) from sales where canceled_at is null), 0) as total_sale_quantity,
  coalesce((select sum(net_profit) from v_sales_detail where canceled_at is null), 0)
    - coalesce((select sum(quantity * unit_price) from purchases), 0)
    - coalesce((select sum(fee) from logistics_registrations), 0) as total_net_profit,
  coalesce((select sum(remaining_quantity) from v_product_stock), 0) as current_stock_quantity,
  coalesce((select sum(remaining_cost) from v_product_stock), 0) as current_stock_amount;

-- "기록" 페이지의 순이익 열: 매입은 -총매입금액, 판매는 판매금액에서
-- 수수료류만 차감(매입원가는 매입 시점에 이미 반영됐으므로 다시 빼지 않음).
create view v_transactions with (security_invoker = true) as
select
  p.id,
  'purchase'::text as type,
  p.purchase_date as record_date,
  pr.name as product_name,
  pr.brand as product_brand,
  p.quantity,
  p.unit_price as unit_amount,
  p.quantity * p.unit_price as total_amount,
  p.vendor as counterparty,
  null::timestamptz as canceled_at,
  p.memo,
  -(p.quantity * p.unit_price) as net_profit,
  p.created_at
from purchases p
join products pr on pr.id = p.product_id

union all

select
  s.id,
  'sale'::text as type,
  s.sale_date as record_date,
  pr.name as product_name,
  pr.brand as product_brand,
  s.quantity,
  s.sale_price as unit_amount,
  s.quantity * s.sale_price as total_amount,
  s.platform as counterparty,
  s.canceled_at,
  s.memo,
  s.sale_price - s.fee - s.shipping_fee - s.other_fee as net_profit,
  s.created_at
from sales s
join purchases pu on pu.id = s.purchase_id
join products pr on pr.id = pu.product_id;

grant select on v_sales_detail, v_dashboard_totals, v_transactions to authenticated;
