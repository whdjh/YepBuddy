'use client';

import { PartnerCardProps } from '@/types/Card';
import PartnerCard from '@/components/common/Card/PartnerCard';
import VirtuoInfinityScroll from '@/components/common/VirtuoInfinityScroll';

interface CardSectionProps {
  cards: PartnerCardProps[];
}

export default function CardSection({ cards }: CardSectionProps) {
  const handleLoadMore = () => {
    console.log('load more');
  };

  return (
    <VirtuoInfinityScroll
      list={cards}
      item={(card) => (
        <PartnerCard
          key={card.id}
          id={card.id}
          gym="NONGYM"
          gymLogoUrl="https://github.com/facebook.png"
          gymHq="경기도, 용인시"
          title="하체운동"
          postedAt="12 hours ago"
          type="everyday"
          positionLocation="Remote"
          time="12:00 - 14:00"
        />
      )}
      emptyText="검색 결과가 없습니다."
      onInView={handleLoadMore}
      hasMore={true}
    />
  );
}