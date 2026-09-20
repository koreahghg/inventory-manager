import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/shared/ui/toast";

export const metadata: Metadata = {
  title: "재고 관리 시스템",
  description: "상품 재고·매입·판매·수익 통합 관리 시스템",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-grey-50">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
