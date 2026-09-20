-- ============================================================================
-- Product search speedup: listProductsWithStock() (src/entities/product/api.ts)
-- searches name/brand/style_code with a leading-wildcard ilike
-- (`%term%`), e.g. `.or('name.ilike.%term%,brand.ilike.%term%,...')`. A
-- leading wildcard can't use a plain btree index (products_name_idx,
-- products_style_code_idx from the init migration), so that query degrades
-- to a sequential scan as the products table grows, and `brand` has no
-- index at all. pg_trgm + GIN indexes make ilike '%term%' index-scannable.
-- ============================================================================

create extension if not exists "pg_trgm";

create index products_name_trgm_idx on products using gin (name gin_trgm_ops);
create index products_brand_trgm_idx on products using gin (brand gin_trgm_ops);
create index products_style_code_trgm_idx on products using gin (style_code gin_trgm_ops);
