'use client';

import { useTempoStore } from "@/stores/useTempo";

export default function Exercise() {
  const { selected, tempoFormValues } = useTempoStore();

  return (
    <div className="p-5 flex flex-col gap-3">
      <h2 className="text-xl font-bold">운동 정보</h2>
      <p>시작 종류: {selected === 'concentric' ? '수축 먼저' : '이완 먼저'}</p>
      <p>수축 시간: {tempoFormValues.eccentric}초</p>
      <p>이완 시간: {tempoFormValues.concentric}초</p>
      <p>운동 횟수: {tempoFormValues.reps}회</p>
      <p>세트 수: {tempoFormValues.sets}세트</p>
      <p>휴식 시간: {tempoFormValues.rests}초</p>
    </div>
  );
}