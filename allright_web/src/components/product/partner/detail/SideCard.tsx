import { DotIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SideCard() {
  return (
    <div className="col-span-2 space-y-5 mt-32 sticky top-20 p-6 border border-white/10 rounded-lg">
      <div className="flex flex-col">
        <span className=" text-sm text-muted-foreground">시간대</span>
        <span className="text-2xl font-medium">10:00 - 12:00</span>
      </div>
      <div className="flex flex-col">
        <span className=" text-sm text-muted-foreground">위치</span>
        <span className="text-2xl font-medium">온라인</span>
      </div>
      <div className="flex flex-col">
        <span className=" text-sm text-muted-foreground">타입</span>
        <span className="text-2xl font-medium">정기적</span>
      </div>
      <div className="flex">
        <span className=" text-sm text-muted-foreground">
          2일 전에 올림
        </span>
        <DotIcon className="size-4" />
        <span className=" text-sm text-muted-foreground">39명 확인</span>
      </div>
      <Button className="w-full">함께하기</Button>
    </div>
  );
}