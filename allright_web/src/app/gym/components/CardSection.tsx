'use client';

import { GymCardProps } from '@/types/Card';
import GymCard from '@/app/gym/components/GymCard';
import VirtuoInfinityScroll from '@/components/common/VirtuoInfinityScroll';

interface CardSectionProps {
  cards: GymCardProps[];
}

export default function CardSection({ cards }: CardSectionProps) {

  const handleLoadMore = () => {
    console.log('load more');
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
      hasMore={true}
    />
  );
}