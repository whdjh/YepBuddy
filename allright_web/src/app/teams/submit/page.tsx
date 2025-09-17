import { Hero } from "@/components/common/Hero";
import FormSection from "@/components/product/teams/submit/FormSection";

export default function TeamsSubmit() {
  return (
    <div className="space-y-20">
      <Hero title="회원모집 등록" subtitle="피티공고를 등록해보세요!" />
      <FormSection />
    </div>
  );
}