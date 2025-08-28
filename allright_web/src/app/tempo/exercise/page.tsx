'use client';

import { useTempoStore } from "@/stores/useTempo";
import { useState, useEffect } from "react";

export default function ExerciseUI() {
  const { selected, tempoFormValues } = useTempoStore();

  const reps = Number(tempoFormValues.reps);
  const concentric = Number(tempoFormValues.concentric);
  const eccentric = Number(tempoFormValues.eccentric);
  const totalSets = Number(tempoFormValues.sets);
  const restTime = Number(tempoFormValues.rests);

  const [remainingRestTime, setRemainingRestTime] = useState<number | null>(null);
  const [currentSet, setCurrentSet] = useState(0);

  const concentricTempo = selected === "concentric" ? { count: concentric, sound: "/sound/tempo/pip.mp3" } : { count: eccentric, sound: "/sound/tempo/pik.mp3" };
  const eccentricTempo = selected === "eccentric" ? { count: eccentric, sound: "/sound/tempo/pik.mp3" } : { count: concentric, sound: "/sound/tempo/pip.mp3" };

  useEffect(() => {
    const startExercise = async () => {
      const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

      for (let setIndex = 0; setIndex < totalSets; setIndex++) {
        const currentSetNumber = setIndex + 1;
        setCurrentSet(currentSetNumber);

        // reps 반복
        for (let rep = 0; rep < reps; rep++) {
          // 수축 먼저인 템포
          for (let i = 0; i < concentricTempo.count; i++) {
            new Audio(concentricTempo.sound).play();
            await sleep(1000);
          }

          // 이완 먼저인 템포
          for (let i = 0; i < eccentricTempo.count; i++) {
            new Audio(eccentricTempo.sound).play();
            await sleep(1000);
          }

          // 카운트
          new Audio(`/sound/en_girl/${rep + 1}.mp3`).play();
          await sleep(1000);
        }

        // 마지막 세트가 아니면 휴식
        // TODO: 휴식 시작 알리기, 휴식종료 10초전 알리기
        if (setIndex < totalSets - 1) {
          setRemainingRestTime(restTime);
          for (let t = restTime; t > 0; t--) {
            setRemainingRestTime(t);
            await sleep(1000);
          }
          setRemainingRestTime(null);
        }
      }
    };

    startExercise();
  }, [selected, reps, concentric, eccentric, totalSets, restTime]);

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
          {totalSets - currentSet}
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