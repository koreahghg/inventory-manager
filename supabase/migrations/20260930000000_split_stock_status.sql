-- 재고 상태(온라인/배송중/보유)는 지금까지 매입 배치(purchases 한 행) 전체
-- 단위로만 바뀌었다. 한 배치에 남은 수량이 여러 개일 때 그중 일부만 다른
-- 상태로 옮길 수 있어야 한다는 요청에 따라, 옮기는 수량만큼 원래 행에서
-- 떼어내 새 행으로 분리하는 RPC를 추가한다.
--
-- purchases.quantity는 append-only 원칙상 클라이언트가 직접 못 고치므로
-- (컬럼 단위 GRANT가 없음), 이 SECURITY DEFINER 함수 안에서만 분리 후
-- 수량 합이 보존되도록 통제된 방식으로 수정한다.
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
    -- 남은 수량 전체를 옮기는 경우엔 분리할 필요 없이 상태만 바꾼다.
    update purchases set stock_status = p_new_status where id = p_purchase_id;
    return p_purchase_id;
  end if;

  update purchases set quantity = quantity - p_quantity where id = p_purchase_id;

  insert into purchases (
    product_id, purchase_date, quantity, unit_price, vendor, memo, stock_status
  ) values (
    v_purchase.product_id, v_purchase.purchase_date, p_quantity, v_purchase.unit_price,
    v_purchase.vendor, v_purchase.memo, p_new_status
  ) returning id into v_new_id;

  return v_new_id;
end;
$$;

grant execute on function split_purchase_stock_status(uuid, integer, text) to authenticated;
