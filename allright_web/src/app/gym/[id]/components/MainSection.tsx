import { DotIcon, HeartIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import CardSection from "./CardSection";

export default function MainSection() {
  return (
    <div className="max-w-screen-sm mx-auto flex flex-col items-center gap-10">
      <div className="flex items-center text-sm">
        <div className="flex items-center gap-1">
          <EyeIcon className="w-4 h-4" />
          <span>123</span>
        </div>
        <DotIcon className="w-4 h-4" />
        <span>12 hours ago</span>
        <DotIcon className="w-4 h-4" />
        <Button variant="outline">
          <HeartIcon className="w-4 h-4" />
          <span>12</span>
        </Button>
      </div>
      <CardSection />
    </div>
  );
}
