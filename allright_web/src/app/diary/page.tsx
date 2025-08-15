"use client";

import DiaryCalendar from '@/components/product/diary/Calendar';

export default function Diary() {
  const handleDateChange = (date: Date) => {
    console.log('선택된 날짜:', date);
    // 여기에 날짜 선택 시 처리 로직 추가
  };

  return (
    <div className="border-2 border-white rounded-[1rem] text-white p-2 max-w-lg w-full">
      <DiaryCalendar onDateChange={handleDateChange} />
    </div>
  );
}