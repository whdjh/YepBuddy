import type { Metadata } from "next";
import "../styles/globals.css";
import Gnb from "@/components/Gnb";


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
        {children}
      </body>
    </html>
  );
}
