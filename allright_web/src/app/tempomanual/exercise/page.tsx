'use client';

import { useTempoStore } from '@/stores/useTempo';
import { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function Exercise() {
  const { tempoFormValues } = useTempoStore();
  const reps = Number(tempoFormValues.reps);

  const [currentSet, setCurrentSet] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleStartSet = async () => {
    if (isFinished || isButtonDisabled) return;

    // 1. 세트 증가
    setCurrentSet((prev) => prev + 1);

    // 2. 버튼 비활성화, 운동중 상태
    setIsButtonDisabled(true);
    setIsRunning(true);

    // 3. 10초 대기 후 음성 재생
    await new Promise((res) => setTimeout(res, 10000));
    const audioPath = `/sound/manual_count/rep_${reps}.mp3`;
    const audio = new Audio(audioPath);
    audio.play();

    // 4. 음성 재생 완료 후 버튼 활성화
    audio.onended = () => {
      setIsButtonDisabled(false);
      setIsRunning(false);
    };
  };

  const handleFinish = () => {
    setIsFinished(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {!isFinished && (
        <div className="bg-red-500 text-black p-3 rounded-md text-center font-bold">
          ⚠️ 모바일 브라우저에서는 소리 재생이 불안정할 수 있습니다.
        </div>
      )}

      {!isFinished ? (
        <>
          <div className="bg-emerald-600/80 p-6 rounded-2xl">
            <p className="text-white text-xl font-semibold text-center">현재 운동 종목</p>
            <p className="text-white text-3xl font-bold text-center">{tempoFormValues.name}</p>
          </div>

          <div className="bg-emerald-600/80 p-6 rounded-2xl">
            <p className="text-white text-xl font-semibold text-center">현재 세트수</p>
            <p className="text-white text-3xl font-bold text-center">{currentSet}</p>
          </div>

          {/* 버튼 */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleStartSet}
              disabled={isButtonDisabled}
            >
              {isRunning ? '운동중' : '운동 시작'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleFinish}
              disabled={isButtonDisabled || isRunning}
            >
              운동 종료
            </Button>
          </div>
        </>
      ) : (
        // 운동 종료 UI
        <>
          <div className="bg-emerald-600/80 p-6 rounded-2xl text-center text-white font-bold">
            운동 종료
          </div>


          <div className="bg-emerald-600/80 p-6 rounded-2xl">
            <p className="text-white text-xl font-semibold text-center">총 세트수</p>
            <p className="text-white text-3xl font-bold text-center">{currentSet}</p>
          </div>
        </>
      )}
    </div>
  );
}
