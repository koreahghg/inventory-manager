import Image from "next/image";
import { deleteProductImage } from "@/features/product/manage-images/actions";
import { ImageUploadTrigger } from "@/features/product/manage-images/upload-trigger";

export function ProductGallery({
  imageUrl,
  productName,
  productId,
}: {
  imageUrl: string | null;
  productName: string;
  productId: string;
}) {
  if (!imageUrl) {
    return (
      <ImageUploadTrigger productId={productId} className="block">
        <div className="rounded-xl border border-dashed border-grey-200 bg-white p-8 text-center text-body-2 text-grey-500 hover:border-grey-300 hover:bg-grey-50">
          등록된 이미지가 없습니다. 클릭해서 이미지를 등록해 주세요.
        </div>
      </ImageUploadTrigger>
    );
  }

  return (
    <div className="group relative aspect-square w-full max-w-[240px] overflow-hidden rounded-xl border border-grey-200">
      <Image src={imageUrl} alt={productName} fill sizes="240px" className="object-cover" />

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity pointer-fine:group-hover:opacity-100 pointer-coarse:opacity-100">
        <ImageUploadTrigger productId={productId}>
          <span className="inline-flex cursor-pointer items-center rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-grey-800 hover:bg-white">
            교체
          </span>
        </ImageUploadTrigger>
        <form action={deleteProductImage.bind(null, productId)}>
          <button
            type="submit"
            className="rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-danger hover:bg-white"
          >
            삭제
          </button>
        </form>
      </div>
    </div>
  );
}
