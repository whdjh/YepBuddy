import { Hero } from "@/components/common/Hero";
import FormSection from "@/app/trainer/promote/components/FormSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allright | 트레이너 홍보",
  description: "트레이너 홍보 페이지 입니다.",
};

export default function Promote() {
  return (
    <div className="space-y-10 flex flex-col justify-center p-2 tab:p-5">
      <Hero title="트레이너 홍보" subtitle="내 활동 홍보" />
      <FormSection />
    </div>
  );
}
