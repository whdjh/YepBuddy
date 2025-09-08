"use client";

import { Hero } from "@/components/common/hero";
import FormSection from "@/components/product/trainer/promote/FormSection";

export default function Promote() {
  return (
    <div className="space-y-10 flex flex-col justify-center">
      <Hero title="트레이너 홍보" subtitle="당신을 홍보해보세요!" />
      <FormSection />
    </div>
  );
}
