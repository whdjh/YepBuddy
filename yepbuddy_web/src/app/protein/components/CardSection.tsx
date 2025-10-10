import ProteinCard from "@/app/protein/components/ProteinCard";
import { ProteinCardProps } from "@/types/Card";
import VirtuoInfinityScroll from "@/components/common/VirtuoInfinityScroll";
import type { Badge } from "@/lib/protein/priceBadge";

interface CardWithBadge extends ProteinCardProps {
  badge?: Badge | null;
  medianDiffPct?: number | null;
}

interface CardSectionProps {
  cards: CardWithBadge[];
}

export function CardSection({ cards }: CardSectionProps) {
  const handleLoadMore = () => {
    console.log("load more");
  };

  const badgeStyle = (color: Badge["color"]) => {
    switch (color) {
      case "green":
        return { bg: "rgba(22,163,74,.15)", fg: "#16a34a", label: "저점" };
      case "red":
        return { bg: "rgba(220,38,38,.15)", fg: "#dc2626", label: "고점" };
      default:
        return { bg: "rgba(59,130,246,.15)", fg: "#3b82f6", label: "중간" };
    }
  };

  return (
    <VirtuoInfinityScroll
      list={cards}
      item={(card) => {
        const badge = card.badge ?? null;
        const style = badge ? badgeStyle(badge.color) : null;

        return (
          <div key={card.id} className="relative">
            {badge && style && (
              <span
                className="absolute z-10 inline-flex items-center rounded-xl px-2 py-1 text-xs font-medium"
                style={{ background: style.bg, color: style.fg }}
                title={badge.reason}
              >
                {style.label}
              </span>
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
