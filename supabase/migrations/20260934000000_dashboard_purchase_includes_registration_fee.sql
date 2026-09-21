-- 홈 화면 "총 매입금액"에 물류 코드 등록비도 포함시킨다. total_net_profit은
-- 이미 등록비를 차감해서 계산하고 있었으니(20260928000000), 이제
-- total_purchase_amount에도 등록비를 더해서 두 값이 서로 맞게 만든다 —
-- 계산식 자체(순이익 = 판매순이익 - 매입금액 - 등록비)는 그대로라
-- 이중 차감되지 않는다.
drop view if exists v_dashboard_totals;

create view v_dashboard_totals with (security_invoker = true) as
select
  coalesce((select sum(quantity * unit_price) from purchases), 0)
    + coalesce((select sum(fee) from logistics_registrations), 0) as total_purchase_amount,
  coalesce((select sum(quantity) from purchases), 0) as total_purchase_quantity,
  coalesce((select sum(sale_price) from sales where canceled_at is null), 0) as total_sale_amount,
  coalesce((select sum(quantity) from sales where canceled_at is null), 0) as total_sale_quantity,
  coalesce((select sum(net_profit) from v_sales_detail where canceled_at is null), 0)
    - coalesce((select sum(quantity * unit_price) from purchases), 0)
    - coalesce((select sum(fee) from logistics_registrations), 0) as total_net_profit,
  coalesce((select sum(remaining_quantity) from v_product_stock), 0) as current_stock_quantity,
  coalesce((select sum(remaining_cost) from v_product_stock), 0) as current_stock_amount;

grant select on v_dashboard_totals to authenticated;
