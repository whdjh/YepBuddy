"use client";

import dynamic from "next/dynamic";
import { Hero } from '@/components/common/Hero';

const DiaryCalendar = dynamic(() => import('@/components/product/diary/Calendar'), { ssr: false });

export default function Diary() {
  const handleDateChange = (date: Date) => {
    console.log('선택된 날짜:', date);
  };

  return (
    <>
      <div className="hidden tab:block">
        <Hero title="운동일지" subtitle="캘린더 형식 운동 기록" />
      </div>
      <div className="flex justify-center items-center p-4">
        <div className="border-2 border-white/10 rounded-[1rem] text-white max-w-lg w-full p-2">
          <DiaryCalendar onDateChange={handleDateChange} />
        </div>
      </div>
    </>
  );
}
