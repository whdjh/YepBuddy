"use client";

import useQueryTab from "@/hooks/useQueryTab";
import ExerciseSection from "./ExerciseSection";
import type { ExerciseData } from "@/types/Diary";

const mock: ExerciseData = {
  selectedBodyParts: ["chest", "arms"],
  exercises: [
    {
      id: "e1",
      name: "벤치프레스",
      sets: [
        { weight: "60", reps: "10" },
        { weight: "70", reps: "8" },
        { weight: "70", reps: "6" },
      ],
    },
    {
      id: "e2",
      name: "덤벨컬",
      sets: [
        { weight: "12.5", reps: "12" },
        { weight: "12.5", reps: "10" },
      ],
    },
  ],
};

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
          <ExerciseSection data={mock} maxSets={10} />
        )}

        {activeTab === "evaluation" && (
          <div>평가</div>
        )}

        {activeTab === "video" && (
          <div>운동영상</div>
        )}

        {activeTab === "wod" && (
          <div>오운완</div>
        )}
      </div>
    </>
  );
}
