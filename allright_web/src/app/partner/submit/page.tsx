import { Hero } from "@/components/common/Hero";
import FormSection from "@/components/product/partner/submit/FormSection";

export default function PartnerPost() {
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <Hero title="파트너 모집" subtitle="함께할 파트너 직접 모집" />
      <FormSection />
    </div>
  );
}
