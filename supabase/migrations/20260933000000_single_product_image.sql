-- 상품 이미지를 여러 장(대표 지정 포함) 관리하던 방식에서 상품당 이미지
-- 1장만 갖는 방식으로 단순화한다. 기존에 이미지가 여러 장 있던 상품은
-- 대표 이미지(없으면 sort_order가 가장 앞선 것)를 새 컬럼으로 옮긴다.
alter table products add column image_url text;

update products p
set image_url = (
  select pi.url
  from product_images pi
  where pi.product_id = p.id
  order by pi.is_primary desc, pi.sort_order asc
  limit 1
);

drop table product_images;
