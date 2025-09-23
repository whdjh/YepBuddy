import { Hero } from "@/components/common/Hero";
import FormSection from "@/components/product/community/submit/FormSection";

export default function SubmitPost() { 
  return (
    <div className="space-y-5 tab:space-y-20 p-2 tab:p-5">
      <Hero title="글 생성하기" subtitle="질문하고, 운동 팁을 공유하며, 다른 사람들과 소통하세요!"
      />
      <FormSection />
    </div>
  );
}