'use client';

import { TeamCardProps } from '@/types/Card';
import TeamCard from '@/components/common/Card/TeamCard';
import VirtuoInfinityScroll from '@/components/common/VirtuoInfinityScroll';

interface CardSectionProps {
  cards: TeamCardProps[];
}

export default function CardSection({ cards }: CardSectionProps) {
  const handleLoadMore = () => {
    console.log('load more');
  };

  return (
    <VirtuoInfinityScroll
      list={cards}
      item={(card) => (
        <TeamCard
          id={card.id}
          key={card.id}
          leaderUsername={card.leaderUsername}
          leaderAvatarUrl={card.leaderAvatarUrl}
          positions={card.positions}
          teamDescription={card.teamDescription}
        />
      )}
      emptyText="검색 결과가 없습니다."
      onInView={handleLoadMore}
      hasMore={true}
    />
  );
}