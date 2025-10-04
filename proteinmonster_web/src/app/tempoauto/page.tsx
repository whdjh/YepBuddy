import FormSection from './components/FormSection';
import { Hero } from '@/components/common/Hero';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PC용 템포조절 | 프로틴몬스터",
  description: "PC용 템포조절 페이지 입니다.",
};

export default function TempoAuto() {
  return (
    <>
      <div className="hidden tab:block">
        <Hero
          title="PC 버전"
          subtitle="세밀한 템포 조절"
        />
      </div>
      <FormSection />
    </>
  );
}
