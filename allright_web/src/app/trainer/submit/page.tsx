import { Hero } from "@/components/common/Hero";
import FormSection from "@/app/trainer/submit/components/FormSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allright | 트레이너 등록",
  description: "트리에너 등록하는 페이지 입니다.",
};

export default function Submit() {
  return (
    <div className="space-y-10 flex flex-col justify-center p-2 tab:p-5">
      <Hero title="트레이너 등록" subtitle="트레이너로 내 프로필 등록" />
      <FormSection />
    </div>
  );
}