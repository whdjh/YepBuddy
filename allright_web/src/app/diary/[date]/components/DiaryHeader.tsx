"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex justify-center items-center gap-2">
      <button
        type="button"
        onClick={handleBack}
        className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
        <ArrowLeft />
      </button>
      <h1 className="text-xl font-semibold text-white">{formattedDate}</h1>
      <Button 
        type="submit"
        className="h-[2rem] px-4 text-sm"
      >
        저장
      </Button>
    </div>
  );
}
