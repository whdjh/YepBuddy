import { Metadata } from "next";
import GymDetailClient from "@/app/gym/[id]/components/GymDetailClient";

export const metadata: Metadata = {
  title: "헬스장 상세 | 옙버디",
  description: "해당 헬스장 내부기구를 확인할 수 있는 페이지 입니다.",
};

export default async function GymIdPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const gymId = Number(id);
  return <GymDetailClient gymId={gymId} />;
}