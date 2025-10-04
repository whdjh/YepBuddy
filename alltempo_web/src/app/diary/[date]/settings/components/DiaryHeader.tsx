"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiaryHeaderProps {
  date: Date;
  onBack?: () => void;
  saveDisabled?: boolean;
}

export default function DiaryHeader({ date, onBack, saveDisabled }: DiaryHeaderProps) {
  const router = useRouter();
  const formattedDate = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const toYmd = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const handleBack = () => {
    if (onBack) onBack();
    else router.push(`/diary/${toYmd(date)}`);
  };

  return (
    <div className="flex justify-center items-center gap-2">
      <Button
        type="button"
        onClick={handleBack}
        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        variant={"destructive"}
      >
        <ArrowLeft />
      </Button>
      <h1 className="text-xl font-semibold text-white">{formattedDate}</h1>
      <Button
        type="submit"
        className="h-[2rem] px-4 text-sm"
        disabled={saveDisabled}
      >
        저장
      </Button>
    </div>
  );
}
