import { Hero } from "@/components/common/Hero";
import FormSection from "@/app/_dummypage/community/submit/components/FormSection";

export default function SubmitPost() {
  return (
    <div className="space-y-5 tab:space-y-20 p-2 tab:p-5">
      <Hero title="커뮤니티 글쓰기" subtitle="운동 이야기 공유"
      />
      <FormSection />
    </div>
  );
}