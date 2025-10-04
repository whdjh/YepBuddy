"use client";

import type { ExerciseData } from "@/types/Diary";

interface ExerciseDiaryViewProps {
  data: ExerciseData;
  maxSets?: number;
}

export default function ExerciseSection({ data, maxSets = 10 }: ExerciseDiaryViewProps) {
  const partsLabel: Record<string, string> = {
    chest: "가슴",
    back: "등",
    legs: "하체",
    arms: "팔",
    shoulders: "어깨",
    carbo: "유산소",
  };

  return (
    <div className="text-white max-w-[940px]">
      <div className="mb-6">
        <label className="text-base font-medium mb-3 block">오늘 운동 부위</label>
        <div className="flex gap-2 flex-wrap">
          {(data.selectedBodyParts ?? []).map((p) => (
            <span
              key={p}
              className="px-3 py-1.5 text-sm rounded-md border border-white/10 bg-white/5"
            >
              {partsLabel[p] ?? p}
            </span>
          ))}
        </div>
      </div>

      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          {/* 헤더 1행: 제목 셀 + 세트 번호 */}
          <div className="flex">
            <div className="w-32 py-2 text-center text-xs font-medium text-gray-300 flex-shrink-0 border-r border-gray-700 flex items-center justify-center">
              운동종목
            </div>
            {Array.from({ length: maxSets }, (_, i) => i + 1).map((setNum) => (
              <div
                key={`h1-${setNum}`}
                className="w-20 px-1 py-2 text-center text-xs font-medium text-gray-300 flex-shrink-0 border-b border-gray-700 border-r"
              >
                {setNum}세트
              </div>
            ))}
          </div>

          {/* 헤더 2행: 무게/횟수 라벨 */}
          <div className="flex">
            <div className="w-32 px-3 py-1 flex-shrink-0 border-r border-gray-700 border-b" />
            {Array.from({ length: maxSets }, (_, i) => i + 1).map((setNum) => (
              <div
                key={`h2-${setNum}`}
                className="w-20 px-1 py-1 text-center text-xs font-medium text-gray-300 flex-shrink-0 border-b border-gray-700 border-r"
              >
                <div className="flex gap-1 justify-center">
                  <span className="w-8">무게</span>
                  <span className="w-8">횟수</span>
                </div>
              </div>
            ))}
          </div>

          {(data.exercises ?? []).map((ex) => (
            <div key={ex.id} className="flex border-b border-gray-700 last:border-b-0">
              <div className="w-32 px-3 py-2 flex-shrink-0 border-r border-gray-700 text-xs">
                {ex.name}
              </div>

              {Array.from({ length: maxSets }, (_, idx) => {
                const set = ex.sets?.[idx];
                const weight = set?.weight ?? "";
                const reps = set?.reps ?? "";
                const isEmpty =
                  !weight ||
                  !reps ||
                  ((weight === "0" || weight === "0.0") && (reps === "0" || reps === "0.0"));

                return (
                  <div
                    key={`r-${ex.id}-${idx}`}
                    className="w-20 px-1 py-2 flex-shrink-0 border-r border-gray-700"
                  >
                    <div className="flex gap-1 justify-center text-xs">
                      <span className="w-8 text-gray-200 text-center">
                        {isEmpty ? "-" : weight}
                      </span>
                      <span className="w-8 text-gray-200 text-center">
                        {isEmpty ? "-" : reps}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
