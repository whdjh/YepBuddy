// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 다음 둘은 꼭 넣어주세요 (github 아바타가 리다이렉트되기도 함)
    remotePatterns: [
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // 필요시 추가:
      // { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    // 또는 간단히:
    // domains: ["github.com", "avatars.githubusercontent.com"],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,       // ts/tsx에서만 svgr 적용 (선택)
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
