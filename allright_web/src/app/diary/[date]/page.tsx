"use client";

import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { use } from 'react';
import Back from '@/asset/ic/ic_back.svg'

export default function DiaryDetail({ params }: { params: Promise<{ date: string }> }) {
  const router = useRouter();

  const { date: dateParam } = use(params);
  const date = new Date(dateParam);
  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const handleBack = () => {
    router.push('/diary');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-5 mt-[5.5rem] mx-[0.5rem] rounded-[1rem]">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
        >
          <Back />
        </button>
        <h1>{formattedDate}</h1>
      </div>
    </div>
  );
}
