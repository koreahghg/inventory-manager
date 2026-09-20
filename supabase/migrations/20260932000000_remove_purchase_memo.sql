-- 매입 메모(purchases.memo) 기능을 완전히 없앤다 — 한 번도 쓰인 적이 없다.
-- 상품 메모(products.memo)는 별개 필드이며 그대로 유지한다.
--
-- 컬럼을 드롭하기 전에, 그 컬럼을 참조하는 뷰/함수를 먼저 고쳐야 한다
-- (참조가 남아있으면 DROP COLUMN이 실패하거나 CASCADE로 뷰까지 지워진다).

-- 1) v_transactions: 매입 쪽 memo를 null로 바꾸고, 판매 쪽 memo는 그대로 둔다.
drop view if exists v_transactions;

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
  null::text as memo,
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

grant select on v_transactions to authenticated;

-- 2) create_product_with_initial_purchase: p_purchase_memo 파라미터 제거.
-- 파라미터 목록이 바뀌므로 기존 함수를 먼저 드롭해야 한다.
drop function if exists create_product_with_initial_purchase(
  text, text, text, text, text, text, date, integer, numeric, text, text
);

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
  p_vendor text
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
    product_id, purchase_date, quantity, unit_price, vendor
  )
  values (
    new_product_id, p_purchase_date, p_quantity, p_unit_price, p_vendor
  );

  return new_product_id;
end;
$$;

grant execute on function create_product_with_initial_purchase(
  text, text, text, text, text, text, date, integer, numeric, text
) to authenticated;

-- 3) split_purchase_stock_status: 새로 분리되는 행에 memo를 더 이상 복사하지 않는다.
create or replace function split_purchase_stock_status(
  p_purchase_id uuid,
  p_quantity integer,
  p_new_status text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase purchases%rowtype;
  v_sold integer;
  v_remaining integer;
  v_new_id uuid;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be positive';
  end if;

  if p_new_status not in ('online', 'in_transit', 'in_hand') then
    raise exception 'invalid stock_status';
  end if;

  select * into v_purchase from purchases where id = p_purchase_id for update;
  if not found then
    raise exception 'purchase not found';
  end if;

  select coalesce(sum(quantity), 0) into v_sold
    from sales
    where purchase_id = p_purchase_id and canceled_at is null;

  v_remaining := v_purchase.quantity - v_sold;

  if p_quantity > v_remaining then
    raise exception 'exceeds remaining stock';
  end if;

  if p_quantity = v_remaining then
    update purchases set stock_status = p_new_status where id = p_purchase_id;
    return p_purchase_id;
  end if;

  update purchases set quantity = quantity - p_quantity where id = p_purchase_id;

  insert into purchases (product_id, purchase_date, quantity, unit_price, vendor, stock_status)
  values (
    v_purchase.product_id, v_purchase.purchase_date, p_quantity, v_purchase.unit_price,
    v_purchase.vendor, p_new_status
  ) returning id into v_new_id;

  return v_new_id;
end;
$$;

-- 4) move_stock_status: 더 이상 앱 코드에서 쓰지 않는다(split_purchase_stock_status를
-- 여러 번 호출하는 방식으로 대체됨) — 정리 차원에서 드롭한다.
drop function if exists move_stock_status(uuid, text, integer, text);

-- 5) 이제서야 컬럼을 드롭한다.
alter table purchases drop column memo;
