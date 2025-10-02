import { FlickeringGrid } from "@/components/ui/flickering-grid";
import AuthCard from "@/app/auth/login/components/AuthCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allright | 로그인",
  description: "로그인 페이지 입니다.",
};


export default function Login() {
  return (
    <div className="grid grid-cols-2 min-h-[calc(100vh-8rem)]">
      <FlickeringGrid
        squareSize={4}
        gridGap={5}
        maxOpacity={0.5}
        flickerChance={0.2}
        color="#16a34a"
      />
      <div className="flex flex-col items-center p-2 tab:p-5">
        <AuthCard />
      </div>
    </div>
  );
}