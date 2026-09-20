-- "Automatically expose new tables" was intentionally left off when the
-- project was created (Supabase's own recommendation, for manual access
-- control) — but that also means new tables/views never receive the base
-- GRANT that PostgREST needs before RLS policies can even apply. Without
-- this, every request from the `authenticated` role fails with
-- "permission denied for table ..." regardless of the RLS policies already
-- defined in the earlier migrations.
grant usage on schema public to authenticated;

grant select, insert, update, delete on
  products,
  product_images,
  logistics_codes,
  purchases,
  sales
to authenticated;

-- Actual write restrictions (e.g. purchases being insert/select-only) are
-- still enforced by the RLS policies from the init migration, not by these
-- grants — RLS narrows what a broader GRANT allows, it never widens it.

grant select on
  v_purchase_stock,
  v_product_stock,
  v_sales_detail,
  v_dashboard_totals
to authenticated;
