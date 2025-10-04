import { FlickeringGrid } from "@/components/ui/flickering-grid";
import AuthCard from "@/app/auth/join/components/AuthCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입 | 프로틴몬스터",
  description: "회원가입 페이지 입니다.",
};

export default function Join() {
  return (
    <div className="grid grid-cols-2 min-h-[calc(100vh-8rem)]">
      <FlickeringGrid
        squareSize={4}
        gridGap={5}
        maxOpacity={0.5}
        flickerChance={0.2}
        color="#16a34a"
      />
      <div className="flex flex-col items-center justify-start p-2 tab:p-5">
        <AuthCard />
      </div>
    </div>
  );
}