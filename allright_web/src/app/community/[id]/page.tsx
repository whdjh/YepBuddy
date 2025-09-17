import { ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainSection from "@/components/product/community/detail/MainSection";
import CommentSection from "@/components/product/community/detail/CommentSection";
import HeaderSection from "@/components/product/community/detail/HeaderSection";
import ProfileCard from "@/components/product/community/detail/ProfileCard";

export default function PostPage() {
  return (
    <div className="space-y-10 p-5">
      <HeaderSection />
      <div className="grid grid-cols-6 gap-40 items-start">
        <div className="col-span-4 space-y-10">
          <div className="flex w-full items-start gap-10">
            <Button variant="outline" className="flex flex-col h-14">
              <ChevronUpIcon className="size-4 shrink-0" />
              <span>10</span>
            </Button>
            <div className="space-y-20">
              <MainSection />
              <CommentSection />
            </div>
          </div>
        </div>
        <ProfileCard />
      </div>
    </div>
  );
}