-- 재고 상세 화면에서 매입처를 사후에 고칠 수 있어야 한다는 요청에 따라
-- stock_status와 동일한 방식으로 vendor 컬럼에만 UPDATE 권한을 추가한다.
-- 다른 핵심 필드(수량/단가/매입일 등)는 여전히 append-only로 남는다.
grant update (vendor) on purchases to authenticated;

create policy "authenticated update vendor" on purchases
  for update to authenticated using (true) with check (true);

-- 잘못 입력된 매입 기록을 완전히 지울 수 있어야 한다는 요청에 따라 DELETE를
-- 허용한다. sales.purchase_id가 on delete restrict이므로 판매 기록이 남아
-- 있는 매입은 DB 차원에서 여전히 삭제가 막힌다(외래 키 제약 위반 에러).
create policy "authenticated delete" on purchases
  for delete to authenticated using (true);
