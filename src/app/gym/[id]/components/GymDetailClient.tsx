"use client";

import { Hero } from "@/components/common/Hero";
import MainSection from "@/app/gym/[id]/components/MainSection";
import { useGymById } from "@/hooks/queries/gyms/useGymById";

interface Props {
  gymId: number;
}

export default function GymDetailClient({ gymId }: Props) {
  const { data: gym, isLoading, error } = useGymById(gymId);

  const title = gym?.title ?? (isLoading ? "로딩 중" : "헬스장");
  const subtitle = gym?.location ?? (error ? "불러오기 실패" : "");

  return (
    <div className="p-2 tab:p-5 space-y-5 tab:space-y-10">
      <Hero title={title} subtitle={subtitle} />
      <MainSection gym={gym ?? null} />
    </div>
  );
}
