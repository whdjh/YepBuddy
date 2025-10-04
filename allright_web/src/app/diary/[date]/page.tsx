"use client";

import { use } from "react";
import DiaryHeader from "./components/DiaryHeader";
import DiaryTabSection from "./components/DiaryTabSection";

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