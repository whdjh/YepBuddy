"use client";

import { useRouter } from 'next/navigation';
import Back from '@/asset/ic/ic_back.svg';
import Button from '@/components/common/Button';

interface DiaryHeaderProps {
  date: Date;
  onBack?: () => void;
  onSave?: () => void;
}

export default function DiaryHeader({ date, onBack, onSave }: DiaryHeaderProps) {
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
      <button onClick={handleBack} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
        <Back />
      </button>
      <h1 className="text-xl font-semibold text-white">{formattedDate}</h1>
      <Button 
        variant="solid" 
        onClick={onSave}
        className="h-[2rem] px-4 text-sm"
      >
        저장
      </Button>
    </div>
  );
}
