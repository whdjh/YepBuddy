import HeaderSection from "@/app/protein/[id]/components/HeaderSection";
import MainSection from "@/app/protein/[id]/components/MainSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "단백질상세 | 옙버디",
  description: "단백질 가격비교 상세 페이지입니다.",
};

export default function ProteinId() {
  return (
    <>
      <div className="bg-red-600 text-xs text-center mob:text-lg p-2">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로,
        <br className="mob:hidden" />
        이에 따른 일정액의 수수료를 제공받습니다.
      </div>
      <div className="p-2 tab:p-5">
        <HeaderSection />
        <MainSection />
      </div>
    </>
  );
}