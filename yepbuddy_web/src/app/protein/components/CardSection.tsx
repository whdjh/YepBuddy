import ProteinCard from "@/app/protein/components/ProteinCard";
import { ProteinCardProps } from "@/types/Card";
import VirtuoInfinityScroll from "@/components/common/VirtuoInfinityScroll";
import type { Badge as BadgeType } from "@/lib/priceBadge";
import { Badge } from "@/components/ui/badge";

interface CardWithBadge extends ProteinCardProps {
  badge?: BadgeType | null;
  medianDiffPct?: number | null;
}

interface CardSectionProps {
  cards: CardWithBadge[];
}

export function CardSection({ cards }: CardSectionProps) {
  const handleLoadMore = () => {
    console.log("load more");
  };

  return (
    <VirtuoInfinityScroll
      list={cards}
      item={(card) => {
        const badge = card.badge ?? null;

        return (
          <div key={card.id} className="relative">
            {badge && (
              <Badge
                className="absolute left-2 top-2 z-10"
                variant={
                  badge.color === "green" ? "default" :
                    badge.color === "red" ? "red" :
                      "blue"
                }
                title={badge.reason}
                aria-label={badge.reason}
              >
                {badge.kind === "low" ? "저점" : badge.kind === "high" ? "고점" : "중간"}
                {typeof card.medianDiffPct === "number" && isFinite(card.medianDiffPct) ? (
                  <span className="ml-1 opacity-80">
                    {card.medianDiffPct > 0 ? "" : ""}
                    {Math.round(card.medianDiffPct)}%
                  </span>
                ) : null}
              </Badge>
            )}

            <ProteinCard
              id={card.id}
              title={card.title}
              weight={card.weight}
              avatarFile={card.avatarFile}
              topic={card.topic}
              taste={card.taste}
              price={card.price}
              priceText={card.priceText}
              likesCount={card.likesCount}
            />
          </div>
        );
      }}
      emptyText="검색 결과가 없습니다."
      onInView={handleLoadMore}
      hasMore={true}
      layout="flex"
    />
  );
}
