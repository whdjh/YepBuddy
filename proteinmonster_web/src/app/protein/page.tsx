import { Hero } from "@/components/common/Hero";
import MainSection from "./components/MainSection";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "단백질 | 프로틴몬스터",
  description: "단백질 가격비교 페이지입니다.",
};

export default function Protein() {
  return (
    <div className="p-2 tab:p-5 space-y-5 tab:space-y-20">
      <Hero title="프로틴" subtitle="프로틴 목록" />
      <Suspense fallback={null}>
        <MainSection />
      </Suspense>
    </div>
  );
}