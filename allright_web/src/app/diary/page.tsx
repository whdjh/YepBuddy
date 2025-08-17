"use client";

import DiaryCalendar from '@/components/product/diary/Calendar';

export default function Diary() {
  const handleDateChange = (date: Date) => {
    console.log('선택된 날짜:', date);
    // 여기에 날짜 선택 시 처리 로직 추가
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div className="border-2 border-gray-700 rounded-[1rem] text-white max-w-lg w-full p-2">
        <DiaryCalendar onDateChange={handleDateChange} />
      </div>
    </div>
  );
}