"use client";

import { useMemo } from "react";
import { useGyms } from "@/hooks/queries/gyms/useGyms";
import GymCard from "@/app/gym/components/GymCard";
import VirtuoInfinityScroll from "@/components/common/VirtuoInfinityScroll";
import type { GymCardProps } from "@/types/Card";

export default function CardSection() {
  const { data, isLoading, error } = useGyms();

  // 날짜 문자열을 간단히 YYYY-MM-DD로 변환
  function fmt(dateISO: string | undefined) {
    if (!dateISO) return "";
    const d = new Date(dateISO);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const cards: GymCardProps[] = useMemo(() => {
    if (!data) return [];
    return data.map((g) => ({
      id: String(g.gym_id),
      title: g.title,
      location: g.location,
      viewsCount: g.views,
      postedAt: fmt(g.updated_at || g.created_at),
      likesCount: g.likes_count ?? 0,
    }));
  }, [data]);

  if (isLoading) return <div className="text-sm text-muted-foreground">로딩 중</div>;
  if (error) return <div className="text-sm text-red-400">목록을 불러오는 중 오류가 발생했습니다</div>;

  const handleLoadMore = () => {
    // 페이지네이션을 사용하지 않으므로 추가 로딩 없음
  };

  return (
    <VirtuoInfinityScroll
      list={cards}
      item={(card) => (
        <GymCard
          id={card.id}
          key={card.id}
          title={card.title}
          location={card.location}
          viewsCount={card.viewsCount}
          postedAt={card.postedAt}
          likesCount={card.likesCount}
        />
      )}
      emptyText="검색 결과가 없습니다."
      onInView={handleLoadMore}
      hasMore={false}
    />
  );
}
