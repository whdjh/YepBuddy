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
    <div className="flex flex-col mb-6">
      <div className="flex justify-between">
        <button onClick={handleBack}>
          <Back />
        </button>
        <h1>{formattedDate}</h1>
      </div>
      <div className="flex w-full justify-start gap-[1.25rem] py-[1.25rem]">
          <button>상태체크</button>
          <button>운동일지</button>
          <button>평가</button>
      </div>
    </div>
  );
}
