import { Hero } from "@/components/common/Hero";
import ProfileHeader from "@/components/product/partner/detail/ProfileHeader";
import ProfileOverview from "@/components/product/partner/detail/ProfileOverview";
import SideCard from "@/components/product/partner/detail/SideCard";

export default function PartnerId() {
  return (
    <div className="m-5">
      <Hero title="" subtitle="" />

      <div className="grid grid-cols-1 tab:grid-cols-6 mt-10 gap-20 items-start">
        <div className="col-span-full tab:col-span-4 space-y-10 mx-5">
          <ProfileHeader />
          <ProfileOverview />
        </div>

        <div className="col-span-full tab:col-span-2 tab:justify-self-end mx-5">
          <SideCard />
        </div>
      </div>
    </div>
  );
}
