import SettingsClient from "@/app/diary/[date]/settings/components/SettingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "운동일지수정 | 옙버디",
  description: "운동일지 수정 페이지 입니다.",
};
export default async function DiaryDateSettings({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date: dateISO } = await params;
  const date = new Date(dateISO);

  return <SettingsClient date={date} />;
}
