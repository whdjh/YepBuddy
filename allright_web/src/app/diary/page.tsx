"use client";

import DiaryCalendar from '@/components/product/diary/Calendar';

export default function Diary() {
  const handleDateChange = (date: Date) => {
    console.log('선택된 날짜:', date);
    // 여기에 날짜 선택 시 처리 로직 추가
  };

  return (
    <main className="mt-[5.5rem] mx-[0.5rem] bg-[#242429] p-[1rem] rounded-[0.5rem] min-h-[calc(100vh-5.5rem-1rem)]">
      <div className="border-2 border-white rounded-[1rem] text-white p-2 max-w-md mx-auto">
          <DiaryCalendar onDateChange={handleDateChange} />
      </div>
    </main>
  );
}