import { Hero } from "@/components/common/Hero";
import FormSection from "@/components/product/partner/submit/FormSection";

export default function PartnerPost() {
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <Hero title="파트너 등록" subtitle="파트너를 모집해보세요!" />
      <FormSection />
    </div>
  );
}
