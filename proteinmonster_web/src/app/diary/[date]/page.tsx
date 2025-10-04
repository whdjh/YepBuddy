import { use } from "react";
import DiaryHeader from "./components/DiaryHeader";
import DiaryTabSection from "./components/DiaryTabSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "운동일지상세 | 프로틴몬스터",
  description: "운동일지 상세 페이지 입니다.",
};

export default function DiaryDate({ params }: { params: Promise<{ date: string }> }) {
  const { date: dateParam } = use(params);
  const date = new Date(dateParam);

  return (
    <div>
      <DiaryHeader date={date} />
      <DiaryTabSection />
    </div>
  );
}