'use client';

import { useTempoStore } from "@/stores/useTempo";
import { useState, useEffect } from "react";

export default function ExerciseUI() {
  // selcted, sets, rests, name, conce~, e~, reps
  const { selected, tempoFormValues } = useTempoStore();

  const [remainingRestTime, setRemainingRestTime] = useState<number | null>(Number(tempoFormValues.rests));
  const [currentSet, setCurrentSet] = useState(1);

  useEffect(() => {
    if (remainingRestTime === null) {
      return;
    }
  
    // 0이하면 currentSet이 1증가
    if (remainingRestTime <= 0) {
      // 세트 증가
      setCurrentSet((prev) => prev + 1);

      // 세트가 끝났으면 휴식시간 초기화
      if (currentSet < Number(tempoFormValues.sets)) {
        setRemainingRestTime(Number(tempoFormValues.rests));
      }
      // TODO: 모든 세트 끝나면 모달이 띄어지고 운동 추가 or 종료 의사를 물음
      // TODO: 운동 추가시 tempo페이지로 이동
      // TODO: 운동 종료시 dairy페이지로 이동
      else {
        setRemainingRestTime(null);
      }
      return; 
    }

    const timer = setInterval(() => {
      setRemainingRestTime((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingRestTime]);


  return (
    <div className="flex flex-col p-6 gap-10">
      <div className="bg-emerald-600/80 p-6 rounded-2xl">
        <p className="text-white text-xl font-semibold text-center">
          현재 운동 종목
        </p>
        <p className="text-white text-3xl font-bold text-center">
          {tempoFormValues.name}
        </p>
      </div>
      {/* 남은 세트수 */}
      <div className="bg-emerald-600/80 p-6 rounded-2xl">
        <p className="text-white text-xl font-semibold text-center">
          남은 세트수
        </p>
        <p className="text-white text-3xl font-bold text-center">
          {Number(tempoFormValues.sets) - currentSet}
        </p>
      </div>

      {/* 남은 휴식시간 */}
      {remainingRestTime !== null && (
        <div className="bg-emerald-600/80 p-6 rounded-2xl">
          <p className="text-white text-xl font-semibold text-center">
            남은 휴식시간
          </p>
          <p className="text-white text-3xl font-bold text-center">
            {remainingRestTime}초
          </p>
        </div>
      )}
    </div>
  );
}
