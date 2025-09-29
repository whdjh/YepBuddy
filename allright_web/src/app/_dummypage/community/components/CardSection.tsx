import PostCard from "@/components/common/Card/ProteinCard";
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
        <PostCard
          key={card.id}
          id={card.id}
          title={card.title}
          author={card.author}
          authorAvatarUrl={card.authorAvatarUrl}
          category={card.category}
          postedAt={card.postedAt}
          votesCount={card.votesCount}
          expanded
        />
      )}
      emptyText="검색 결과가 없습니다."
      onInView={handleLoadMore}
      hasMore={true}
      layout="flex"
    />
  );
}