import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ProfileCard() {
  return (
    <div className="col-span-2 space-y-5 border rounded-lg p-6 shadow-sm">
      <div className="flex gap-5">
        <Avatar className="size-14">
          <AvatarFallback>J</AvatarFallback>
          <AvatarImage src="https://github.com/gym.png" />
        </Avatar>
        <div className="flex flex-col">
          <h4 className="text-lg font-medium">이주훈</h4>
          <Badge variant="secondary">전문가</Badge>
        </div>
      </div>
      <div className="gap-2 text-sm flex flex-col">
        <span>3달전 가입</span>
        <span>10명의 PT</span>
      </div>
      <Button variant="outline" className="w-full">
        팔로우
      </Button>
    </div>
  );
}