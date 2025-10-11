import type { Metadata } from "next";
import "../styles/globals.css";
import Gnb from "@/components/common/Gnb";
import ScrollController from "@/components/common/ScrollController";
import Toast from "@/components/common/Toast";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "옙버디",
  description:
    "운동 템포 조절, 프로틴 가격 비교, 헬스장 안내 및 운동일지를 투명하게 트레이너와 공유해보세요.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "옙버디",
    description:
      "운동 템포 조절, 프로틴 가격 비교, 헬스장 안내 및 운동일지를 투명하게 트레이너와 공유해보세요.",
    url: "https://www.yepbuddy.co.kr",
    siteName: "YepBuddy",
    images: [
      {
        url: "https://www.yepbuddy.co.kr/og-image.png",
        width: 1200,
        height: 630,
        alt: "YepBuddy — 운동 템포 & 프로틴 가격 추적",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "옙버디",
    description:
      "운동 템포 조절, 프로틴 가격 비교, 헬스장 안내 및 운동일지를 투명하게 트레이너와 공유해보세요.",
    images: ["https://www.yepbuddy.co.kr/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://www.yepbuddy.co.kr",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <ScrollController />
        <Gnb
          isLoggedIn={true}
          hasMessages={true}
          hasNotifications={true}
          username={"1"}
        />
        <main className="mt-[5.5rem] p-0 tab:p-5">
          <Providers>{children}</Providers>
        </main>
        <Toast />
      </body>
    </html>
  );
}
