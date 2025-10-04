"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";

interface Exercise {
  id: string;
  name: string;
  sets: Array<{ weight: string; reps: string }>;
}

interface ExerciseTableProps {
  exercises: Exercise[];
  onAddExercise: () => void;
  onRemoveLastExercise: () => void;
  canRemove: boolean;
  onUpdateExerciseName: (exerciseId: string, name: string) => void;
  onUpdateSet: (
    exerciseId: string,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) => void;
  onInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  maxSets?: number;
}

const ExerciseTable = memo(
  ({
    exercises,
    onAddExercise,
    onRemoveLastExercise,
    canRemove,
    onUpdateExerciseName,
    onUpdateSet,
    onInputFocus,
    maxSets = 10,
  }: ExerciseTableProps) => {
    return (
      <div className="max-w-[940px]">
        <div className="flex justify-between items-center mb-4">
          <label className="text-base font-medium text-white">운동기록</label>
          <div className="flex gap-2">
            <Button type="button" onClick={onAddExercise} className="px-2 text-sm h-[2rem]">
              운동 추가
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onRemoveLastExercise}
              disabled={!canRemove}
              className="px-2 text-sm h-[2rem]"
            >
              운동 삭제
            </Button>
          </div>
        </div>

        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <div className="flex">
              <div className="w-32 py-2 text-center text-xs font-medium text-gray-300 flex-shrink-0 border-r border-gray-700 flex items-center justify-center">
                운동종목
              </div>
              {Array.from({ length: maxSets }, (_, i) => i + 1).map((setNum) => (
                <div
                  key={setNum}
                  className="w-20 px-1 py-2 text-center text-xs font-medium text-gray-300 flex-shrink-0 border-b border-gray-700 border-r"
                >
                  {setNum}세트
                </div>
              ))}
            </div>

            <div className="flex">
              <div className="w-32 px-3 py-1 flex-shrink-0 border-r border-gray-700 border-b" />
              {Array.from({ length: maxSets }, (_, i) => i + 1).map((setNum) => (
                <div
                  key={`sub-${setNum}`}
                  className="w-20 px-1 py-1 text-center text-xs font-medium text-gray-300 flex-shrink-0 border-b border-gray-700 border-r"
                >
                  <div className="flex gap-1">
                    <span className="w-8">무게</span>
                    <span className="w-8">횟수</span>
                  </div>
                </div>
              ))}
            </div>

            {exercises.map((exercise) => (
              <div key={exercise.id} className="flex border-b border-gray-700 last:border-b-0">
                <div className="w-32 px-3 py-2 flex-shrink-0 border-r border-gray-700">
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => onUpdateExerciseName(exercise.id, e.target.value)}
                    placeholder="운동명 입력"
                    className="w-full px-2 py-1 text-xs border border-gray-700 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none"
                  />
                </div>

                {Array.from({ length: maxSets }, (_, i) => i).map((index) => (
                  <div key={index} className="w-20 px-1 py-2 flex-shrink-0 border-r border-gray-700">
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="무게"
                        value={exercise.sets[index]?.weight ?? "0"}
                        onChange={(e) =>
                          onUpdateSet(exercise.id, index, "weight", e.target.value)
                        }
                        onFocus={onInputFocus}
                        className="w-8 px-1 py-1 text-xs border border-gray-700 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="횟수"
                        value={exercise.sets[index]?.reps ?? "0"}
                        onChange={(e) =>
                          onUpdateSet(exercise.id, index, "reps", e.target.value)
                        }
                        onFocus={onInputFocus}
                        className="w-8 px-1 py-1 text-xs border border-gray-700 rounded text-white placeholder-gray-500 focus:border-[#16a34a] focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

ExerciseTable.displayName = "ExerciseTable";
export default ExerciseTable;
