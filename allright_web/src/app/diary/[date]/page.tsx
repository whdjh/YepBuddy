"use client";

import { use } from "react";
import { FormProvider, useForm } from "react-hook-form";
import useQueryTab from "@/hooks/useQueryTab";
import DiaryHeader from "@/app/diary/[date]/components/DiaryHeader";
import DiaryTabNavigation from "@/app/diary/[date]/components/DiaryTabNavigation";
import ExerciseDiaryTab from "@/app/diary/[date]/components/ExerciseDiaryTab";
import EvaluationTab from "@/app/diary/[date]/components/EvaluationTab";
import VideoTab from "@/app/diary/[date]/components/VideoTab";
import type { ExerciseData, EvaluationData, EvaluationStatus } from "@/types/Diary";

interface DiaryForm {
  dateISO: string;
  exercise: ExerciseData;
  evaluation: EvaluationData;
  videos: string[];
}

const DEFAULT_STATUS: EvaluationStatus = { 숙면상태: "중", 컨디션: "중", 활동강도: "중" };

export default function DiaryDate({ params }: { params: Promise<{ date: string }> }) {
  const { date: dateParam } = use(params);
  const date = new Date(dateParam);

  const { activeTab, setTab } = useQueryTab<"exercise" | "evaluation" | "video">(
    "tab",
    "exercise",
    ["exercise", "evaluation", "video"]
  );

  const methods = useForm<DiaryForm>({
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      dateISO: date.toISOString().split("T")[0],
      exercise: { selectedBodyParts: ["chest"], exercises: [] },
      evaluation: { status: DEFAULT_STATUS, comment: "", signatureData: "" },
      videos: [],
    },
  });

  // watch로 값을 구독해야 렌더가 갱신된다
  const exercise = methods.watch("exercise");
  const evaluation = methods.watch("evaluation");

  const canSave = (() => {
    if (!exercise || !exercise.exercises?.length) return false;
    return exercise.exercises.some((ex) => {
      const hasName = ex.name.trim() !== "";
      const hasValidSet =
        ex.sets?.some(
          (s) =>
            (s.weight.trim() !== "" && s.weight !== "0") ||
            (s.reps.trim() !== "" && s.reps !== "0")
        ) ?? false;
      return hasName || hasValidSet;
    });
  })();

  const onSubmit = () => {
    const payload = methods.getValues();
    console.log("SAVE PAYLOAD:", payload);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col mb-6 p-5">
        <DiaryHeader date={date} saveDisabled={!canSave} />
        <DiaryTabNavigation activeTab={activeTab} onTabChange={setTab} />

        <div className="mt-4">
          {activeTab === "exercise" && (
            <ExerciseDiaryTab
              data={exercise}
              onChange={(next) =>
                methods.setValue("exercise", next, { shouldDirty: true })
              }
            />
          )}

          {activeTab === "evaluation" && (
            <EvaluationTab
              data={evaluation}
              onChange={(next) =>
                methods.setValue("evaluation", next, { shouldDirty: true })
              }
            />
          )}

          {activeTab === "video" && <VideoTab />}
        </div>
      </form>
    </FormProvider>
  );
}
