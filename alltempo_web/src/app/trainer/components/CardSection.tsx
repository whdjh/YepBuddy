'use client';

import { TrainerCardProps } from '@/types/Card';
import TrainerCard from '@/app/trainer/components/TrainerCard';
import VirtuoInfinityScroll from '@/components/common/VirtuoInfinityScroll';

interface CardSectionProps {
  cards: TrainerCardProps[];
}

export default function CardSection({ cards }: CardSectionProps) {
  // TODO: 추천수에 비례해서 상위부터 보여지게 하면될듯

  // TODO: get card API 교체 예정
  const handleLoadMore = () => {
    console.log('load more');
  };

  return (
    <VirtuoInfinityScroll
      list={cards}
      item={(card) => (
        <TrainerCard
          id={card.id}
          key={card.id}
          avatarFile={card.avatarFile}
          name={card.name}
          description={card.description}
          commentsCount={card.commentsCount}
          viewsCount={card.viewsCount}
          votesCount={card.votesCount}
        />
      )}
      emptyText="검색 결과가 없습니다."
      onInView={handleLoadMore}
      hasMore={true}
      layout="flex"
    />
  );
}