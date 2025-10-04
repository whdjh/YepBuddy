"use client";

import useQueryTab from "@/hooks/useQueryTab";
import ExerciseTab from "./ExerciseTab";
import type { ExerciseData } from "@/types/Diary";
import EvaluationTab from "./EvaluationTab";
import type { EvaluationData } from "@/types/Diary";
import VideoTab from "./VideoTab";
import WorkDoneTab from "./WorkDoneTab";

const mockEval: EvaluationData = {
  status: { 숙면상태: "중", 컨디션: "상", 활동강도: "중" },
  comment: "오늘은 벤치 프레스 중량이 잘 나왔어요.",
  signatureData: "",
};

const mock: ExerciseData = {
  selectedBodyParts: ["chest", "arms"],
  exercises: [
    {
      id: "1",
      name: "플라이",
      sets: [
        { weight: "60", reps: "10" },
        { weight: "70", reps: "8" },
        { weight: "70", reps: "6" },
      ],
    },
    {
      id: "2",
      name: "렛풀다운",
      sets: [
        { weight: "12.5", reps: "12" },
        { weight: "12.5", reps: "10" },
      ],
    },
  ],
};

const videos: string[] = [];
const photos: string[] = [];


export default function DiaryTabSection() {
  const { activeTab, setTab } = useQueryTab<"exercise" | "evaluation" | "video" | "wod">(
    "tab",
    "exercise",
    ["exercise", "evaluation", "video", "wod"]
  );

  const tabs = [
    { id: 'exercise' as const, label: '운동일지' },
    { id: 'evaluation' as const, label: '평가' },
    { id: 'video' as const, label: '영상' },
    { id: 'wod' as const, label: '오운완' }
  ];

  return (
    <>
      <div className="flex w-full justify-start gap-[1rem] pt-[1rem]">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
              ? 'underline decoration-[#16a34a] decoration-[3px] underline-offset-[6px]'
              : 'text-gray-400 cursor-pointer'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {activeTab === "exercise" && (
          <ExerciseTab data={mock} maxSets={10} />
        )}

        {activeTab === "evaluation" && (
          <EvaluationTab data={mockEval} />
        )}

        {activeTab === "video" && (
          <VideoTab urls={videos} />
        )}

        {activeTab === "wod" && (
          <WorkDoneTab urls={photos} />
        )}
      </div>
    </>
  );
}
