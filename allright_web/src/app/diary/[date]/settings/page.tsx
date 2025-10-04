"use client";

import { use } from "react";
import { FormProvider, useForm } from "react-hook-form";
import useQueryTab from "@/hooks/useQueryTab";
import DiaryHeader from "@/app/diary/[date]/settings/components/DiaryHeader";
import DiaryTabNavigation from "@/app/diary/[date]/settings/components/DiaryTabNavigation";
import ExerciseDiaryTab from "@/app/diary/[date]/settings/components/ExerciseDiaryTab";
import EvaluationTab from "@/app/diary/[date]/settings/components/EvaluationTab";
import VideoTab from "@/app/diary/[date]/settings/components/VideoTab";
import WorkDoneTab from "@/app/diary/[date]/settings/components/WorkDoneTab";
import { EvaluationStatus } from "@/types/Diary";
import { DiaryForm } from "@/types/Form";

const DEFAULT_STATUS: EvaluationStatus = { 숙면상태: "중", 컨디션: "중", 활동강도: "중" };

export default function DiaryDateSettings({ params }: { params: Promise<{ date: string }> }) {
  const { date: dateParam } = use(params);
  const date = new Date(dateParam);

  // 이 부분 클라리언트 컴포넌트로 분리 필요
  const { activeTab, setTab } = useQueryTab<"exercise" | "evaluation" | "video" | "wod">(
    "tab",
    "exercise",
    ["exercise", "evaluation", "video", "wod"]
  );

  const methods = useForm<DiaryForm>({
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      dateISO: date.toISOString().split("T")[0],
      exercise: { selectedBodyParts: ["chest"], exercises: [] },
      evaluation: { status: DEFAULT_STATUS, comment: "", signatureData: "" },
      videos: [],
      photos: [],
    },
  });

  // watch로 값을 구독해야 렌더가 갱신
  const exercise = methods.watch("exercise");
  const evaluation = methods.watch("evaluation");
  const videos = methods.watch("videos");
  const photos = methods.watch("photos");

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

          {activeTab === "video" && (
            <VideoTab
              urls={videos}
              onChange={(nextUrls) =>
                methods.setValue("videos", nextUrls, { shouldDirty: true })
              }
            />
          )}

          {activeTab === "wod" && (
            <WorkDoneTab
              urls={photos}
              onChange={(nextUrls) =>
                methods.setValue("photos", nextUrls, { shouldDirty: true })
              }
            />
          )}
        </div>
      </form>
    </FormProvider>
  );
}
