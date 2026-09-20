-- 안전망: 이 뷰들에 대해 authenticated SELECT 권한을 다시 확인/부여한다.
-- GRANT는 멱등이라 이미 권한이 있어도 다시 실행해도 무해하다.
-- 문장을 분리해서, 아직 존재하지 않는 뷰(예: 이전 마이그레이션을 아직 안
-- 돌렸다면 v_transactions)가 있어도 그 문장만 에러 나고 나머지는 적용된다.
grant select on v_purchase_stock to authenticated;
grant select on v_product_stock to authenticated;
grant select on v_sales_detail to authenticated;
grant select on v_dashboard_totals to authenticated;
grant select on v_transactions to authenticated;
