-- Registering a product always creates its first purchase batch at the same
-- time (README §4). Wrapping both inserts in one function keeps them in a
-- single transaction instead of relying on manual client-side rollback.
create or replace function create_product_with_initial_purchase(
  p_name text,
  p_brand text,
  p_style_code text,
  p_size text,
  p_color text,
  p_memo text,
  p_purchase_date date,
  p_quantity integer,
  p_unit_price numeric,
  p_vendor text,
  p_logistics_code_id uuid,
  p_purchase_memo text
)
returns uuid
language plpgsql
security invoker
as $$
declare
  new_product_id uuid;
begin
  insert into products (name, brand, style_code, size, color, memo)
  values (p_name, p_brand, p_style_code, p_size, p_color, p_memo)
  returning id into new_product_id;

  insert into purchases (
    product_id, purchase_date, quantity, unit_price, vendor,
    logistics_code_id, memo
  )
  values (
    new_product_id, p_purchase_date, p_quantity, p_unit_price, p_vendor,
    p_logistics_code_id, p_purchase_memo
  );

  return new_product_id;
end;
$$;

grant execute on function create_product_with_initial_purchase(
  text, text, text, text, text, text, date, integer, numeric, text, uuid, text
) to authenticated;
