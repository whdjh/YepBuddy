'use client';

import { useTempoStore } from "@/stores/useTempo";
import { useState, useEffect } from "react";

export default function Exercise() {
  const { selected, tempoFormValues } = useTempoStore();

  const reps = Number(tempoFormValues.reps);
  const concentric = Number(tempoFormValues.concentric);
  const eccentric = Number(tempoFormValues.eccentric);
  const totalSets = Number(tempoFormValues.sets);
  const restTime = Number(tempoFormValues.rests);

  const [remainingRestTime, setRemainingRestTime] = useState<number | null>(null);
  const [currentSet, setCurrentSet] = useState(0);

  const isFinished = currentSet >= totalSets;

  useEffect(() => {
    const startExercise = async () => {
      await new Promise(res => setTimeout(res, 5000));

      let tempSet = 0;

      for (let setIndex = 0; setIndex < totalSets; setIndex++) {
        tempSet++; // 임시 변수만 증가

        for (let rep = 0; rep < reps; rep++) {
          // 템포 실행
          const [firstSound, firstCount, secondSound, secondCount] =
            selected === "concentric"
              ? ["/sound/tempo/pip.mp3", concentric, "/sound/tempo/pik.mp3", eccentric]
              : ["/sound/tempo/pik.mp3", eccentric, "/sound/tempo/pip.mp3", concentric];

          for (let i = 0; i < firstCount; i++) {
            new Audio(firstSound).play();
            await new Promise(res => setTimeout(res, 1000));
          }

          for (let i = 0; i < secondCount; i++) {
            new Audio(secondSound).play();
            await new Promise(res => setTimeout(res, 1000));
          }

          new Audio(`/sound/auto_count/${rep + 1}.mp3`).play();
          await new Promise(res => setTimeout(res, 1000));
        }

        // 휴식
        if (setIndex < totalSets - 1) {
          new Audio("/sound/rest/start.mp3").play();
          setRemainingRestTime(restTime);

          for (let t = restTime; t > 0; t--) {
            setRemainingRestTime(t);
            if (t === 10) new Audio("/sound/rest/end.mp3").play();
            await new Promise(res => setTimeout(res, 1000));
          }
          setRemainingRestTime(null);
        }

        setCurrentSet(tempSet); // 상태는 여기서 한 번만 업데이트
      }
    };

    startExercise();
  }, [selected, reps, concentric, eccentric, totalSets, restTime]);

  return (
    <div className="flex flex-col p-6 gap-10">
      {isFinished ? (
        // 운동 종료 UI
        <>
          <div className="bg-emerald-600/80 p-6 rounded-2xl">
            <p className="text-white text-xl font-semibold text-center">운동 종료</p>
          </div>

          <div className="bg-emerald-600/80 p-6 rounded-2xl">
            <p className="text-white text-xl font-semibold text-center">총 세트수</p>
            <p className="text-white text-3xl font-bold text-center">{totalSets}</p>
          </div>

          <div className="bg-emerald-600/80 p-6 rounded-2xl">
            <p className="text-white text-xl font-semibold text-center">총 반복수</p>
            <p className="text-white text-3xl font-bold text-center">{totalSets * reps}</p>
          </div>

          <div className="bg-emerald-600/80 p-6 rounded-2xl">
            <p className="text-white text-xl font-semibold text-center">템포</p>
            <p className="text-white text-3xl font-bold text-center">
              {selected === "concentric" ? (
                <>
                  수축: {concentric}초<br />
                  이완: {eccentric}초
                </>
              ) : (
                <>
                  이완: {eccentric}초<br />
                  수축: {concentric}초
                </>
              )}
            </p>
          </div>
        </>
      ) : (
        // 운동 진행 UI
        <>
          <div className="bg-emerald-600/80 p-6 rounded-2xl">
            <p className="text-white text-xl font-semibold text-center">현재 운동 종목</p>
            <p className="text-white text-3xl font-bold text-center">{tempoFormValues.name}</p>
          </div>

          <div className="bg-emerald-600/80 p-6 rounded-2xl">
            <p className="text-white text-xl font-semibold text-center">남은 세트수</p>
            <p className="text-white text-3xl font-bold text-center">{totalSets - currentSet}</p>
          </div>

          {remainingRestTime !== null && (
            <div className="bg-emerald-600/80 p-6 rounded-2xl">
              <p className="text-white text-xl font-semibold text-center">남은 휴식시간</p>
              <p className="text-white text-3xl font-bold text-center">{remainingRestTime}초</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
