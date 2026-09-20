-- "기록" 페이지의 전체 기록(매입+판매 통합, 날짜순) 조회를 위한 뷰.
-- 판매는 취소된 건도 포함하고 canceled_at으로 구분해서 보여준다(기록이므로
-- 취소 이력도 남겨야 함) — v_sales_detail과 동일한 방침.
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
  s.created_at
from sales s
join purchases pu on pu.id = s.purchase_id
join products pr on pr.id = pu.product_id;

grant select on v_transactions to authenticated;
