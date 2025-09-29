"use client";

import { Button } from "@/components/ui/button";
import { ReviewCard } from "./ReviewCard";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReviewModal from "@/app/trainer/[id]/components/ReviewModal";

export default function ProductReviewsPage() {
  return (
    <Dialog>
      <div className="space-y-10 max-w-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">10개의 리뷰 </h2>
          <DialogTrigger asChild>
            <Button variant={"outline"}>리뷰작성</Button>
          </DialogTrigger>
        </div>
        <div className="space-y-20">
          {Array.from({ length: 10 }).map((_, i) => (
            <ReviewCard
              key={i}
              username="이주훈"
              handle="@wngns9807"
              avatarUrl="https://github.com/gym.png"
              rating={5}
              content="너무 친절히 알려줘요"
              postedAt="10일전"
            />
          ))}
        </div>
      </div>
      <ReviewModal />
    </Dialog>
  );
}
