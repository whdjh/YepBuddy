import { ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainSection from "@/app/_dummypage/community/[id]/components/MainSection";
import CommentSection from "@/app/_dummypage/community/[id]/components/CommentSection";
import HeaderSection from "@/app/_dummypage/community/[id]/components/HeaderSection";
import ProfileCard from "@/app/_dummypage/community/[id]/components/ProfileCard";

export default function PostPage() {
  return (
    <div className="space-y-10 p-2 tab:p-5">
      <HeaderSection />

      <div className="grid grid-cols-1 tab:grid-cols-6 gap-10 tab:gap-40 items-start">
        <div className="col-span-full tab:col-span-4 space-y-10 min-w-0">
          <div className="flex w-full items-start gap-6 tab:gap-10">
            <Button variant="outline" className="flex flex-col h-14">
              <ChevronUpIcon className="size-4 shrink-0" />
              <span>10</span>
            </Button>
            <div className="min-w-0 tab:space-y-20 space-y-5">
              <MainSection />
              <hr className="w-full border border-white/10" />
              <CommentSection />
            </div>
          </div>
        </div>

        <div className="hidden tab:block tab:col-span-2">
          <ProfileCard />
        </div>
      </div>
    </div>
  );
}
