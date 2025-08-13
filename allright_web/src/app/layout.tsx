import type { Metadata } from "next";
import "../styles/globals.css";
import Gnb from "@/components/common/Gnb";


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
        <Gnb />
        <div className="mt-[3.75rem]">
          {children}
        </div>
      </body>
    </html>
  );
}
