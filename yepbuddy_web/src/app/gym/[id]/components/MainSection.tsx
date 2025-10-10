"use client";

import { DotIcon, HeartIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import CardSection from "./CardSection";
import type { GymDetail } from "@/lib/gyms/getGymById";

interface Props {
  gym: GymDetail | null;
}

export default function MainSection({ gym }: Props) {
  // 날짜를 간단히 YYYY-MM-DD로 표시
  function fmt(dateISO?: string) {
    if (!dateISO) return "";
    const d = new Date(dateISO);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  return (
    <div className="max-w-screen mx-auto flex flex-col items-center gap-10">
      <div className="flex items-center text-sm">
        <div className="flex items-center gap-1">
          <EyeIcon className="w-4 h-4" />
          <span>{gym?.views ?? "-"}</span>
        </div>
        <DotIcon className="w-4 h-4" />
        <span>{gym ? `${fmt(gym.updated_at)} 수정` : "불러오기 실패"}</span>
        <DotIcon className="w-4 h-4" />
        <Button variant="outline">
          <HeartIcon className="w-4 h-4" />
          <span>{gym?.likes_count ?? 0}</span>
        </Button>
      </div>
      <CardSection gymId={gym?.gym_id ?? 0} />
    </div>
  );
}
