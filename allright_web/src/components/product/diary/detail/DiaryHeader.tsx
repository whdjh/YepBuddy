"use client";

import { useRouter } from 'next/navigation';
import Back from '@/asset/ic/ic_back.svg';

interface DiaryHeaderProps {
  date: Date;
  onBack?: () => void;
}

export default function DiaryHeader({ date, onBack }: DiaryHeaderProps) {
  const router = useRouter();

  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/diary');
    }
  };

  return (
    <div className="flex justify-between items-center">
      <button onClick={handleBack} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
        <Back />
      </button>
      <h1 className="text-xl font-semibold text-white">{formattedDate}</h1>
      <div className="w-10" />
    </div>
  );
}
