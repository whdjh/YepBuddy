import { Hero } from "@/components/common/Hero";
import ProfileHeader from "@/components/product/partner/detail/ProfileHeader";
import ProfileOverview from "@/components/product/partner/detail/ProfileOverview";
import SideCard from "@/components/product/partner/detail/SideCard";

export default function PartnerId() {
  return (
    <div className="m-5">
      <Hero title="" subtitle="" />

      {/* 소형: 1열 → SideCard가 아래로 자연스럽게 내려감
          tab 이상: 6열 → 메인 4칸 + 사이드 2칸 */}
      <div className="grid grid-cols-1 tab:grid-cols-6 mt-10 gap-20 items-start">
        {/* 메인: 소형 전체폭, tab 이상 4칸 */}
        <div className="col-span-full tab:col-span-4 space-y-10 mx-5">
          <ProfileHeader />
          <ProfileOverview />
        </div>

        {/* 사이드: 소형에서 표시, tab 이상에서는 2칸 + 우측 정렬 */}
        <div className="col-span-full tab:col-span-2 tab:justify-self-end mx-5">
          <SideCard />
        </div>
      </div>
    </div>
  );
}
