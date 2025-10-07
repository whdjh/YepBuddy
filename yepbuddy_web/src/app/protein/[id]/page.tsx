import HeaderSection from "@/app/protein/[id]/components/HeaderSection";
import MainSection from "@/app/protein/[id]/components/MainSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "단백질상세 | 옙버디",
  description: "단백질 가격비교 상세 페이지입니다.",
};


export default function ProteinId() {
  return (
    <div className="p-2 tab:p-5">
      <HeaderSection />
      <MainSection />
    </div>
  );
}
