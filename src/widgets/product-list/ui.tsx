import Image from "next/image";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Alert } from "@/shared/ui/Alert";
import { formatCurrency, formatQuantity } from "@/shared/lib/format";
import { isStaleInventory } from "@/shared/lib/stale";
import { safely } from "@/shared/lib/safe";
import { listProductsWithStock, type ProductListFilter } from "@/entities/product/api";

export function preload(filter?: ProductListFilter) {
  void listProductsWithStock(filter);
}

export async function ProductList({ filter }: { filter?: ProductListFilter }) {
  const result = await safely(() => listProductsWithStock(filter));

  if (!result.ok) {
    return (
      <Alert tone="warning" message="상품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." />
    );
  }

  const products = result.data;

  if (products.length === 0) {
    return <EmptyState message="조건에 맞는 상품이 없습니다." />;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>이미지</Th>
          <Th>상품명</Th>
          <Th>브랜드 / 품번</Th>
          <Th>사이즈 / 색상</Th>
          <Th>재고 수량</Th>
          <Th>재고 매입금액</Th>
        </Tr>
      </Thead>
      <Tbody>
        {products.map((product) => (
          <Tr key={product.id} className="hover:bg-grey-50">
            <Td>
              <Link href={`/products/${product.id}`}>
                {product.primary_image_url ? (
                  <Image
                    src={product.primary_image_url}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-m bg-grey-100" />
                )}
              </Link>
            </Td>
            <Td>
              <Link href={`/products/${product.id}`} className="font-medium text-grey-900 hover:underline">
                {product.name}
              </Link>
              {isStaleInventory(product.stock.oldest_available_purchase_date) && (
                <span className="ml-2">
                  <Badge tone="red">장기재고</Badge>
                </span>
              )}
            </Td>
            <Td>
              {product.brand ?? "-"} {product.style_code ? `/ ${product.style_code}` : ""}
            </Td>
            <Td>
              {product.size ?? "-"} / {product.color ?? "-"}
            </Td>
            <Td>
              {product.stock.remaining_quantity > 0 ? (
                <Badge tone="green">{formatQuantity(product.stock.remaining_quantity)}</Badge>
              ) : (
                <Badge tone="gray">품절</Badge>
              )}
            </Td>
            <Td>{formatCurrency(product.stock.remaining_cost)}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
