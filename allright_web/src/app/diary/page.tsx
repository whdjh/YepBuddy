import DiaryCalendar from '@/app/diary/components/Calendar';
import { Hero } from '@/components/common/Hero';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "운동일지 | Allright",
  description: "운동일지 페이지 입니다.",
};


export default function Diary() {
  return (
    <>
      <div className="hidden tab:block">
        <Hero title="운동일지" subtitle="캘린더 형식 운동 기록" />
      </div>
      <div className="flex justify-center items-center p-4">
        <div className="border-2 border-white/10 rounded-[1rem] text-white max-w-lg w-full p-2">
          <DiaryCalendar />
        </div>
      </div>
    </>
  );
}
