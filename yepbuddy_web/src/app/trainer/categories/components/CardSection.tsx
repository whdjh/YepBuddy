'use client';

import { CategoryCardProps } from '@/types/Card';
import CategoryCard from '@/app/trainer/categories/components/CategoryCard';
import VirtuoInfinityScroll from '@/components/common/VirtuoInfinityScroll';

interface CardSectionProps {
  cards: CategoryCardProps[];
}

export default function CardSection({ cards }: CardSectionProps) {

  const handleLoadMore = () => {
    console.log('load more');
  };

  return (
    <VirtuoInfinityScroll
      list={cards}
      item={(card) => (
        <CategoryCard
          id={card.id}
          key={card.id}
          title={card.title}
          location={card.location}
        />
      )}
      emptyText="검색 결과가 없습니다."
      onInView={handleLoadMore}
      hasMore={true}
    />
  );
}