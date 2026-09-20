import { ProductsPage, type ProductsSearchParams } from "@/views/products/list-ui";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}) {
  const params = await searchParams;
  return <ProductsPage searchParams={params} />;
}
