import { DotIcon, HeartIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MainSection() {
  return (
    <div className="max-w-screen-sm mx-auto flex flex-col items-center gap-10">
      <p className="italic text-center">
        아이디어 내용
      </p>
      <div className="flex items-center text-sm">
        <div className="flex items-center gap-1">
          <EyeIcon className="w-4 h-4" />
          <span>123</span>
        </div>
        <DotIcon className="w-4 h-4" />
        <span>12 hours ago</span>
        <DotIcon className="w-4 h-4" />
        <Button variant="outline" className="border border-white/10">
          <HeartIcon className="w-4 h-4" />
          <span>12</span>
        </Button>
      </div>
      <Button size="lg">루틴 결제하기 &rarr;</Button>
    </div>
  );
}
