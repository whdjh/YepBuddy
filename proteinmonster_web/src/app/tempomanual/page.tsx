import { Hero } from '@/components/common/Hero';
import FormSection from '@/app/tempomanual/components/FormSection';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "모바일용 템포조절 | 프로틴몬스터",
  description: "모바일용 템포조절 페이지 입니다.",
};

export default function TempoManual() {
  return (
    <>
      <div className="hidden mob:block">
        <Hero
          title="모바일 버전"
          subtitle="간단한 카운팅"
        />
      </div>

      <FormSection />
    </>
  );
}
