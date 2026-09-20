import Image from "next/image";
import type { ProductImage } from "@/entities/product/model";
import { deleteProductImage, setPrimaryImage } from "@/features/product/manage-images/actions";
import { ImageUploadTrigger } from "@/features/product/manage-images/upload-trigger";

export function ProductGallery({
  images,
  productName,
  productId,
}: {
  images: ProductImage[];
  productName: string;
  productId: string;
}) {
  if (images.length === 0) {
    return (
      <ImageUploadTrigger productId={productId} className="block">
        <div className="rounded-xl border border-dashed border-grey-200 bg-white p-8 text-center text-body-2 text-grey-500 hover:border-grey-300 hover:bg-grey-50">
          등록된 이미지가 없습니다. 클릭해서 이미지를 등록해 주세요.
        </div>
      </ImageUploadTrigger>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((image) => (
        <div
          key={image.id}
          className="group relative aspect-square overflow-hidden rounded-xl border border-grey-200"
        >
          <Image
            src={image.url}
            alt={productName}
            fill
            sizes="200px"
            className="object-cover"
          />
          {image.is_primary && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-grey-900/80 px-2 py-0.5 text-[11px] font-medium text-white">
              대표
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            {!image.is_primary && (
              <form action={setPrimaryImage.bind(null, productId, image.id)}>
                <button
                  type="submit"
                  className="rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-grey-800 hover:bg-white"
                >
                  대표로 지정
                </button>
              </form>
            )}
            <form action={deleteProductImage.bind(null, productId, image.id)}>
              <button
                type="submit"
                className="rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-danger hover:bg-white"
              >
                삭제
              </button>
            </form>
          </div>
        </div>
      ))}

      <ImageUploadTrigger productId={productId} className="block aspect-square">
        <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-grey-200 bg-white text-body-2 text-grey-400 hover:border-grey-300 hover:bg-grey-50">
          + 이미지 추가
        </div>
      </ImageUploadTrigger>
    </div>
  );
}
