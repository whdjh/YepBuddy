'use client';

import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function SideCard() {
  const handleFollowClick = () => {
    alert("팔로우 버튼이 클릭되었습니다.");
  };

  return (
    <div className="col-span-full tab:col-span-2">
      <div className="bg-transparent col-span-2 space-y-5 border border-white/10 rounded-lg p-6 shadow-sm">
        <div className="flex gap-5">
          <Avatar className="size-14">
            <AvatarFallback>N</AvatarFallback>
            <AvatarImage src="https://github.com/gym.png" />
          </Avatar>
          <div className="flex flex-col">
            <h4 className="text-lg font-medium">트레이너 이름</h4>
            <Badge>트레이너</Badge>
          </div>
        </div>
        <Button
          type="button"
          className="w-full"
          onClick={handleFollowClick}
        >
          팔로우
        </Button>
      </div>
    </div>
  );
}