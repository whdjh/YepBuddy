import ProteinCard from "@/app/protein/components/ProteinCard";
import { ProteinCardProps } from "@/types/Card";
import VirtuoInfinityScroll from '@/components/common/VirtuoInfinityScroll';

interface CardSectionProps {
  cards: ProteinCardProps[];
}

export function CardSection({ cards }: CardSectionProps) {
  const handleLoadMore = () => {
    console.log('load more');
  };

  return (
    <VirtuoInfinityScroll
      list={cards}
      item={(card) => (
        <ProteinCard
          key={card.id}
          id={card.id}
          title={card.title}
          weight={card.weight}
          avatarFile={card.avatarFile}
          topic={card.topic}
          taste={card.taste}
          price={card.price}
          likesCount={card.likesCount}
        />
      )}
      emptyText="검색 결과가 없습니다."
      onInView={handleLoadMore}
      hasMore={true}
      layout="flex"
    />
  );
}