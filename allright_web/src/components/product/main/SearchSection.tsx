'use client';

import { useState, useMemo } from 'react';
import SearchInput from "@/components/common/SearchInput";
import CardSection from './CardSection';
import { MOCK_CARDS } from '@/mock/cardData';

export default function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: API 교체 예정 - 현재는 목데이터로 검색
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) {
      return MOCK_CARDS;
    }

    const query = searchQuery.toLowerCase();
    
    return MOCK_CARDS.filter((card) => 
      card.author.toLowerCase().includes(query) ||
      card.location.toLowerCase().includes(query) ||
      card.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex flex-col gap-4">
      <SearchInput onSearch={handleSearch} placeholder="검색어를 입력해주세요." />
      <CardSection cards={filteredCards} />
    </div>
  );
}