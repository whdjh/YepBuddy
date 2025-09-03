// 8/29 아젠다
// TODO1: Toast 추가 후 메인 페이지 이동
// TODO2: 컴포넌트화
// TODO3: UI 수정
// TODO4: 이건 추후 앱으로 배포할 예정임을 어필해야됨
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

  useEffect(() => {
    const startExercise = async () => {
      await new Promise(res => setTimeout(res, 5000));
      let tempSet = 0;

      for (let setIndex = 0; setIndex < totalSets; setIndex++) {
        tempSet++;

        for (let rep = 0; rep < reps; rep++) {
          // 템포 실행
          const [firstSound, firstCount, secondSound, secondCount] = selected === "concentric"
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

          new Audio(`/sound/en_girl/${rep + 1}.mp3`).play();
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

        setCurrentSet(tempSet);
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
