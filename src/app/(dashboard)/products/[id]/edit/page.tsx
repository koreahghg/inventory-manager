import { EditProductPage } from "@/views/products/edit-ui";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditProductPage productId={id} />;
}
