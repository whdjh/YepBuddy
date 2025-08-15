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
        <main className="mt-[5.5rem] mx-[0.5rem] bg-[#242429] p-[1rem] rounded-[0.5rem] min-h-[calc(100vh-5.5rem-1rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
