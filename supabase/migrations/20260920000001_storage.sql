-- Storage bucket for product images (README §4). The DB only stores the
-- resulting public URL in `product_images.url`.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

create policy "authenticated manage product images"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');
