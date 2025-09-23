import { Hero } from "@/components/common/Hero";
import FormSection from "@/components/product/teams/submit/FormSection";

export default function TeamsSubmit() {
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <Hero title="회원 모집 글쓰기" subtitle="회원 모집 글 작성" />
      <FormSection />
    </div>
  );
}