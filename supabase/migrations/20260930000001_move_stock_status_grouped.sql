-- 재고 현황 홈 화면 카드가 매입 배치(구매 건) 단위로 쪼개져서, 같은 상품을
-- 상태 이동하다 보면 같은 상태 안에서도 카드가 여러 개로 늘어나 보이는
-- 문제가 있었다. 홈 화면은 이제 (상품, 상태) 단위로 카드를 합쳐서 보여주고,
-- 이동/판매 조작은 이 RPC로 여러 배치에 걸쳐 FIFO(오래된 매입분부터)로
-- 처리한다. split_purchase_stock_status는 재고관리 페이지의 배치별 상세
-- 테이블에서 계속 쓰이므로 그대로 둔다.
create or replace function move_stock_status(
  p_product_id uuid,
  p_from_status text,
  p_quantity integer,
  p_to_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
  v_take integer;
  v_left integer := p_quantity;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be positive';
  end if;

  if p_to_status not in ('online', 'in_transit', 'in_hand') then
    raise exception 'invalid stock_status';
  end if;

  for v_row in
    select
      p.id,
      p.quantity - coalesce(
        (select sum(s.quantity) from sales s
          where s.purchase_id = p.id and s.canceled_at is null),
        0
      ) as remaining
    from purchases p
    where p.product_id = p_product_id
      and p.stock_status = p_from_status
    order by p.purchase_date asc, p.created_at asc
    for update
  loop
    exit when v_left <= 0;
    if v_row.remaining <= 0 then
      continue;
    end if;

    v_take := least(v_left, v_row.remaining);

    if v_take = v_row.remaining then
      update purchases set stock_status = p_to_status where id = v_row.id;
    else
      update purchases set quantity = quantity - v_take where id = v_row.id;

      insert into purchases (product_id, purchase_date, quantity, unit_price, vendor, memo, stock_status)
      select product_id, purchase_date, v_take, unit_price, vendor, memo, p_to_status
      from purchases
      where id = v_row.id;
    end if;

    v_left := v_left - v_take;
  end loop;

  if v_left > 0 then
    raise exception 'exceeds remaining stock';
  end if;
end;
$$;

grant execute on function move_stock_status(uuid, text, integer, text) to authenticated;
