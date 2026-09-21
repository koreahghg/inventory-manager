-- 홈 화면 "총 판매금액"도 판매가 그대로가 아니라 수수료/배송비/기타비용을
-- 뺀 순 판매금액으로 계산한다. total_net_profit은 이미 이 방식(판매가 -
-- 수수료류)으로 계산하고 있었으니, 이제 total_sale_amount에도 같은 식을
-- 써서 "총 판매금액 - 총 매입금액 = 총 수익"이 그대로 맞아떨어지게 한다.
drop view if exists v_dashboard_totals;

create view v_dashboard_totals with (security_invoker = true) as
select
  coalesce((select sum(quantity * unit_price) from purchases), 0)
    + coalesce((select sum(fee) from logistics_registrations), 0) as total_purchase_amount,
  coalesce((select sum(quantity) from purchases), 0) as total_purchase_quantity,
  coalesce(
    (select sum(sale_price - fee - shipping_fee - other_fee) from sales where canceled_at is null),
    0
  ) as total_sale_amount,
  coalesce((select sum(quantity) from sales where canceled_at is null), 0) as total_sale_quantity,
  coalesce(
    (select sum(sale_price - fee - shipping_fee - other_fee) from sales where canceled_at is null),
    0
  )
    - coalesce((select sum(quantity * unit_price) from purchases), 0)
    - coalesce((select sum(fee) from logistics_registrations), 0) as total_net_profit,
  coalesce((select sum(remaining_quantity) from v_product_stock), 0) as current_stock_quantity,
  coalesce((select sum(remaining_cost) from v_product_stock), 0) as current_stock_amount;

grant select on v_dashboard_totals to authenticated;
