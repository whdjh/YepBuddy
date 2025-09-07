"use client";

import { Button } from "@/components/ui/button";

interface ExerciseControlsProps {
  onAddExercise: () => void;
  onRemoveLastExercise: () => void;
  canRemove: boolean;
}

export default function ExerciseControls({ 
  onAddExercise, 
  onRemoveLastExercise, 
  canRemove 
}: ExerciseControlsProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <label className="text-base font-medium text-white">운동기록</label>
      <div className="flex gap-2">
        <Button
          onClick={onAddExercise}
          className="px-2 text-sm h-[2rem]"
        >
          운동 추가
        </Button>
        <Button
          variant="outline"
          onClick={onRemoveLastExercise}
          disabled={!canRemove}
          className="px-2 text-sm h-[2rem]"
        >
          운동 삭제
        </Button> 
      </div>
    </div>
  );
}
