'use client';

import { CardData } from '@/mock/cardData';
import CardItem from '@/components/common/Card/CardItem';

interface CardSectionProps {
  cards: CardData[];
}

export default function CardSection({ cards }: CardSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((card) => (
        <div key={card.id}>
          <CardItem
            author={card.author}
            location={card.location}
            tags={card.tags}
            thumbnail={card.thumbnail}
          />
        </div>
      ))}
    </div>
  );
}