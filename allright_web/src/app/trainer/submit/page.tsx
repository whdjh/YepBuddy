import { Hero } from "@/components/common/Hero";
import FromSection from "@/app/trainer/submit/components/FormSection";

export default function Submit() {
  return (
    <div className="space-y-10 flex flex-col justify-center p-2 tab:p-5">
      <Hero title="트레이너 등록" subtitle="트레이너로 내 프로필 등록" />
      <FromSection />
    </div>
  );
}