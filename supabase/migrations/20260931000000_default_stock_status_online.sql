-- 새 매입의 기본 재고 상태를 '보유'(in_hand)에서 '온라인'(online)으로
-- 바꾼다(요청에 따름).
alter table purchases alter column stock_status set default 'online';
