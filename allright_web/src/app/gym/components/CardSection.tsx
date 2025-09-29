'use client';

import { IdeasCardProps } from '@/types/Card';
import IdeaCard from '@/components/common/Card/GymCard';
import VirtuoInfinityScroll from '@/components/common/VirtuoInfinityScroll';

interface CardSectionProps {
  cards: IdeasCardProps[];
}

export default function CardSection({ cards }: CardSectionProps) {

  const handleLoadMore = () => {
    console.log('load more');
  };

  return (
    <VirtuoInfinityScroll
      list={cards}
      item={(card) => (
        <IdeaCard
          id={card.id}
          key={card.id}
          title={card.title}
          viewsCount={card.viewsCount}
          postedAt={card.postedAt}
          likesCount={card.likeCount}
          claimed={card.claimed}
        />
      )}
      emptyText="검색 결과가 없습니다."
      onInView={handleLoadMore}
      hasMore={true}
    />
  );
}