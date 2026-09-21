import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // 기본 1MB로는 상품 이미지 업로드가 거의 다 걸린다.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
