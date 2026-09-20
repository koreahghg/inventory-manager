import { notFound } from "next/navigation";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Alert } from "@/shared/ui/Alert";
import { safely } from "@/shared/lib/safe";
import { getProduct, getProductImages } from "@/entities/product/api";
import { UpdateProductForm } from "@/features/product/update-product/ui";

export async function EditProductPage({ productId }: { productId: string }) {
  const result = await safely(async () => {
    const [product, images] = await Promise.all([
      getProduct(productId),
      getProductImages(productId),
    ]);
    return { product, images };
  });

  if (!result.ok) {
    return (
      <Alert
        tone="warning"
        message="상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
      />
    );
  }

  const { product, images } = result.data;
  if (!product) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader title="상품 정보 수정" description={product.name} />
      <UpdateProductForm product={product} images={images} />
    </div>
  );
}
