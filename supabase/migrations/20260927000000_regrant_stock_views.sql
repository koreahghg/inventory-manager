-- 20260922000000_stock_status.sql에서 v_purchase_stock/v_product_stock/
-- v_sales_detail/v_dashboard_totals를 DROP 후 재생성하면서 authenticated
-- 권한 재부여를 빠뜨렸다. 뷰를 DROP하면 그 위의 GRANT도 함께 사라지고
-- 새로 CREATE된 뷰는 권한이 없는 상태로 시작하기 때문에, 그 마이그레이션
-- 적용 이후 이 4개 뷰에 대한 SELECT 권한이 계속 빠져 있었다.
grant select on
  v_purchase_stock,
  v_product_stock,
  v_sales_detail,
  v_dashboard_totals
to authenticated;
