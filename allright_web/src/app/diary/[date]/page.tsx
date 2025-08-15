"use client";

import { useRouter } from 'next/navigation';
import { use } from 'react';
import Back from '@/asset/ic/ic_back.svg'

export default function DiaryDetail({ params }: { params: Promise<{ date: string }> }) {
  const router = useRouter();

  const { date: dateParam } = use(params);
  const adjustedDateParam = new Date(dateParam);
  adjustedDateParam.setDate(adjustedDateParam.getDate());
  const date = adjustedDateParam;
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
    <div className="flex items-center justify-between mb-6">
      <button onClick={handleBack}>
        <Back />
      </button>
      <h1>{formattedDate}</h1>
    </div>
  );
}
