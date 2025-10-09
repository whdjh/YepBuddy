// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },

      // Supabase 스토리지 이미지 허용 추가
      {
        protocol: "https",
        hostname: "lvjrfmwsdnfkvawnzqst.supabase.co",
        pathname: "/storage/v1/object/public/protein/**",
      },
      // 여러 프로젝트를 허용하고 싶다면 아래처럼 와일드카드도 가능
      // { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
