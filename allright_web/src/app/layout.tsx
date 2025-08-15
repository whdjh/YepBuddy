import type { Metadata } from "next";
import "../styles/globals.css";
import Gnb from "@/components/common/Gnb";
import ScrollController from "@/components/common/ScrollController";

export const metadata: Metadata = {
  title: "allright",
  description: "운동템포 조절",
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
        <Gnb />
        {children}
      </body>
    </html>
  );
}
