import type { Metadata } from "next";
import "../styles/globals.css";
import Gnb from "@/components/common/Gnb";
import ScrollController from "@/components/common/ScrollController";
import Toast from "@/components/common/Toast";

export const metadata: Metadata = {
  title: "엡버디",
  icons: {
    icon: '/favicon.ico',
  },
  description: "운동 템포 조절, 프로틴 가격 비교, 헬스장 안내 및 운동일지를 투명하게 트레이너와 공유해보세요.",
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
        <Gnb isLoggedIn={true} hasMessages={true} hasNotifications={true} username={"1"} />
        <main className="mt-[5.5rem] p-0 tab:p-5">
          {children}
        </main>
        <Toast />
      </body>
    </html>
  );
}
