'use client';

import { CardData } from '@/types/Card';
import CardItem from '@/components/common/OldCard/CardItem';
import VirtuoInfinityScroll from '@/components/common/VirtuoInfinityScroll';

interface CardSectionProps {
  cards: CardData[];
}

export default function CardSection({ cards }: CardSectionProps) {
  // TODO: get card API 교체 예정
  const handleLoadMore = () => {
    console.log('load more');
  };

  return (
    <VirtuoInfinityScroll
      list={cards}
      item={(card) => (
        <CardItem
          key={card.id}
          author={card.author}
          location={card.location}
          tags={card.tags}
          thumbnail={card.thumbnail}
        />
      )}
      emptyText="검색 결과가 없습니다."
      onInView={handleLoadMore}
      hasMore={true}
    />
  );
}